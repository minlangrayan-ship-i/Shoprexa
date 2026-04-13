from app.core.config import settings
from app.models.schemas import ExtractedFilters, ProductInput
from app.utils.text import normalize_text


class RankingService:
    def rerank(
        self,
        query: str,
        filters: ExtractedFilters,
        scored_products: list[tuple[ProductInput, float]],
    ) -> list[dict]:
        ranked: list[dict] = []
        normalized_query = normalize_text(query)

        for product, semantic_score in scored_products:
            # Hybrid ranking: semantic relevance stays dominant, then business signals
            # improve trust, conversion potential, and local usefulness.
            trust_component = (product.trust_score / 100.0) * settings.trust_weight
            availability_component = min(product.availability / 50.0, 1.0) * settings.availability_weight
            popularity_component = product.popularity * settings.popularity_weight
            region_component = self._region_bonus(filters.region, product.region) * settings.region_weight
            budget_component = self._budget_bonus(filters, product.price) * settings.budget_weight

            business_score = (
                trust_component
                + availability_component
                + popularity_component
                + region_component
                + budget_component
            )
            final_score = (semantic_score * settings.semantic_weight) + business_score

            ranked.append(
                {
                    "product": product,
                    "semantic_score": round(float(semantic_score), 4),
                    "business_score": round(float(business_score), 4),
                    "final_score": round(float(final_score), 4),
                    "justification": self._build_justification(normalized_query, filters, product),
                }
            )

        ranked.sort(key=lambda item: item["final_score"], reverse=True)
        return ranked

    def _region_bonus(self, region: str | None, product_region: str) -> float:
        if not region:
            return 0.4
        return 1.0 if normalize_text(product_region) == region else 0.1

    def _budget_bonus(self, filters: ExtractedFilters, price: float) -> float:
        if not filters.budget or filters.budget.max_price is None:
            return 0.4
        if price <= filters.budget.max_price:
            return 1.0
        if price <= filters.budget.max_price * 1.25:
            return 0.35
        return 0.0

    def _build_justification(self, query: str, filters: ExtractedFilters, product: ProductInput) -> str:
        reasons: list[str] = []

        if filters.category and filters.category == product.category:
            reasons.append(f"bon match sur la categorie {product.category}")
        if filters.region and normalize_text(product.region) == filters.region:
            reasons.append(f"region {product.region}")
        if filters.budget and filters.budget.max_price and product.price <= filters.budget.max_price:
            reasons.append("prix coherent avec le budget")
        if filters.need and filters.need in normalize_text(product.description):
            reasons.append(f"besoin {filters.need}")
        if not reasons and product.title.lower() in query:
            reasons.append("correspondance forte sur le titre")
        if not reasons:
            reasons.append("bonne proximite semantique avec la requete")

        return reasons[0][0].upper() + reasons[0][1:] + "."


ranking_service = RankingService()
