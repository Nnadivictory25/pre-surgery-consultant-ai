import { db } from '$lib/server/db';
import { messageRatings } from '$lib/server/db/schema';
import { json, type RequestEvent } from '@sveltejs/kit';
import { eq, and } from 'drizzle-orm';

export const POST = async ({ request, cookies }: RequestEvent) => {
    const userId = cookies.get('userId');
    const { sessionId, messageIndex, messageContent, rating } = await request.json();

    if (!userId) {
        return json({ error: 'No userId' }, { status: 401 });
    }

    if (!sessionId || messageIndex === undefined || !messageContent || !rating) {
        return json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (rating !== 1 && rating !== -1) {
        return json({ error: 'Rating must be 1 (thumbs up) or -1 (thumbs down)' }, { status: 400 });
    }

    // Check if rating already exists for this message
    const existingRating = await db
        .select()
        .from(messageRatings)
        .where(
            and(
                eq(messageRatings.userId, userId),
                eq(messageRatings.sessionId, sessionId),
                eq(messageRatings.messageIndex, messageIndex)
            )
        )
        .limit(1);

    if (existingRating.length > 0) {
        // Update existing rating
        await db
            .update(messageRatings)
            .set({ rating, messageContent })
            .where(eq(messageRatings.id, existingRating[0].id));
    } else {
        // Insert new rating
        await db.insert(messageRatings).values({
            userId,
            sessionId,
            messageIndex,
            messageContent,
            rating
        });
    }

    return json({ success: true });
};
