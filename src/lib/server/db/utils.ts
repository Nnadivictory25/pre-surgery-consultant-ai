import type { UIMessage } from 'ai';
import { conversation, users } from './schema';
import { db } from '.';
import { eq } from 'drizzle-orm';

export async function saveConversation({ userId, chat }: { userId: string; chat: UIMessage[] }) {
	const exists = await db.query.conversation.findFirst({
		where: eq(conversation.userId, userId)
	});

	if (exists) {
		await db.update(conversation).set({ chat }).where(eq(conversation.id, exists.id));
	} else {
		await db.insert(conversation).values({ userId, chat });
		console.log('Conversation saved');
	}
}

export async function getConversation(userId: string) {
	return await db.query.conversation.findFirst({
		where: eq(conversation.userId, userId)
	});
}

export async function saveUser({
	userId,
	email,
	name
}: {
	userId: string;
	email: string;
	name: string;
}) {
	const exists = await db.query.users.findFirst({
		where: eq(users.userId, userId)
	});

	if (exists) {
		await db.update(users).set({ email, name }).where(eq(users.userId, userId));
	} else {
		await db.insert(users).values({ userId, email, name });
	}
}

export async function isUserLoggedIn(userId: string) {
	const user = await db.query.users.findFirst({
		where: eq(users.userId, userId)
	});
	return !!user;
}
