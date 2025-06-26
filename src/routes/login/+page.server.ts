import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { prisma } from '$lib/db';
import { verifyPassword, signJWT, createAuthCookie } from '$lib/auth';

export const load: PageServerLoad = async ({ locals, url }) => {
	// Redirect if already authenticated
	if (locals.user) {
		throw redirect(302, '/dashboard');
	}

	const message = url.searchParams.get('message');
	return { message };
};

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const data = await request.formData();
		const email = data.get('email')?.toString();
		const password = data.get('password')?.toString();

		if (!email || !password) {
			return fail(400, {
				error: 'Email and password are required',
				email
			});
		}

		try {
			// Find user by email
			const user = await prisma.user.findUnique({
				where: { email },
				include: { department: true }
			});

			if (!user) {
				return fail(400, {
					error: 'Invalid email or password',
					email
				});
			}

			// Verify password
			const isValidPassword = await verifyPassword(password, user.passwordHash);
			if (!isValidPassword) {
				return fail(400, {
					error: 'Invalid email or password',
					email
				});
			}

			// Create JWT token
			const token = signJWT({
				userId: user.id,
				email: user.email,
				name: user.name,
				role: user.role,
				departmentId: user.departmentId || undefined
			});

			// Set auth cookie
			cookies.set('auth', token, {
				path: '/',
				httpOnly: true,
				secure: process.env.NODE_ENV === 'production',
				sameSite: 'strict',
				maxAge: 60 * 60 * 24 * 7 // 7 days
			});

			// Log the login
			await prisma.auditLog.create({
				data: {
					userId: user.id,
					action: 'LOGIN',
					target: 'User',
					details: { email: user.email }
				}
			});

		} catch (error) {
			console.error('Login error:', error);
			return fail(500, {
				error: 'An error occurred during login',
				email
			});
		}

		throw redirect(302, '/dashboard');
	}
};
