import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { env } from '$env/dynamic/private';

export function getOpenRouter() {
	const apiKey = env.OPENROUTER_API_KEY;
	if (!apiKey) {
		throw new Error('OPENROUTER_API_KEY environment variable is not set');
	}
	return createOpenRouter({
		apiKey: apiKey
	});
}

// Choose your preferred free model
export const defaultModel = 'mistralai/ministral-14b-2512';
