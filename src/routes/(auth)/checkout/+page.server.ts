import type { PageServerLoad } from './$types';
import { env } from '$env/dynamic/public';

export const load: PageServerLoad = async () => {
	return {
		clientKey: env.PUBLIC_MIDTRANS_CLIENT_KEY ?? '',
	};
};
