import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { prisma } from '$lib/db';

export const actions: Actions = {
	default: async ({ cookies, locals }) => {
		// Log the logout if user is authenticated
		if (locals.user) {
			try {
				await prisma.auditLog.create({
					data: {
						userId: locals.user.userId,
						action: 'LOGOUT',
						target: 'User',
						details: { email: locals.user.email }
					}
				});
			} catch (error) {
				console.error('Error logging logout:', error);
			}
		}

		// Delete auth cookie
		cookies.delete('auth', { path: '/' });

		throw redirect(302, '/login');
	}
};
