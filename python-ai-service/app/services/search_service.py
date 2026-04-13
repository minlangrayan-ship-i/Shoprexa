from app.core.config import settings
from app.data.mock_products import MOCK_PRODUCTS
from app.models.schemas import ProductInput, SearchRequest, SearchResponse, SearchResultItem
from app.services.embedding_service import embedding_service
from app.services.intent_service import intent_service
from app.services.parser_service import parser_service
from app.services.ranking_service import ranking_service
from app.utils.text import normalize_text


class SearchService:
    def __init__(self) -> None:
        self.rebuild_catalog([])

    def rebuild_catalog(self, products: list[ProductInput]) -> int:
        active_products = products or MOCK_PRODUCTS
        embedding_service.fit_products(active_products)
        return len(active_products)

    def search(self, payload: SearchRequest) -> SearchResponse:
        if payload.products:
            self.rebuild_catalog(payload.products)

        intent = intent_service.classify(payload.query)
        filters = parser_service.parse(payload.query)
        semantic_hits = embedding_service.similarity_scores(payload.query)

        # We first keep the semantic candidates broad, then use business-aware reranking
        # so the assistant never invents results outside the actual catalog.
        filtered_hits = self._apply_hard_filters(semantic_hits, filters)
        reranked = ranking_service.rerank(payload.query, filters, filtered_hits)
        top_results = reranked[: payload.top_k or settings.default_top_k]

        products = [
            SearchResultItem(
                id=item["product"].id,
                title=item["product"].title,
                category=item["product"].category,
                price=item["product"].price,
                region=item["product"].region,
                availability=item["product"].availability,
                trust_score=item["product"].trust_score,
                trust_status=item["product"].trust_status,
                semantic_score=item["semantic_score"],
                business_score=item["business_score"],
                final_score=item["final_score"],
                justification=item["justification"],
            )
            for item in top_results
            if item["final_score"] > 0
        ]

        return SearchResponse(
            intent=intent,
            filters=filters,
            products=products,
            message=self._build_message(intent.label, filters.region, len(products)),
            total_found=len(products),
        )

    def _apply_hard_filters(
        self,
        hits: list[tuple[ProductInput, float]],
        filters,
    ) -> list[tuple[ProductInput, float]]:
        filtered: list[tuple[ProductInput, float]] = []

        for product, score in hits:
            if filters.category and normalize_text(product.category) != filters.category:
                continue
            if filters.region and normalize_text(product.region) != filters.region and score < 0.12:
                continue
            filtered.append((product, score))

        return filtered or hits

    def _build_message(self, intent_label: str, region: str | None, total_found: int) -> str:
        if intent_label == "greeting":
            return "Bonjour, je peux vous aider a trouver un produit adapte a votre besoin."
        if total_found == 0:
            return "Je n ai trouve aucun produit reel correspondant exactement a votre demande."
        if region:
            return f"J ai trouve {total_found} produit(s) pertinent(s) pour votre recherche dans la zone {region.title()}."
        return f"J ai trouve {total_found} produit(s) pertinent(s) pour votre recherche."


search_service = SearchService()
