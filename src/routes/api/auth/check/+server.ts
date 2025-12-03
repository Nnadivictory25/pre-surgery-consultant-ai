import { isUserLoggedIn } from '$lib/server/db/utils';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	const { userId } = await request.json();
	const loggedIn = await isUserLoggedIn(userId);
	return new Response(JSON.stringify({ loggedIn }), {
		headers: { 'Content-Type': 'application/json' }
	});
};
