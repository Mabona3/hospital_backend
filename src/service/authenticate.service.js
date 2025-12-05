import { SignJWT } from 'jose';

export default async function createToken({ sub, role }) {
    try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET);

        const token = await new SignJWT({ sub, role })
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime('7d')
            .sign(secret);

        return token;
    } catch (error) {
        console.error('Error creating JWT token:', error);
        throw new Error('Failed to create token');
    }
}

