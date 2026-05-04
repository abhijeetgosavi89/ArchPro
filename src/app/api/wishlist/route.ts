import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';


// GET: Fetch user's wishlist
export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const wishlist = await prisma.wishlist.findMany({
            where: { userId: session.user.id },
            include: {
                plan: {
                    include: {
                        images: true, // Need image for card
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(wishlist);
    } catch (error) {
        console.error('Error fetching wishlist:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST: Add plan to wishlist
export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { planId } = await req.json();
        if (!planId) return NextResponse.json({ error: 'Plan ID required' }, { status: 400 });

        const wishlistItem = await prisma.wishlist.create({
            data: {
                userId: session.user.id,
                planId,
            },
        });

        return NextResponse.json(wishlistItem);
    } catch (error) {
        console.error('Error adding to wishlist:', error);
        // Check for duplicate key error (P2002)
        return NextResponse.json({ error: 'Error adding to wishlist' }, { status: 500 });
    }
}
