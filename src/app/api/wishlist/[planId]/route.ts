import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';


// DELETE: Remove plan from wishlist
export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ planId: string }> }
) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { planId } = await params;

        await prisma.wishlist.deleteMany({
            where: {
                userId: session.user.id,
                planId: planId,
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error removing from wishlist:', error);
        return NextResponse.json({ error: 'Error removing from wishlist' }, { status: 500 });
    }
}
