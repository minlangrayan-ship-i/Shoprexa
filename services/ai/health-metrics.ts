import fs from 'node:fs';
import path from 'node:path';
import type { AiHealthModuleMetrics, AiHealthSnapshot, AiHealthWindow, AiHealthWindowSnapshot } from '@/types/marketplace-ai';

type RouteCounters = {
  requests: number;
  fallbacks: number;
  errors: number;
  lastRequestAt: string | null;
};

type RouteMetricEvent = {
  route: string;
  timestamp: number;
  fallback: boolean;
  error: boolean;
};

type DomainEvent = {
  name: 'recommendation_click';
  timestamp: number;
};

type PersistedMetricsStore = {
  version: 1;
  routeCounters: Record<string, RouteCounters>;
  routeEvents: RouteMetricEvent[];
  domainEvents: DomainEvent[];
};

const counters = new Map<string, RouteCounters>();
const routeEvents: RouteMetricEvent[] = [];
const domainEvents: DomainEvent[] = [];
const MAX_EVENT_BUFFER = 10000;
const STORE_PATH = path.join(process.cwd(), 'db', 'ai-health-store.json');

let hasHydrated = false;
let persistTimer: NodeJS.Timeout | null = null;

function getOrCreate(route: string): RouteCounters {
  const current = counters.get(route);
  if (current) return current;
  const next: RouteCounters = { requests: 0, fallbacks: 0, errors: 0, lastRequestAt: null };
  counters.set(route, next);
  return next;
}

function trimBuffer<T>(buffer: T[]) {
  if (buffer.length <= MAX_EVENT_BUFFER) return;
  buffer.splice(0, buffer.length - MAX_EVENT_BUFFER);
}

function toSerializableCounters() {
  return Object.fromEntries(counters.entries());
}

function safeParseStore(raw: string): PersistedMetricsStore | null {
  try {
    const parsed = JSON.parse(raw) as PersistedMetricsStore;
    if (!parsed || parsed.version !== 1) return null;
    if (!parsed.routeCounters || !parsed.routeEvents || !parsed.domainEvents) return null;
    return parsed;
  } catch {
    return null;
  }
}

function ensureStoreDir() {
  const dir = path.dirname(STORE_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function hydrateFromDisk() {
  if (hasHydrated) return;
  hasHydrated = true;

  try {
    if (!fs.existsSync(STORE_PATH)) return;
    const raw = fs.readFileSync(STORE_PATH, 'utf8');
    const store = safeParseStore(raw);
    if (!store) return;

    for (const [route, value] of Object.entries(store.routeCounters)) {
      counters.set(route, value);
    }
    routeEvents.push(...store.routeEvents);
    domainEvents.push(...store.domainEvents);
    trimBuffer(routeEvents);
    trimBuffer(domainEvents);
  } catch {
    // Keep in-memory behavior if disk hydration fails.
  }
}

function persistNow() {
  try {
    ensureStoreDir();
    const payload: PersistedMetricsStore = {
      version: 1,
      routeCounters: toSerializableCounters(),
      routeEvents,
      domainEvents
    };
    fs.writeFileSync(STORE_PATH, JSON.stringify(payload), 'utf8');
  } catch {
    // Ignore persistence errors to avoid impacting request paths.
  }
}

function schedulePersist() {
  if (persistTimer) return;
  persistTimer = setTimeout(() => {
    persistTimer = null;
    persistNow();
  }, 300);
}

function getWindowStart(window: AiHealthWindow) {
  const now = new Date();
  if (window === 'today') {
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return start.getTime();
  }
  const days = window === '7d' ? 7 : 30;
  return now.getTime() - days * 24 * 60 * 60 * 1000;
}

function toModuleMetrics(items: Map<string, RouteCounters>): AiHealthModuleMetrics[] {
  return Array.from(items.entries())
    .map(([route, value]) => {
      const fallbackRate = value.requests === 0 ? 0 : Number(((value.fallbacks / value.requests) * 100).toFixed(1));
      const errorRate = value.requests === 0 ? 0 : Number(((value.errors / value.requests) * 100).toFixed(1));
      return {
        route,
        requests: value.requests,
        fallbacks: value.fallbacks,
        errors: value.errors,
        fallbackRate,
        errorRate,
        lastRequestAt: value.lastRequestAt
      };
    })
    .sort((a, b) => b.requests - a.requests || a.route.localeCompare(b.route));
}

function aggregateWindow(window: AiHealthWindow): AiHealthWindowSnapshot {
  const start = getWindowStart(window);
  const perRoute = new Map<string, RouteCounters>();

  for (const event of routeEvents) {
    if (event.timestamp < start) continue;
    const entry = perRoute.get(event.route) ?? { requests: 0, fallbacks: 0, errors: 0, lastRequestAt: null };
    entry.requests += 1;
    if (event.fallback) entry.fallbacks += 1;
    if (event.error) entry.errors += 1;
    entry.lastRequestAt = new Date(event.timestamp).toISOString();
    perRoute.set(event.route, entry);
  }

  const modules = toModuleMetrics(perRoute);
  const totalRequests = modules.reduce((sum, module) => sum + module.requests, 0);
  const totalFallbacks = modules.reduce((sum, module) => sum + module.fallbacks, 0);
  const totalErrors = modules.reduce((sum, module) => sum + module.errors, 0);

  const recommendationClicks = domainEvents.filter((event) => event.name === 'recommendation_click' && event.timestamp >= start).length;

  return {
    window,
    totalRequests,
    totalFallbacks,
    totalErrors,
    fallbackRate: totalRequests === 0 ? 0 : Number(((totalFallbacks / totalRequests) * 100).toFixed(1)),
    errorRate: totalRequests === 0 ? 0 : Number(((totalErrors / totalRequests) * 100).toFixed(1)),
    modules,
    events: {
      recommendationClicks
    }
  };
}

// Persists to local JSON file for MVP continuity between restarts.
// Replace with durable DB storage in production.
export function recordAiMetric(route: string, flags?: { fallback?: boolean; error?: boolean }) {
  hydrateFromDisk();

  const target = getOrCreate(route);
  target.requests += 1;
  if (flags?.fallback) target.fallbacks += 1;
  if (flags?.error) target.errors += 1;

  const timestamp = Date.now();
  target.lastRequestAt = new Date(timestamp).toISOString();

  routeEvents.push({
    route,
    timestamp,
    fallback: Boolean(flags?.fallback),
    error: Boolean(flags?.error)
  });
  trimBuffer(routeEvents);
  schedulePersist();
}

export function recordAiEvent(eventName: 'recommendation_click') {
  hydrateFromDisk();
  domainEvents.push({ name: eventName, timestamp: Date.now() });
  trimBuffer(domainEvents);
  schedulePersist();
}

export function getAiHealthSnapshot(): AiHealthSnapshot {
  hydrateFromDisk();

  const modules = toModuleMetrics(counters);

  const totals = modules.reduce(
    (acc, module) => {
      acc.totalRequests += module.requests;
      acc.totalFallbacks += module.fallbacks;
      acc.totalErrors += module.errors;
      return acc;
    },
    { totalRequests: 0, totalFallbacks: 0, totalErrors: 0 }
  );

  const totalRecommendationClicks = domainEvents.filter((event) => event.name === 'recommendation_click').length;

  return {
    ...totals,
    fallbackRate: totals.totalRequests === 0 ? 0 : Number(((totals.totalFallbacks / totals.totalRequests) * 100).toFixed(1)),
    errorRate: totals.totalRequests === 0 ? 0 : Number(((totals.totalErrors / totals.totalRequests) * 100).toFixed(1)),
    modules,
    events: {
      recommendationClicks: totalRecommendationClicks
    },
    windows: {
      today: aggregateWindow('today'),
      '7d': aggregateWindow('7d'),
      '30d': aggregateWindow('30d')
    }
  };
}
