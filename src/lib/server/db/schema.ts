import type { UIMessage } from 'ai';
import { customType, integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

const json = <TData>(name: string) =>
	customType<{ data: TData; driverData: string }>({
		dataType() {
			return 'text';
		},
		toDriver(value: TData): string {
			return JSON.stringify(value);
		},
		fromDriver(value: string): TData {
			return JSON.parse(value);
		}
	})(name);

export const conversation = sqliteTable(
	'conversation',
	{
		id: text('id')
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		userId: text('user_id').notNull(),
		chat: json<UIMessage[]>('chat'),
		createdAt: integer('created_at').$defaultFn(() => Date.now()),
		updatedAt: integer('updated_at')
			.$defaultFn(() => Date.now())
			.$onUpdate(() => Date.now())
	},
	(table) => [uniqueIndex('user_id_index').on(table.userId)]
);

export const users = sqliteTable('users', {
	userId: text('user_id').primaryKey(),
	email: text('email').notNull(),
	name: text('name').notNull()
});

// Session timing table
export const sessions = sqliteTable('sessions', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	userId: text('user_id').notNull(),
	startTime: integer('start_time').$defaultFn(() => Date.now()),
	endTime: integer('end_time'),
	durationSeconds: integer('duration_seconds')
});

// Message ratings table for accuracy measurement
export const messageRatings = sqliteTable('message_ratings', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	userId: text('user_id').notNull(),
	sessionId: text('session_id').notNull(),
	messageIndex: integer('message_index').notNull(),
	messageContent: text('message_content').notNull(),
	rating: integer('rating').notNull(), // 1 for thumbs up, -1 for thumbs down
	createdAt: integer('created_at').$defaultFn(() => Date.now())
});
