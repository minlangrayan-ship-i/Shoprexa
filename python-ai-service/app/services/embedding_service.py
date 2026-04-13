from dataclasses import dataclass

import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from app.models.schemas import ProductInput
from app.utils.text import build_product_document, normalize_text


@dataclass
class EmbeddingIndex:
    vectorizer: TfidfVectorizer
    matrix: np.ndarray
    products: list[ProductInput]


class EmbeddingService:
    def __init__(self) -> None:
        self._index: EmbeddingIndex | None = None
        self.backend_name = "tfidf"

    @property
    def product_count(self) -> int:
        return len(self._index.products) if self._index else 0

    def fit_products(self, products: list[ProductInput]) -> None:
        # We keep a compact text representation per product so the embedding backend
        # can later be swapped without changing the API contract.
        documents = [
            normalize_text(
                build_product_document(
                    product.title,
                    product.description,
                    product.category,
                    product.tags,
                )
            )
            for product in products
        ]
        vectorizer = TfidfVectorizer(ngram_range=(1, 2), min_df=1)
        matrix = vectorizer.fit_transform(documents)
        self._index = EmbeddingIndex(vectorizer=vectorizer, matrix=matrix, products=products)

    def ensure_index(self) -> EmbeddingIndex:
        if not self._index:
            raise RuntimeError("Product index not initialized")
        return self._index

    def similarity_scores(self, query: str) -> list[tuple[ProductInput, float]]:
        index = self.ensure_index()
        query_vector = index.vectorizer.transform([normalize_text(query)])
        scores = cosine_similarity(query_vector, index.matrix).flatten()
        return list(zip(index.products, scores.tolist()))


embedding_service = EmbeddingService()
