import { drizzle } from 'drizzle-orm/bun-sqlite';
import * as schema from './schema';
import { Database } from 'bun:sqlite';
import { env } from '$env/dynamic/private';

const databaseUrl = env.DATABASE_URL || './chatbot.db';

const client = new Database(databaseUrl);

export const db = drizzle(client, { schema });
