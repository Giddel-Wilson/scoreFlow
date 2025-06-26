import { verifyJWT, type JWTPayload } from '$lib/auth.js';
import { prisma } from '$lib/db.js';
import { redirect } from '@sveltejs/kit';

export async function authenticateUser(cookies: any): Promise<JWTPayload | null> {
	const token = cookies.get('auth');
	if (!token) return null;

	try {
		const payload = verifyJWT(token);
		// Verify user still exists and is active
		const user = await prisma.user.findUnique({
			where: { id: payload.userId },
			include: { department: true }
		});

		if (!user) return null;

		return {
			userId: user.id,
			email: user.email,
			name: user.name,
			role: user.role,
			departmentId: user.departmentId || undefined
		};
	} catch {
		return null;
	}
}

export function requireAuth(user: JWTPayload | null) {
	if (!user) {
		throw redirect(302, '/login');
	}
	return user;
}

export function requireRole(user: JWTPayload | null, allowedRoles: string[]) {
	const authUser = requireAuth(user);
	if (!allowedRoles.includes(authUser.role)) {
		throw redirect(302, '/login');
	}
	return authUser;
}
