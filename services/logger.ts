type LogLevel = 'info' | 'warn' | 'error';

type LogPayload = {
  scope: string;
  message: string;
  meta?: Record<string, unknown>;
};

export function log(level: LogLevel, payload: LogPayload) {
  const line = JSON.stringify({
    ts: new Date().toISOString(),
    level,
    scope: payload.scope,
    message: payload.message,
    meta: payload.meta ?? {}
  });
  if (level === 'error') console.error(line);
  else if (level === 'warn') console.warn(line);
  else console.log(line);
}
