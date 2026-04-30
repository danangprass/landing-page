import type { PageServerLoad, Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
	const categories = await locals.pb.collection('categories').getFullList({
		sort: 'name',
		fields: 'id,name,slug',
	});
	return { categories };
};

export const actions: Actions = {
	create: async ({ request, locals }) => {
		const data = await request.formData();

		const name = (data.get('name') as string)?.trim();
		const slug = (data.get('slug') as string)?.trim();
		const price = parseFloat(data.get('price') as string);
		const category = data.get('category') as string;
		const description = (data.get('description') as string)?.trim() || undefined;
		const compareAtPrice = data.get('compare_at_price')
			? parseFloat(data.get('compare_at_price') as string)
			: undefined;
		const stock = data.get('stock') ? parseInt(data.get('stock') as string) : undefined;
		const sku = (data.get('sku') as string)?.trim() || undefined;
		const featured = data.get('featured') === 'on';
		const active = data.get('active') === 'on';

		if (!name || !slug || isNaN(price) || !category) {
			return fail(400, {
				error: 'Name, slug, price, and category are required.',
				values: { name, slug, price, category, description, compareAtPrice, stock, sku, featured, active },
			});
		}

		if (compareAtPrice !== undefined && isNaN(compareAtPrice)) {
			return fail(400, {
				error: 'Invalid compare at price.',
				values: { name, slug, price, category, description, compareAtPrice, stock, sku, featured, active },
			});
		}
		if (stock !== undefined && isNaN(stock)) {
			return fail(400, {
				error: 'Invalid stock value.',
				values: { name, slug, price, category, description, compareAtPrice, stock, sku, featured, active },
			});
		}

		const images = data.getAll('images').filter((f) => f instanceof File && f.size > 0) as File[];

		await locals.pb.collection('products').create({
			name,
			slug,
			price,
			category,
			description,
			compare_at_price: compareAtPrice,
			stock,
			sku,
			featured,
			active,
			images: images.length > 0 ? images : undefined,
		});

		throw redirect(303, '/admin/products');
	},
};
