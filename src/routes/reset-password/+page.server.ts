import type { PageServerLoad, Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { verifyResetToken, deleteResetToken } from '$lib/password-reset';
import { hashPassword } from '$lib/auth';
import { prisma } from '$lib/db';

export const load: PageServerLoad = async ({ url, locals }) => {
	// Redirect if already logged in
	if (locals.user) {
		throw redirect(302, '/dashboard');
	}

	const token = url.searchParams.get('token');
	if (!token) {
		throw redirect(302, '/login');
	}

	// Verify token is valid
	const email = await verifyResetToken(token);
	if (!email) {
		throw redirect(302, '/login');
	}

	return { token, email };
};

export const actions: Actions = {
	default: async ({ request, url }) => {
		const data = await request.formData();
		const token = data.get('token') as string;
		const password = data.get('password') as string;
		const confirmPassword = data.get('confirmPassword') as string;

		if (!token || !password || !confirmPassword) {
			return fail(400, { error: 'All fields are required' });
		}

		if (password !== confirmPassword) {
			return fail(400, { error: 'Passwords do not match' });
		}

		if (password.length < 6) {
			return fail(400, { error: 'Password must be at least 6 characters' });
		}

		try {
			// Verify token is still valid
			const email = await verifyResetToken(token);
			if (!email) {
				return fail(400, { error: 'Invalid or expired reset token' });
			}

			// Update password
			const hashedPassword = await hashPassword(password);
			await prisma.user.update({
				where: { email },
				data: { passwordHash: hashedPassword }
			});

			// Delete the used token
			await deleteResetToken(token);

			// Log the password reset
			const user = await prisma.user.findUnique({
				where: { email }
			});

			if (user) {
				await prisma.auditLog.create({
					data: {
						userId: user.id,
						action: 'PASSWORD_RESET',
						target: 'USER',
						details: 'Password reset successfully'
					}
				});
			}

			throw redirect(302, '/login?message=Password reset successfully');
		} catch (error: any) {
			if (error.status === 302) {
				throw error; // Re-throw redirect
			}
			return fail(500, { error: 'Failed to reset password. Please try again.' });
		}
	}
};
