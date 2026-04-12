# Min-shop AI MVP architecture

## Product orientation
- Goal: increase trust, conversion, and seller productivity in an African marketplace context.
- Principle: every AI module has deterministic fallbacks so platform uptime does not depend on one model call.

## Layers
- `app/*`: Next.js pages and API routes.
- `features/*`: user-facing modules (chat, generator, recommendations, verification, delivery).
- `services/*`: business services and orchestration (AI adapter, recommendation engine, delivery logic, verification scoring).
- `db/*`: mock business data and heuristic maps.
- `types/*`: shared contracts between frontend and backend.
- `lib/*`: legacy/shared utilities and marketplace mock catalog.

## Separation of concerns
- Business logic: `services/recommendations`, `services/delivery`, `services/verification`.
- AI services: `services/ai/*` with adapter and fallbacks.
- API layer: `app/api/*` with clear naming and zod validation.
- Frontend components: `features/*/components` and existing `components/*`.

## Reliability strategy
- All AI endpoints return structured JSON contracts.
- Fallback messaging and local rule-based responses when AI adapter fails.
- Recommendation and delivery modules are rule/scoring based for deterministic MVP behavior.
- AI health metrics are currently in-memory (request/event buffers) with temporal windows (`today`, `7d`, `30d`).
- This structure is intentionally ready to be replaced by persistent storage without changing the admin UI contract.

## Evolution path
- Replace `services/ai/llm-adapter.ts` by real provider integration.
- Replace mock city distances with real logistics API.
- Replace heuristic verification by real image moderation/vision service.
- Keep same API contracts to avoid frontend rewrites.
- Plug `services/ai/health-metrics.ts` into a database/time-series store for durable observability.
- Extend `types/listing-business.ts` + `services/analytics/listing-business-bridge.ts` to run trust/performance correlations.
