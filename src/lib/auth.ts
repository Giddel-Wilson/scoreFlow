import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { JWT_SECRET } from '$env/static/private';

export interface JWTPayload {
	userId: number;
	email: string;
	name: string;
	role: string;
	departmentId?: number;
}

export async function hashPassword(password: string): Promise<string> {
	const saltRounds = 12;
	return await bcrypt.hash(password, saltRounds);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
	return await bcrypt.compare(password, hash);
}

export function signJWT(payload: JWTPayload): string {
	return jwt.sign(payload, JWT_SECRET, {
		expiresIn: '7d',
	});
}

export function verifyJWT(token: string): JWTPayload {
	return jwt.verify(token, JWT_SECRET) as JWTPayload;
}

export function createAuthCookie(token: string): string {
	return `auth=${token}; HttpOnly; Path=/; Max-Age=${7 * 24 * 60 * 60}; SameSite=Strict${
		process.env.NODE_ENV === 'production' ? '; Secure' : ''
	}`;
}
