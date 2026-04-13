from fastapi import APIRouter

from app.models.schemas import (
    ClassifyIntentRequest,
    ClassifyIntentResponse,
    EmbedProductsRequest,
    EmbedProductsResponse,
    HealthRequest,
    HealthResponse,
    SearchRequest,
    SearchResponse,
)
from app.services.embedding_service import embedding_service
from app.services.intent_service import intent_service
from app.services.search_service import search_service

router = APIRouter()


@router.post("/health", response_model=HealthResponse)
def health(_: HealthRequest) -> HealthResponse:
    return HealthResponse(
        status="ok",
        service="min-shop-ai-service",
        version="1.0.0",
        indexed_products=embedding_service.product_count,
        embedding_backend=embedding_service.backend_name,
    )


@router.post("/embed-products", response_model=EmbedProductsResponse)
def embed_products(payload: EmbedProductsRequest) -> EmbedProductsResponse:
    indexed_count = search_service.rebuild_catalog(payload.products)
    return EmbedProductsResponse(
        status="ok",
        indexed_products=indexed_count,
        source="external" if payload.products else "mock",
        message=f"{indexed_count} produits indexes avec succes."
    )


@router.post("/classify-intent", response_model=ClassifyIntentResponse)
def classify_intent(payload: ClassifyIntentRequest) -> ClassifyIntentResponse:
    intent = intent_service.classify(payload.query)
    return ClassifyIntentResponse(intent=intent)


@router.post("/search", response_model=SearchResponse)
def search(payload: SearchRequest) -> SearchResponse:
    return search_service.search(payload)
