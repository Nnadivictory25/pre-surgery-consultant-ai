import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { OPENROUTER_API_KEY } from '$env/static/private';

export const openrouter = createOpenRouter({
    apiKey: OPENROUTER_API_KEY,
});

// Choose your preferred free model
export const defaultModel = 'x-ai/grok-4.1-fast:free';