import { db } from '$lib/server/db';
import { sessions } from '$lib/server/db/schema';
import { json, type RequestEvent } from '@sveltejs/kit';

export const POST = async ({ cookies }: RequestEvent) => {
    const userId = cookies.get('userId');

    if (!userId) {
        return json({ error: 'No userId' }, { status: 401 });
    }

    // Create new session
    const sessionId = crypto.randomUUID();
    await db.insert(sessions).values({
        id: sessionId,
        userId
    });

    return json({ sessionId });
};
