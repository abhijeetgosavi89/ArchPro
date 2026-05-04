import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET: Fetch orders for the logged-in user
export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const orders = await prisma.order.findMany({
            where: { customerEmail: session.user.email },
            orderBy: { createdAt: 'desc' },
            include: {
                items: {
                    include: { plan: { include: { images: true } } }
                },
                events: { orderBy: { createdAt: 'desc' } }
            }
        });

        return NextResponse.json(orders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        return NextResponse.json({ error: 'Error fetching orders' }, { status: 500 });
    }
}

// POST: Create a new order (called from checkout page)
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const {
            customerName,
            customerEmail,
            phone,
            address,
            items,
            total,
            paymentMethod,
            cardLastFour,
        } = body;

        if (!customerName || !customerEmail || !items?.length || !total) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Generate unique order number
        const orderNumber = `ARCH-${Date.now().toString().slice(-8).toUpperCase()}`;

        const order = await prisma.order.create({
            data: {
                orderNumber,
                customerName,
                customerEmail,
                total: parseFloat(total),
                status: 'PENDING', // Awaiting admin approval
                items: {
                    create: items.map((item: { planId: string; price: number }) => ({
                        planId: item.planId,
                        price: parseFloat(String(item.price)),
                    })),
                },
                events: {
                    create: {
                        status: 'ORDER_PLACED',
                        description: `Order placed by ${customerName}. Payment method: ${paymentMethod || 'DEMO'}${cardLastFour ? ` ending in ${cardLastFour}` : ''}. Billing address: ${address || 'N/A'}. Contact: ${phone || 'N/A'}.`,
                    }
                }
            },
        });

        return NextResponse.json(order, { status: 201 });
    } catch (error: any) {
        console.error('Error creating order:', error);
        return NextResponse.json({ error: 'Error creating order', detail: error?.message }, { status: 500 });
    }
}
