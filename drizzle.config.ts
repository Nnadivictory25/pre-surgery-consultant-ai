import { defineConfig } from 'drizzle-kit';

const databaseUrl = process.env.DATABASE_URL || './chatbot.db';

export default defineConfig({
	dialect: 'sqlite', // 'mysql' | 'sqlite' | 'turso'
	schema: './src/lib/server/db/schema.ts',
	dbCredentials: {
		url: databaseUrl
	}
});
