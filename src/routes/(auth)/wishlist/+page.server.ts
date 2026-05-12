import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	return { _title: 'Wishlist | ElectraStore' };
};
