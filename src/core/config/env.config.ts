import * as dotenv from 'dotenv';

dotenv.config();

//configurations for env files
export const envConfig = {
  port: process.env.port,
  database: {
    database_url: process.env.DATABASE_URL,
    mongo_url: process.env.MONGO_URL,
  },
  server: {
    port: parseInt(process.env.SERVER_PORT || '3000', 10),
    environment: process.env.NODE_ENV || 'development',
  },
  jwt: { secret: process.env.SECRET_KEY, expiry: process.env.JWT_EXPIRY },
  cloudinary: {
    cloud_name: process.env.CLOUDINARY_NAME,
    key: process.env.CLOUDINARY_API_KEY,
    secret: process.env.CLOUDINARY_API_SECRET,
  },
  mail: {
    host: process.env.MAIL_HOST,
    user: process.env.MAIL_USER,
    password: process.env.MAIL_PASSWORD,
    port: process.env.MAIL_PORT,
    from: process.env.MAIL_FROM,
  },
  stripe: {
    key: process.env.STRIPE_SECRET_KEY,
    webhookSecret: process.env.WEBHOOK_SECRET,
  },
  paystack: {
    key: process.env.PAYSTACK_SECRET_KEY,
    url: process.env.PAYSTACK_BASE_URL,
  },
};
