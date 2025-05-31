import { config } from 'dotenv';

config({
  path: '.env',
});

const drizzleConfig = {
  schema: './lib/db/schema.ts',
  out: './lib/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    // biome-ignore lint: Forbidden non-null assertion.
    url: process.env.POSTGRES_URL!,
  },
};

export default drizzleConfig;
