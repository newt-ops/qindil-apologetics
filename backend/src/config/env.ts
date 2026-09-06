import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(5000),
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
  JWT_ACCESS_SECRET: z.string().min(1, 'JWT_ACCESS_SECRET is required'),
  JWT_REFRESH_SECRET: z.string().min(1, 'JWT_REFRESH_SECRET is required'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('30d'),
  COOKIE_DOMAIN: z.string().optional(),
  CLIENT_URL: z.string().default('http://localhost:3000'),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  RESEND_FROM_EMAIL: z.string().optional(),
  RESEND_VERIFICATION_EMAIL: z.string().optional(),
  RESEND_TASKS_EMAIL: z.string().optional(),
  RESEND_CONTACT_EMAIL: z.string().optional(),
  RESEND_INFO_EMAIL: z.string().optional(),
  RESEND_NOREPLY_EMAIL: z.string().optional(),
  RESEND_NOTIFICATIONS_EMAIL: z.string().optional(),
  RESEND_APOLOGY_EMAIL: z.string().optional(),
  TELEGRAM_BOT_TOKEN: z.string().optional(),
  TELEGRAM_BOT_USERNAME: z.string().optional(),
  TELEGRAM_NOTIFY_CHANNEL_ID: z.string().optional(),
  TELEGRAM_OFFICIAL_CHANNEL_ID: z.string().optional(),
});

let parsedEnv: z.infer<typeof envSchema>;
try {
  parsedEnv = envSchema.parse(process.env);
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error('❌ Invalid environment variables:');
    console.error(JSON.stringify(error.format(), null, 2));
  } else {
    console.error('❌ Error parsing environment variables:', error);
  }
  process.exit(1);
}

export const env: z.infer<typeof envSchema> = parsedEnv;
export type Env = z.infer<typeof envSchema>;

