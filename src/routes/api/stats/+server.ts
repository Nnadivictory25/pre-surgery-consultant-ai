import { db } from '$lib/server/db';
import { sessions, messageRatings } from '$lib/server/db/schema';
import { json, type RequestEvent } from '@sveltejs/kit';
import { eq, count, avg } from 'drizzle-orm';

export const GET = async ({ cookies }: RequestEvent) => {
    const userId = cookies.get('userId');

    if (!userId) {
        return json({ error: 'No userId' }, { status: 401 });
    }

    // Get session statistics
    const sessionStats = await db
        .select({
            totalSessions: count(),
            avgDuration: avg(sessions.durationSeconds)
        })
        .from(sessions)
        .where(eq(sessions.userId, userId));

    // Get rating statistics
    const allRatings = await db
        .select()
        .from(messageRatings)
        .where(eq(messageRatings.userId, userId));

    const totalRatings = allRatings.length;
    const positiveRatings = allRatings.filter((r) => r.rating === 1).length;
    const negativeRatings = allRatings.filter((r) => r.rating === -1).length;

    const positivePercentage = totalRatings > 0 ? (positiveRatings / totalRatings) * 100 : 0;
    const negativePercentage = totalRatings > 0 ? (negativeRatings / totalRatings) * 100 : 0;

    // Convert average duration to minutes
    const avgDurationSeconds = Math.round(Number(sessionStats[0]?.avgDuration) || 0);
    const avgDurationMinutes = Math.round((avgDurationSeconds / 60) * 10) / 10; // Round to 1 decimal

    return json({
        sessions: {
            total: sessionStats[0]?.totalSessions || 0,
            averageDurationMinutes: avgDurationMinutes,
            averageDurationSeconds: avgDurationSeconds
        },
        ratings: {
            total: totalRatings,
            positive: positiveRatings,
            negative: negativeRatings,
            positivePercentage: Math.round(positivePercentage * 10) / 10,
            negativePercentage: Math.round(negativePercentage * 10) / 10
        }
    });
};
