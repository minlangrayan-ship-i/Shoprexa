# API map (MVP AI modules)

- `POST /api/ai/chat`
  - Purpose: customer assistant for search/compare/FAQ.
  - Input: message, locale, location, history.
  - Output: intent, answer, product suggestions, fallback flag.

- `POST /api/ai/product-generator`
  - Purpose: seller listing generation/improvement.
  - Input: offer fields (name, category, kind, benefits, specs, draft...).
  - Output: optimized title, polished description, selling points, missing fields.

- `POST /api/recommendations`
  - Purpose: recommendation blocks for conversion.
  - Input: location + optional anchor product/category + budget.
  - Output: blocks (`similar`, `popular`, `complementary`, `regional`).

- `POST /api/product-verification`
  - Purpose: consistency scoring (name/category/images/description).
  - Input: listing text and image URLs.
  - Output: score, confidence, status, alerts, recommendations.

- `POST /api/delivery-estimate`
  - Purpose: smart delivery estimate by region and stock.
  - Input: seller/client location, stock, type, priority.
  - Output: transport, ETA window, reliability, explanation.

- `GET /api/admin/ai-health`
  - Purpose: admin AI observability snapshot.
  - Output:
    - cumulative counters
    - temporal windows (`today`, `7d`, `30d`)
    - per-route breakdown
    - tracked event counters (recommendation clicks)

- `POST /api/metrics/recommendation-click`
  - Purpose: lightweight tracking of recommendation click-through.
  - Input: none (fire-and-forget).
  - Output: `{ ok: true }`.
