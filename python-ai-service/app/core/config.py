from pydantic import BaseModel


class Settings(BaseModel):
    app_name: str = "Min-shop Python AI Service"
    app_version: str = "1.0.0"
    default_top_k: int = 5
    semantic_weight: float = 0.62
    trust_weight: float = 0.14
    availability_weight: float = 0.08
    popularity_weight: float = 0.08
    region_weight: float = 0.05
    budget_weight: float = 0.03


settings = Settings()
