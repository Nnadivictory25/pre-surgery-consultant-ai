import { saveUser } from '$lib/server/db/utils';
import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const data = await request.formData();
		const email = data.get('email') as string;
		const name = data.get('name') as string;
		const password = data.get('password') as string; // ignored

		const userId = cookies.get('userId');
		if (!userId) {
			throw new Error('No userId');
		}

		await saveUser({ userId, email, name });

		cookies.set('email', email, { path: '/', maxAge: 31536000, sameSite: 'lax' });
		cookies.set('name', name, { path: '/', maxAge: 31536000, sameSite: 'lax' });

		throw redirect(303, '/');
	}
};
