from typing import Literal

from pydantic import BaseModel, Field


IntentLabel = Literal[
    "product_search",
    "product_question",
    "delivery_question",
    "greeting",
    "unknown",
]
TrustStatus = Literal["valid", "needs_review", "suspect"]
BudgetLabel = Literal["low", "medium", "high"]


class HealthRequest(BaseModel):
    pass


class HealthResponse(BaseModel):
    status: str
    service: str
    version: str
    indexed_products: int
    embedding_backend: str


class ProductInput(BaseModel):
    id: str
    title: str
    description: str
    category: str
    price: float
    region: str
    availability: int
    popularity: float = Field(ge=0.0, le=1.0)
    trust_score: float = Field(ge=0.0, le=100.0)
    trust_status: TrustStatus
    tags: list[str] = Field(default_factory=list)


class EmbedProductsRequest(BaseModel):
    products: list[ProductInput] = Field(default_factory=list)


class EmbedProductsResponse(BaseModel):
    status: str
    indexed_products: int
    source: Literal["mock", "external"]
    message: str


class IntentResult(BaseModel):
    label: IntentLabel
    confidence: float = Field(ge=0.0, le=1.0)


class ClassifyIntentRequest(BaseModel):
    query: str = Field(min_length=1)


class ClassifyIntentResponse(BaseModel):
    intent: IntentResult


class BudgetFilter(BaseModel):
    label: BudgetLabel
    max_price: float | None = None


class ExtractedFilters(BaseModel):
    category: str | None = None
    region: str | None = None
    budget: BudgetFilter | None = None
    need: str | None = None
    audience: str | None = None


class SearchRequest(BaseModel):
    query: str = Field(min_length=1)
    top_k: int = Field(default=5, ge=1, le=20)
    products: list[ProductInput] = Field(default_factory=list)


class SearchResultItem(BaseModel):
    id: str
    title: str
    category: str
    price: float
    region: str
    availability: int
    trust_score: float
    trust_status: TrustStatus
    semantic_score: float
    business_score: float
    final_score: float
    justification: str


class SearchResponse(BaseModel):
    intent: IntentResult
    filters: ExtractedFilters
    products: list[SearchResultItem]
    message: str
    total_found: int
