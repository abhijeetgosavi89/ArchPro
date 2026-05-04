import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';


// GET: Fetch reviews for a plan
export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: planId } = await params;

        const reviews = await prisma.review.findMany({
            where: { planId },
            include: {
                user: {
                    select: { name: true, image: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(reviews);
    } catch (error) {
        console.error('Error fetching reviews:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST: Add a review
export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { id: planId } = await params;
        const { rating, title, content } = await req.json();

        if (!rating || !content) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        const review = await prisma.review.create({
            data: {
                planId,
                userId: session.user.id,
                rating: Number(rating),
                title,
                content,
            },
            include: {
                user: {
                    select: { name: true, image: true }
                }
            }
        });

        // Update Plan aggregates (simple approach for now)
        // In a real app, you might want to do this via a transaction or background job
        const aggregates = await prisma.review.aggregate({
            where: { planId },
            _avg: { rating: true },
            _count: { rating: true }
        });

        await prisma.plan.update({
            where: { id: planId },
            data: {
                rating: aggregates._avg.rating || 0,
                reviewCount: aggregates._count.rating || 0
            }
        });

        return NextResponse.json(review);
    } catch (error) {
        console.error('Error posting review:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
