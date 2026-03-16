import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  out: './drizzle',
  schema: './utils/schema.js',
  dialect: 'postgresql',
  dbCredentials: {
    url:'postgresql://neondb_owner:npg_pvb6DVQJA1zL@ep-bitter-glade-a4fwccjb-pooler.us-east-1.aws.neon.tech/expense-tracker?sslmode=require&channel_binding=require',
  },
});
