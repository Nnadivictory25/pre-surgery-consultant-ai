import { db } from '$lib/server/db';
import { sessions } from '$lib/server/db/schema';
import { json, type RequestEvent } from '@sveltejs/kit';
import { eq, and } from 'drizzle-orm';

export const POST = async ({ request, cookies }: RequestEvent) => {
    const userId = cookies.get('userId');
    const { sessionId } = await request.json();

    if (!userId || !sessionId) {
        return json({ error: 'Missing userId or sessionId' }, { status: 400 });
    }

    // Get session to calculate duration
    const sessionRecords = await db
        .select()
        .from(sessions)
        .where(and(eq(sessions.id, sessionId), eq(sessions.userId, userId)))
        .limit(1);

    if (sessionRecords.length === 0) {
        return json({ error: 'Session not found' }, { status: 404 });
    }

    const session = sessionRecords[0];
    const endTime = Date.now();
    const durationSeconds = Math.floor((endTime - (session.startTime || 0)) / 1000);

    // Update session with end time and duration
    await db
        .update(sessions)
        .set({ endTime, durationSeconds })
        .where(eq(sessions.id, sessionId));

    return json({ success: true, durationSeconds });
};
