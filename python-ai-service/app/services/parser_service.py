from app.models.schemas import BudgetFilter, ExtractedFilters
from app.utils.text import normalize_text


class ParserService:
    CATEGORY_KEYWORDS: dict[str, list[str]] = {
        "telephone": ["telephone", "smartphone", "android", "iphone", "mobile"],
        "mode": ["sac", "mode", "robe", "chaussure", "elegant", "femme"],
        "electromenager": ["mixeur", "ventilateur", "blender", "electromenager"],
        "accessoires": ["ecouteur", "power bank", "chargeur", "accessoire"],
        "energie": ["solaire", "lampe", "eclairage", "courant", "coupure"],
        "agriculture": ["agriculture", "jardin", "culture", "pulverisateur"],
    }
    REGIONS = [
        "yaounde",
        "douala",
        "bafoussam",
        "garoua",
        "abidjan",
        "dakar",
        "lagos",
        "nairobi",
    ]
    LOW_BUDGET_KEYWORDS = ["pas cher", "abordable", "budget", "economique"]
    HIGH_BUDGET_KEYWORDS = ["premium", "haut de gamme", "luxe"]
    AUDIENCE_KEYWORDS = ["femme", "homme", "etudiant", "famille"]

    def parse(self, query: str) -> ExtractedFilters:
        text = normalize_text(query)

        category = self._extract_category(text)
        region = self._extract_region(text)
        budget = self._extract_budget(text)
        need = self._extract_need(text)
        audience = self._extract_audience(text)

        return ExtractedFilters(
            category=category,
            region=region,
            budget=budget,
            need=need,
            audience=audience,
        )

    def _extract_category(self, text: str) -> str | None:
        for category, keywords in self.CATEGORY_KEYWORDS.items():
            if any(keyword in text for keyword in keywords):
                return category
        return None

    def _extract_region(self, text: str) -> str | None:
        for region in self.REGIONS:
            if region in text:
                return region
        return None

    def _extract_budget(self, text: str) -> BudgetFilter | None:
        if any(keyword in text for keyword in self.LOW_BUDGET_KEYWORDS):
            return BudgetFilter(label="low", max_price=75000)
        if any(keyword in text for keyword in self.HIGH_BUDGET_KEYWORDS):
            return BudgetFilter(label="high", max_price=None)
        if any(token in text for token in ["moins de", "max", "maximum"]):
            return BudgetFilter(label="medium", max_price=150000)
        return None

    def _extract_need(self, text: str) -> str | None:
        for phrase in ["pas cher", "elegant", "autonomie", "coupure", "voyage", "etude", "bureau"]:
            if phrase in text:
                return phrase
        return None

    def _extract_audience(self, text: str) -> str | None:
        for keyword in self.AUDIENCE_KEYWORDS:
            if keyword in text:
                return keyword
        return None


parser_service = ParserService()
