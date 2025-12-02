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
