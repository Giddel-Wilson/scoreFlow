import type { PageServerLoad, Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { createPasswordResetRequest, sendPasswordResetEmail } from '$lib/password-reset';

export const load: PageServerLoad = async ({ locals }) => {
	// Redirect if already logged in
	if (locals.user) {
		throw redirect(302, '/dashboard');
	}
	return {};
};

export const actions: Actions = {
	default: async ({ request }) => {
		const data = await request.formData();
		const email = data.get('email') as string;

		if (!email) {
			return fail(400, { error: 'Email is required' });
		}

		try {
			const token = await createPasswordResetRequest(email);
			await sendPasswordResetEmail(email, token);

			return { 
				success: 'If an account with that email exists, we\'ve sent a password reset link.' 
			};
		} catch (error: any) {
			// Don't reveal whether the email exists or not for security
			return { 
				success: 'If an account with that email exists, we\'ve sent a password reset link.' 
			};
		}
	}
};
