import { streamText, type UIMessage, convertToModelMessages, type ModelMessage } from 'ai';
import { openrouter, defaultModel } from '$lib/ai-config';
import type { RequestHandler } from './$types';
import { saveConversation } from '$lib/server/db/utils';

export const POST: RequestHandler = async ({ request, cookies }) => {
    const { messages }: { messages: UIMessage[] } = await request.json();
    const userId = cookies.get('userId');
    if (!userId) {
        throw new Error('No userId');
    }

    const result = streamText({
        model: openrouter(defaultModel),
        messages: convertToModelMessages(messages),
        system: `You are a helpful doctor assistant for a pre-surgery consultation. Your job is to help patients prepare for their surgery by answering their questions and providing them with information about the surgery and what to expect.
        You should make them know what to eat, drink, and avoid before and after the surgery.
        State explicitly what they should do carefully

        MAKE SURE YOU DON'T GO BEYOND YOUR SCOPE OF WORK.
        ANSWER IN MARKDOWN FORMAT AND BE PRECISE (YES THE PATEINT WILL VISIT A DOCTOR FOR CONSULTATION, BUT YOU ARE THE ASSISTANT, SO DON'T TELL THEM TO VISIT A DOCTOR)
        `,
    });

    return result.toUIMessageStreamResponse({
        onFinish: async ({ messages }) => {
            await saveConversation({ userId, chat: messages });
        }
    });
};
