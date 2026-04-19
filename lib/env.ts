export const env = {
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  APP_BASE_URL: process.env.APP_BASE_URL ?? 'http://localhost:3000',
  APP_SESSION_SECRET: process.env.APP_SESSION_SECRET ?? 'dev-session-secret-change-me',
  APP_SESSION_COOKIE_NAME: process.env.APP_SESSION_COOKIE_NAME ?? 'shoprex_session',
  APP_SESSION_TTL_SECONDS: Number(process.env.APP_SESSION_TTL_SECONDS ?? '604800'),
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ?? 'dev-nextauth-secret-change-me',
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ?? '',
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ?? '',
  MAPBOX_ACCESS_TOKEN: process.env.MAPBOX_ACCESS_TOKEN ?? '',
  GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY ?? '',
  GEO_PROVIDER: process.env.GEO_PROVIDER ?? 'MAPBOX',
  MINSHOP_AI_SERVICE_URL: process.env.MINSHOP_AI_SERVICE_URL ?? 'http://127.0.0.1:8010',
  MISTRAL_API_KEY: process.env.MISTRAL_API_KEY ?? '',
  MISTRAL_MODEL: process.env.MISTRAL_MODEL ?? 'open-mistral-7b',
  FLUTTERWAVE_PUBLIC_KEY: process.env.FLUTTERWAVE_PUBLIC_KEY ?? '',
  FLUTTERWAVE_SECRET_KEY: process.env.FLUTTERWAVE_SECRET_KEY ?? '',
  FLUTTERWAVE_WEBHOOK_SECRET: process.env.FLUTTERWAVE_WEBHOOK_SECRET ?? '',
  CINETPAY_API_KEY: process.env.CINETPAY_API_KEY ?? '',
  CINETPAY_SITE_ID: process.env.CINETPAY_SITE_ID ?? '',
  CINETPAY_SECRET_KEY: process.env.CINETPAY_SECRET_KEY ?? '',
  CINETPAY_WEBHOOK_SECRET: process.env.CINETPAY_WEBHOOK_SECRET ?? '',
  PAYMENT_DEFAULT_PROVIDER: process.env.PAYMENT_DEFAULT_PROVIDER ?? 'FLUTTERWAVE',
  ENABLE_DEV_AUTH_BYPASS: (process.env.ENABLE_DEV_AUTH_BYPASS ?? 'false') === 'true'
};

export function isProduction() {
  return env.NODE_ENV === 'production';
}
