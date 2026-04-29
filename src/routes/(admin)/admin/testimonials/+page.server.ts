import type { PageServerLoad, Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
	const testimonials = await locals.pb.collection('testimonials').getFullList({ sort: 'sort_order' });

	return {
		testimonials: testimonials.map((t) => ({
			id: t.id,
			name: t.name,
			role: t.role ?? '',
			body: t.body,
			rating: t.rating ?? 0,
			active: t.active ?? false,
			sort_order: t.sort_order ?? 0,
			avatar: t.avatar,
			avatarUrl: t.avatar ? locals.pb.files.getUrl(t, t.avatar) : '',
		})),
	};
};

export const actions: Actions = {
	create: async ({ request, locals }) => {
		const data = await request.formData();
		const name = (data.get('name') as string)?.trim();
		const role = (data.get('role') as string)?.trim() || undefined;
		const body = (data.get('body') as string)?.trim();
		const rating = data.get('rating') ? parseFloat(data.get('rating') as string) : undefined;
		const sortOrder = data.get('sort_order') ? parseInt(data.get('sort_order') as string) : 0;
		const active = data.get('active') === 'on';

		if (!name || !body) return fail(400, { error: 'Name and body are required.' });

		const avatar = (data.get('avatar') as File | null);
		const createData: Record<string, unknown> = { name, role, body, rating, sort_order: sortOrder, active };
		if (avatar && avatar.size > 0) createData.avatar = avatar;

		await locals.pb.collection('testimonials').create(createData);
		throw redirect(303, '/admin/testimonials');
	},

	update: async ({ request, locals }) => {
		const data = await request.formData();
		const id = data.get('id') as string;
		const name = (data.get('name') as string)?.trim();
		const role = (data.get('role') as string)?.trim() || undefined;
		const body = (data.get('body') as string)?.trim();
		const rating = data.get('rating') ? parseFloat(data.get('rating') as string) : undefined;
		const sortOrder = data.get('sort_order') ? parseInt(data.get('sort_order') as string) : 0;
		const active = data.get('active') === 'on';

		if (!name || !body) return fail(400, { error: 'Name and body are required.' });

		const avatar = (data.get('avatar') as File | null);
		const updateData: Record<string, unknown> = { name, role, body, rating, sort_order: sortOrder, active };
		if (avatar && avatar.size > 0) updateData.avatar = avatar;

		await locals.pb.collection('testimonials').update(id, updateData);
		throw redirect(303, '/admin/testimonials');
	},

	delete: async ({ request, locals }) => {
		const id = (await request.formData()).get('id') as string;
		if (!id) return fail(400, { error: 'Missing ID' });
		await locals.pb.collection('testimonials').delete(id);
		throw redirect(303, '/admin/testimonials');
	},
};
