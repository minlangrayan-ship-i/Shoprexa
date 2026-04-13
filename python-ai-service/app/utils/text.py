import re
import unicodedata


def normalize_text(value: str) -> str:
    lowered = value.strip().lower()
    normalized = unicodedata.normalize("NFKD", lowered)
    ascii_only = normalized.encode("ascii", "ignore").decode("ascii")
    compact = re.sub(r"\s+", " ", ascii_only)
    return compact


def build_product_document(title: str, description: str, category: str, tags: list[str]) -> str:
    return " | ".join(
        [
            title.strip(),
            description.strip(),
            category.strip(),
            " ".join(tags).strip(),
        ]
    )


def contains_any(text: str, keywords: list[str]) -> bool:
    return any(keyword in text for keyword in keywords)
