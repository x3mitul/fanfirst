import { NextResponse } from 'next/server';
import { auth0 } from '@/lib/auth0';

export async function GET() {
    try {
        const session = await auth0.getSession();

        if (!session?.user) {
            return NextResponse.json({ user: null }, { status: 200 });
        }

        return NextResponse.json({
            user: {
                id: session.user.sub,
                name: session.user.name || 'User',
                email: session.user.email || '',
                picture: session.user.picture || null,
            }
        });
    } catch (error) {
        console.error('[Auth Profile] Error:', error);
        return NextResponse.json({ user: null }, { status: 200 });
    }
}
