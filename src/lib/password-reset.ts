import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

export interface PasswordResetRequest {
	email: string;
	token: string;
	expiresAt: Date;
}

// Generate a secure password reset token
export function generateResetToken(): string {
	return crypto.randomBytes(32).toString('hex');
}

// Create a password reset request
export async function createPasswordResetRequest(email: string): Promise<string> {
	const token = generateResetToken();
	const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

	// First, check if user exists
	const user = await prisma.user.findUnique({
		where: { email }
	});

	if (!user) {
		throw new Error('User not found');
	}

	// Delete any existing reset tokens for this user
	await prisma.passwordResetToken.deleteMany({
		where: { email }
	});

	// Create new reset token
	await prisma.passwordResetToken.create({
		data: {
			email,
			token,
			expiresAt
		}
	});

	return token;
}

// Verify and use a password reset token
export async function verifyResetToken(token: string): Promise<string | null> {
	const resetRequest = await prisma.passwordResetToken.findUnique({
		where: { token }
	});

	if (!resetRequest) {
		return null;
	}

	if (resetRequest.expiresAt < new Date()) {
		// Token expired, delete it
		await prisma.passwordResetToken.delete({
			where: { token }
		});
		return null;
	}

	return resetRequest.email;
}

// Delete a used password reset token
export async function deleteResetToken(token: string): Promise<void> {
	await prisma.passwordResetToken.delete({
		where: { token }
	});
}

// Clean up expired tokens (should be run periodically)
export async function cleanupExpiredTokens(): Promise<void> {
	await prisma.passwordResetToken.deleteMany({
		where: {
			expiresAt: {
				lt: new Date()
			}
		}
	});
}

// Simple email sending function (in production, use a proper email service like SendGrid, Mailgun, etc.)
export async function sendPasswordResetEmail(email: string, token: string): Promise<void> {
	// In development, just log the reset link
	const resetLink = `${process.env.ORIGIN || 'http://localhost:5173'}/reset-password?token=${token}`;
	
	console.log(`\n=== PASSWORD RESET EMAIL ===`);
	console.log(`To: ${email}`);
	console.log(`Subject: Reset your ScoreFlow password`);
	console.log(`Reset Link: ${resetLink}`);
	console.log(`This link expires in 24 hours.`);
	console.log(`=============================\n`);

	// In production, you would use a real email service:
	// await emailService.send({
	//   to: email,
	//   subject: 'Reset your ScoreFlow password',
	//   html: `
	//     <h2>Password Reset Request</h2>
	//     <p>Click the link below to reset your password:</p>
	//     <a href="${resetLink}">Reset Password</a>
	//     <p>This link expires in 24 hours.</p>
	//     <p>If you didn't request this reset, please ignore this email.</p>
	//   `
	// });
}
