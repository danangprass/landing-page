import type { PageServerLoad, Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
	const banners = await locals.pb.collection('banners').getFullList({ sort: 'sort_order' });

	return {
		banners: banners.map((b) => ({
			id: b.id,
			title: b.title ?? '',
			subtitle: b.subtitle ?? '',
			link_url: b.link_url ?? '',
			active: b.active ?? false,
			sort_order: b.sort_order ?? 0,
			image: b.image,
			imageUrl: b.image ? locals.pb.files.getUrl(b, b.image) : '',
		})),
	};
};

export const actions: Actions = {
	create: async ({ request, locals }) => {
		const data = await request.formData();
		const title = (data.get('title') as string)?.trim() || undefined;
		const subtitle = (data.get('subtitle') as string)?.trim() || undefined;
		const linkUrl = (data.get('link_url') as string)?.trim() || undefined;
		const sortOrder = data.get('sort_order') ? parseInt(data.get('sort_order') as string) : 0;
		const active = data.get('active') === 'on';

		const image = (data.get('image') as File | null);
		const createData: Record<string, unknown> = { title, subtitle, link_url: linkUrl, sort_order: sortOrder, active };
		if (image && image.size > 0) createData.image = image;

		await locals.pb.collection('banners').create(createData);
		throw redirect(303, '/admin/banners');
	},

	update: async ({ request, locals }) => {
		const data = await request.formData();
		const id = data.get('id') as string;
		const title = (data.get('title') as string)?.trim() || undefined;
		const subtitle = (data.get('subtitle') as string)?.trim() || undefined;
		const linkUrl = (data.get('link_url') as string)?.trim() || undefined;
		const sortOrder = data.get('sort_order') ? parseInt(data.get('sort_order') as string) : 0;
		const active = data.get('active') === 'on';

		const image = (data.get('image') as File | null);
		const updateData: Record<string, unknown> = { title, subtitle, link_url: linkUrl, sort_order: sortOrder, active };
		if (image && image.size > 0) updateData.image = image;

		await locals.pb.collection('banners').update(id, updateData);
		throw redirect(303, '/admin/banners');
	},

	delete: async ({ request, locals }) => {
		const id = (await request.formData()).get('id') as string;
		if (!id) return fail(400, { error: 'Missing ID' });
		await locals.pb.collection('banners').delete(id);
		throw redirect(303, '/admin/banners');
	},
};
