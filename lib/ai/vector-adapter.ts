export type VectorDocument = {
  id: string;
  text: string;
  metadata?: Record<string, unknown>;
};

export type VectorQueryResult = {
  id: string;
  score: number;
};

export interface VectorSearchAdapter {
  upsert(documents: VectorDocument[]): Promise<void>;
  query(text: string, limit: number): Promise<VectorQueryResult[]>;
}

// Placeholder adapter: use lexical fallback until a real vector backend is plugged (Qdrant/Sentence Transformers).
export class NoopVectorSearchAdapter implements VectorSearchAdapter {
  async upsert(): Promise<void> {
    return;
  }

  async query(): Promise<VectorQueryResult[]> {
    return [];
  }
}

