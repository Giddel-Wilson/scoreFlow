import type { Handle } from '@sveltejs/kit';
import { authenticateUser } from '$lib/server/auth';

export const handle: Handle = async ({ event, resolve }) => {
	// Authenticate user and add to locals
	event.locals.user = await authenticateUser(event.cookies);

	return resolve(event);
};
