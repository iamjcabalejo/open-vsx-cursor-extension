# RAG Patterns with PostgreSQL

## Chunking Strategies

| Strategy | Chunk Size | Overlap | Best For |
|----------|------------|---------|----------|
| Fixed | 256–512 tokens | 10–20% | General docs |
| Sentence | By sentence boundary | 1–2 sentences | Prose |
| Semantic | By topic/paragraph | Variable | Long-form content |
| Recursive | Hierarchical (section → para → sentence) | Configurable | Mixed structure |

**Guidelines**:
- Match chunk size to embedding model context (e.g. 8K tokens)
- Smaller chunks = more precise retrieval, more chunks to manage
- Overlap reduces boundary loss; 10–20% is typical

## Embedding Pipeline

1. **Chunk** source text (by strategy above)
2. **Embed** each chunk with same model (OpenAI, Voyage, local)
3. **Store** in `document_chunks` with `content`, `embedding`, `metadata`
4. **Index** vector column with HNSW or IVFFlat

**Consistency**: Use the same embedding model for ingestion and query.

## Metadata for Filtering

Store filterable fields in `metadata` (JSONB) or dedicated columns:

```sql
-- Filter by source before vector search
SELECT id, content, embedding <=> $1 AS distance
FROM document_chunks
WHERE metadata->>'source' = 'docs'
  AND metadata->>'version' = '2.0'
ORDER BY embedding <=> $1
LIMIT 10;
```

Add B-tree or GIN indexes on frequently filtered columns.

## Reciprocal Rank Fusion (RRF)

When combining vector and keyword results:

```
RRF_score(d) = Σ 1/(k + rank_i(d))
```

- `k`: constant (often 60) to dampen top-rank dominance
- `rank_i(d)`: rank of document d in result set i

Higher RRF score = document appeared in multiple result sets or ranked high in several.

## Re-ranking (Optional)

After retrieval, optionally re-rank with a cross-encoder or LLM for better precision:

1. Retrieve top 20–50 with vector (and/or hybrid) search
2. Re-rank with cross-encoder or LLM relevance score
3. Return top 5–10 to the LLM context

## Automatic Embedding Updates

For in-database pipelines, use triggers + background workers (e.g. pgvectorizer, pgai):

- Trigger on INSERT/UPDATE of content
- Queue chunk for embedding
- Worker fetches embedding and updates row

Keeps embeddings in sync without external ETL.
