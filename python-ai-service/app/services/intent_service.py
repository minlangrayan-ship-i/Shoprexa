from app.models.schemas import IntentResult
from app.utils.text import contains_any, normalize_text


class IntentService:
    GREETING_KEYWORDS = ["bonjour", "salut", "hello", "bonsoir", "coucou"]
    DELIVERY_KEYWORDS = ["livraison", "delai", "expedition", "quand arrive", "shipping"]
    PRODUCT_SEARCH_KEYWORDS = ["je cherche", "je veux", "montre", "trouve", "besoin", "acheter"]
    PRODUCT_QUESTION_KEYWORDS = ["difference", "caracteristique", "details", "c est quoi", "est ce que"]

    def classify(self, query: str) -> IntentResult:
        text = normalize_text(query)

        if contains_any(text, self.GREETING_KEYWORDS):
            return IntentResult(label="greeting", confidence=0.96)

        if contains_any(text, self.DELIVERY_KEYWORDS):
            return IntentResult(label="delivery_question", confidence=0.9)

        if contains_any(text, self.PRODUCT_SEARCH_KEYWORDS):
            return IntentResult(label="product_search", confidence=0.93)

        if contains_any(text, self.PRODUCT_QUESTION_KEYWORDS):
            return IntentResult(label="product_question", confidence=0.84)

        if len(text.split()) >= 2:
            return IntentResult(label="product_search", confidence=0.58)

        return IntentResult(label="unknown", confidence=0.35)


intent_service = IntentService()
