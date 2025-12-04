import { streamText, type UIMessage, convertToModelMessages } from 'ai';
import { getOpenRouter, defaultModel } from '$lib/ai-config';
import { json, type RequestEvent } from '@sveltejs/kit';
import { saveConversation } from '$lib/server/db/utils';
import { db } from '$lib/server/db';
import { sessions } from '$lib/server/db/schema';
import { eq, and, isNull } from 'drizzle-orm';
import { z } from 'zod';

export const POST = async ({ request, cookies }: RequestEvent) => {
	const { messages, sessionId }: { messages: UIMessage[]; sessionId?: string } = await request.json();
	const userId = cookies.get('userId');
	if (!userId) {
		throw new Error('No userId');
	}

	// Use sessionId from request, or find the most recent active session for this user
	let activeSessionId: string | undefined = sessionId;
	if (!activeSessionId) {
		const activeSessions = await db
			.select()
			.from(sessions)
			.where(and(eq(sessions.userId, userId), isNull(sessions.endTime)))
			.orderBy(sessions.startTime)
			.limit(1);

		activeSessionId = activeSessions.length > 0 ? activeSessions[0].id : undefined;
	}

	const result = streamText({
		model: getOpenRouter()(defaultModel),
		messages: convertToModelMessages(messages),
		system: `You are a helpful doctor assistant for a pre-surgery consultation. Your job is to help patients prepare for their surgery by answering their questions and providing them with information about the surgery and what to expect.
        You should make them know what to eat, drink, and avoid before and after the surgery.
        State explicitly what they should do carefully.
        You can as well ask them some questions, get some basic information about them before proceeding with the consultation.

        MAKE SURE YOU DON'T GO BEYOND YOUR SCOPE OF WORK.
        ANSWER IN MARKDOWN FORMAT AND BE PRECISE (YES THE PATIENT WILL VISIT A DOCTOR FOR CONSULTATION, BUT YOU ARE THE ASSISTANT, SO DON'T TELL THEM TO VISIT A DOCTOR)
        
        When you feel the consultation is complete (the patient has no more questions and you've covered all important pre-surgery information), use the endSession tool to mark the consultation as finished.
        `,
		tools: {
			endSession: {
				description: 'End the current consultation session when the pre-surgery consultation is complete and the patient has no more questions.',
				inputSchema: z.object({
					summary: z.string().describe('A brief summary of what was discussed in this consultation')
				}),
				execute: async ({ summary }: { summary: string }) => {
					if (activeSessionId) {
						const endTime = Date.now();
						const sessionRecords = await db
							.select()
							.from(sessions)
							.where(and(eq(sessions.id, activeSessionId), eq(sessions.userId, userId)))
							.limit(1);

						if (sessionRecords.length > 0) {
							const session = sessionRecords[0];
							const durationSeconds = Math.floor((endTime - (session.startTime || 0)) / 1000);

							await db
								.update(sessions)
								.set({ endTime, durationSeconds })
								.where(eq(sessions.id, activeSessionId));

							return {
								success: true,
								message: 'Session ended successfully. Thank you for consulting with me today!',
								duration: durationSeconds,
								summary
							};
						}
					}
					return { success: false, message: 'No active session found' };
				}
			}
		}
	});

	return result.toUIMessageStreamResponse({
		originalMessages: messages,
		onFinish: async ({ messages: fullMessages }) => {
			await saveConversation({ userId, chat: fullMessages });
		}
	});
};
