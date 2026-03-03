# Vector Search in PostgreSQL (pgvector)

## HNSW vs IVFFlat

| Aspect | HNSW | IVFFlat |
|--------|------|---------|
| Build time | Slower | Faster |
| Query speed | Generally faster | Depends on probes |
| Recall | Higher | Lower (tune with probes) |
| Updates | Better for changing data | Rebuild helps after many inserts |
| Memory | Higher | Lower |

**Default choice**: HNSW for most applications.

## HNSW Parameters

- `m` (default 16): Max connections per layer. Higher = better recall, more memory.
- `ef_construction` (default 64): Build-time search width. Higher = better index quality, slower build.

```sql
CREATE INDEX ON embeddings USING hnsw (embedding vector_cosine_ops)
  WITH (m = 24, ef_construction = 128);
```

## IVFFlat Parameters

- `lists`: Number of clusters. Rule of thumb: `sqrt(rows)` to `rows/1000`. More lists = slower build, potentially better recall.
- `probes`: At query time, how many lists to search. Higher = better recall, slower. Max = lists.

```sql
-- Build
CREATE INDEX ON embeddings USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- Query (session or per-query)
SET ivfflat.probes = 20;
```

## Hybrid Search (Vector + Full-Text)

Combine vector similarity with `tsvector` for better recall:

```sql
-- Add tsvector column
ALTER TABLE document_chunks ADD COLUMN content_tsv tsvector
  GENERATED ALWAYS AS (to_tsvector('english', content)) STORED;
CREATE INDEX ON document_chunks USING GIN (content_tsv);

-- Hybrid query: vector + full-text
WITH vector_results AS (
  SELECT id, content, 1 - (embedding <=> $1) AS score
  FROM document_chunks
  ORDER BY embedding <=> $1
  LIMIT 50
),
text_results AS (
  SELECT id, content, ts_rank(content_tsv, plainto_tsquery('english', $2)) AS score
  FROM document_chunks
  WHERE content_tsv @@ plainto_tsquery('english', $2)
  LIMIT 50
)
-- Reciprocal Rank Fusion (RRF): 1/(k + rank)
SELECT id, content,
  SUM(1.0 / (60 + rn)) AS rrf_score
FROM (
  SELECT id, content, ROW_NUMBER() OVER (ORDER BY score DESC) AS rn FROM vector_results
  UNION ALL
  SELECT id, content, ROW_NUMBER() OVER (ORDER BY score DESC) AS rn FROM text_results
) combined
GROUP BY id, content
ORDER BY rrf_score DESC
LIMIT 10;
```

## Dimension Limits

- pgvector supports up to 16,000 dimensions (varies by build)
- Common models: OpenAI text-embedding-3-small (1536), text-embedding-3-large (3072)

## Exact vs Approximate Search

- Indexed search is approximate; some relevant rows may be missed
- For exact k-NN, omit the index and use `ORDER BY embedding <=> $1 LIMIT k` (full scan)
- Use exact search for small tables or when recall is critical
