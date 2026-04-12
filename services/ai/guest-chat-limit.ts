const GUEST_MESSAGE_LIMIT = 5;
const guestCounters = new Map<string, number>();

function getGuestKey(request: Request) {
  const ip = request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? 'unknown-ip';
  const userAgent = request.headers.get('user-agent') ?? 'unknown-ua';
  return `${ip}|${userAgent}`;
}

// In-memory fallback guard for guest chat usage.
// This is intentionally lightweight and can be replaced by DB/session storage later.
export function consumeGuestMessageAllowance(request: Request) {
  const key = getGuestKey(request);
  const used = guestCounters.get(key) ?? 0;

  if (used >= GUEST_MESSAGE_LIMIT) {
    return {
      allowed: false,
      used,
      remaining: 0,
      max: GUEST_MESSAGE_LIMIT
    };
  }

  const next = used + 1;
  guestCounters.set(key, next);

  return {
    allowed: true,
    used: next,
    remaining: Math.max(0, GUEST_MESSAGE_LIMIT - next),
    max: GUEST_MESSAGE_LIMIT
  };
}
