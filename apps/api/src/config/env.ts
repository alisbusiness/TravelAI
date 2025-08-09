import { z } from 'zod';

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(8080),
  APP_URL: z.string().url().default('http://localhost:8080'),
  CLIENT_URL: z.string().url().default('http://localhost:3000'),

  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().min(1),

  JWT_ACCESS_SECRET: z.string().min(10),
  JWT_REFRESH_SECRET: z.string().min(10),
  MAGIC_LINK_SECRET: z.string().min(10),
  MAGIC_LINK_TTL_MINUTES: z.coerce.number().default(20),

  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GOOGLE_CALLBACK_URL: z.string().url().optional(),

  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional(),
  SMTP_SECURE: z.coerce.boolean().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  EMAIL_FROM: z.string().default('TripGenie <no-reply@tripgenie.ai>'),
  DEV_EMAIL_FILE_DIR: z.string().default('tmp/emails'),

  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL: z.string().default('gpt-5'),
  OPENAI_MODEL_LIGHT: z.string().default('gpt-5-mini'),

  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  STRIPE_PRICE_PREMIUM_MONTHLY: z.string().optional(),
  STRIPE_PRICE_PREMIUM_YEARLY: z.string().optional(),
  STRIPE_SUCCESS_URL: z.string().url().optional(),
  STRIPE_CANCEL_URL: z.string().url().optional(),

  PROVIDER_AMADEUS_ENABLED: z.coerce.boolean().default(false),
  AMADEUS_API_KEY: z.string().optional(),
  AMADEUS_API_SECRET: z.string().optional(),

  PROVIDER_KIWI_ENABLED: z.coerce.boolean().default(false),
  KIWI_API_KEY: z.string().optional(),

  PROVIDER_GYG_ENABLED: z.coerce.boolean().default(false),
  GYG_API_KEY: z.string().optional(),

  AFFILIATE_BOOKING_COM_PARTNER_ID: z.string().default('YOUR_PARTNER_ID'),
  AFFILIATE_UTM_SOURCE: z.string().default('tripgenie'),
  AFFILIATE_UTM_MEDIUM: z.string().default('affiliate'),

  TEST_SKIP_STRIPE_SIGNATURE: z.string().optional(),
});

export type AppEnv = z.infer<typeof EnvSchema>;

export const env: AppEnv = EnvSchema.parse(process.env);

