export const env = {
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  APP_BASE_URL: process.env.APP_BASE_URL ?? 'http://localhost:3000',
  APP_SESSION_SECRET: process.env.APP_SESSION_SECRET ?? 'dev-session-secret-change-me',
  APP_SESSION_COOKIE_NAME: process.env.APP_SESSION_COOKIE_NAME ?? 'shoprex_session',
  APP_SESSION_TTL_SECONDS: Number(process.env.APP_SESSION_TTL_SECONDS ?? '604800'),
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
