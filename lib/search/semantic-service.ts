import type { SemanticProductRecord, SemanticSearchResult } from '@/lib/search/types';

function normalize(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenize(text: string) {
  return normalize(text).split(' ').filter((token) => token.length > 2);
}

function vectorize(tokens: string[]) {
  const map = new Map<string, number>();
  for (const token of tokens) {
    map.set(token, (map.get(token) ?? 0) + 1);
  }
  return map;
}

function cosineSimilarity(a: Map<string, number>, b: Map<string, number>) {
  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (const value of a.values()) normA += value * value;
  for (const value of b.values()) normB += value * value;

  for (const [token, value] of a.entries()) {
    dot += value * (b.get(token) ?? 0);
  }

  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

function fullTextFallbackScore(queryTokens: string[], haystack: string) {
  const normalized = normalize(haystack);
  const total = queryTokens.length || 1;
  const hits = queryTokens.reduce((acc, token) => (normalized.includes(token) ? acc + 1 : acc), 0);
  return hits / total;
}

export function searchProductsSemantic(query: string, products: SemanticProductRecord[], limit = 12): SemanticSearchResult[] {
  const queryTokens = tokenize(query);
  const queryVector = vectorize(queryTokens);

  const scored = products.map((product) => {
    const corpus = [product.name, product.description, product.category, ...(product.tags ?? [])].join(' ');
    const semanticScore = cosineSimilarity(queryVector, vectorize(tokenize(corpus)));
    const fallbackScore = fullTextFallbackScore(queryTokens, corpus);

    // Hybrid score prepared for future vector DB providers (Qdrant/Sentence Transformers).
    const finalScore = Number((semanticScore * 0.75 + fallbackScore * 0.25).toFixed(4));
    const reason = semanticScore >= fallbackScore ? 'semantic_match' : 'text_match';

    return { product, semanticScore, fallbackScore, finalScore, reason };
  });

  return scored
    .sort((a, b) => b.finalScore - a.finalScore)
    .slice(0, limit)
    .filter((entry) => entry.finalScore > 0);
}

