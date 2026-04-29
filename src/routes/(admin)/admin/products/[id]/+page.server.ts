import type { PageServerLoad, Actions } from './$types';
import { error, fail, redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, locals }) => {
	const pb = locals.pb;

	try {
		const product = await pb.collection('products').getOne(params.id);
		const categories = await locals.pb.collection('categories').getFullList({
			sort: 'name',
			fields: 'id,name',
		});

		return {
			product: {
				id: product.id,
				name: product.name,
				slug: product.slug,
				description: product.description,
				price: product.price,
				compare_at_price: product.compare_at_price,
				category: product.category,
				stock: product.stock,
				sku: product.sku,
				featured: product.featured,
				active: product.active,
				images: product.images ?? [],
				imageUrls: (product.images ?? []).map((f: string) =>
					pb.files.getUrl(product, f)
				),
			},
			categories,
		};
	} catch {
		throw error(404, 'Product not found');
	}
};

export const actions: Actions = {
	update: async ({ request, params, locals }) => {
		const data = await request.formData();

		const name = (data.get('name') as string)?.trim();
		const slug = (data.get('slug') as string)?.trim();
		const price = parseFloat(data.get('price') as string);
		const category = data.get('category') as string;

		if (!name || !slug || !price || !category) {
			return fail(400, {
				error: 'Name, slug, price, and category are required.',
			});
		}

		const description = (data.get('description') as string)?.trim() || undefined;
		const compareAtPrice = data.get('compare_at_price')
			? parseFloat(data.get('compare_at_price') as string)
			: undefined;
		const stock = data.get('stock') ? parseInt(data.get('stock') as string) : undefined;
		const sku = (data.get('sku') as string)?.trim() || undefined;
		const featured = data.get('featured') === 'on';
		const active = data.get('active') === 'on';

		const newImages = data.getAll('images').filter((f) => f instanceof File && f.size > 0) as File[];

		const updateData: Record<string, unknown> = {
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
		};

		if (newImages.length > 0) {
			updateData.images = newImages;
		}

		await locals.pb.collection('products').update(params.id, updateData);

		throw redirect(303, '/admin/products');
	},
};
