import { getConversation } from '$lib/server/db/utils.js';
import type { PageServerLoad } from './$types';
import type { UIMessage } from 'ai';

export const load: PageServerLoad = async ({ cookies, locals }) => {
	const userId = cookies.get('userId');
	if (userId) {
		locals.userId = userId;
		const conv = await getConversation(userId);
		return {
			conversation: (conv?.chat as UIMessage[]) || [],
			email: cookies.get('email') || '',
			name: cookies.get('name') || ''
		};
	}
	return {
		conversation: [] as UIMessage[],
		email: '',
		name: ''
	};
};
