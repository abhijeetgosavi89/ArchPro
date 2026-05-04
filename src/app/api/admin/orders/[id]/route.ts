import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// PATCH: Admin approves or rejects an order
export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { id } = await params;
        const body = await req.json();
        const { action, note } = body; // action: 'approve' | 'reject'

        if (!['approve', 'reject'].includes(action)) {
            return NextResponse.json({ error: 'Invalid action. Use approve or reject.' }, { status: 400 });
        }

        const newStatus = action === 'approve' ? 'COMPLETED' : 'CANCELLED';
        const eventStatus = action === 'approve' ? 'APPROVED' : 'REJECTED';
        const description = action === 'approve'
            ? `Order approved by admin (${session.user.email}). Plans are now available for download. ${note ? `Note: ${note}` : ''}`
            : `Order rejected by admin (${session.user.email}). ${note ? `Reason: ${note}` : ''}`;

        const order = await prisma.order.update({
            where: { id },
            data: {
                status: newStatus,
                events: {
                    create: {
                        status: eventStatus,
                        description,
                    }
                }
            },
            include: {
                items: { include: { plan: true } },
                events: { orderBy: { createdAt: 'desc' } }
            }
        });

        return NextResponse.json(order);
    } catch (error: any) {
        console.error('Order update error:', error);
        return NextResponse.json({ error: 'Failed to update order', detail: error?.message }, { status: 500 });
    }
}

// GET: Single order detail
export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { id } = await params;
        const order = await prisma.order.findUnique({
            where: { id },
            include: {
                items: { include: { plan: { include: { images: true } } } },
                events: { orderBy: { createdAt: 'desc' } }
            }
        });

        if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        return NextResponse.json(order);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
    }
}
