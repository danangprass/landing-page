import type { PageServerLoad, Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
	const subscribers = await locals.pb.collection('newsletter_subscribers').getFullList({
		sort: 'email',
		$autoCancel: false,
	}).catch(() => []);

	return {
		subscribers: subscribers.map((s) => ({
			id: s.id,
			email: s.email,
			active: s.active ?? false,
			created: s.created,
		})),
	};
};

export const actions: Actions = {
	toggleActive: async ({ request, locals }) => {
		const data = await request.formData();
		const id = data.get('id') as string;
		const active = data.get('active') === 'true';
		await locals.pb.collection('newsletter_subscribers').update(id, { active: !active });
		throw redirect(303, '/admin/newsletter');
	},

	delete: async ({ request, locals }) => {
		const data = await request.formData();
		const id = data.get('id') as string;
		if (!id) return fail(400, { error: 'Missing ID' });
		await locals.pb.collection('newsletter_subscribers').delete(id);
		throw redirect(303, '/admin/newsletter');
	},
};
