import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

const sql = neon("postgresql://neondb_owner:npg_pvb6DVQJA1zL@ep-bitter-glade-a4fwccjb-pooler.us-east-1.aws.neon.tech/expense-tracker?sslmode=require&channel_binding=require");
export const db = drizzle({ client: sql, schema });