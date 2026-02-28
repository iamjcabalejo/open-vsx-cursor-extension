---
name: performance-profiling
description: Measure before optimizing; identify bottlenecks with data. Use when optimizing performance, profiling, or working with performance-engineer.
---

# Performance Profiling

## Rule: Measure First
Never optimize without profiling. Identify the actual bottleneck before changing code.

## Frontend
- **Lighthouse**: LCP, FID, CLS, TTI
- **Chrome DevTools**: Performance tab, Network throttling
- **Bundle**: `npx vite-bundle-visualizer` or webpack-bundle-analyzer
- **React**: Profiler, why-did-you-render

## Backend
- **Response time**: P50, P95, P99
- **Database**: Slow query log, EXPLAIN
- **Memory**: Heap snapshots, leaks

## Critical Path
- What does the user do first?
- What blocks the initial render?
- What blocks the primary action?

## Before/After
- Record baseline metrics before changes
- Re-measure after each optimization
- Compare before claiming improvement

## Optimization Order
1. Measure and identify bottleneck
2. Fix the biggest impact first
3. Validate with metrics
4. Document the change
