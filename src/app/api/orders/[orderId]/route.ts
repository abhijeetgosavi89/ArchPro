import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(
    req: Request,
    { params }: { params: Promise<{ orderId: string }> }
) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { orderId } = await params;

    const order = await prisma.order.findFirst({
        where: {
            id: orderId,
            customerEmail: session.user.email,
            status: 'COMPLETED', // Only approved orders
        },
        include: {
            items: {
                include: {
                    plan: {
                        include: { images: true, specs: true }
                    }
                }
            }
        }
    });

    if (!order) {
        return NextResponse.json({ error: 'Order not found or not approved' }, { status: 404 });
    }

    return NextResponse.json(order);
}
