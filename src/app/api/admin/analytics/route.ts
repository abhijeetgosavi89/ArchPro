import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';


export async function GET(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // 1. Fetch Key Metrics
        const totalUsers = await prisma.user.count();
        const totalPlans = await prisma.plan.count();
        // const totalOrders = await prisma.order.count(); // Assuming Order model exists, if not use 0 or mock
        // const totalRevenue = await prisma.order.aggregate({ _sum: { total: true } }); // Mock for now if no orders

        // Mocking Order data until Order model is fully implemented/populated
        const totalOrders = 0;
        const totalRevenue = 0;

        // 2. Fetch Recent Activity (New Users)
        const recentUsers = await prisma.user.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            select: { id: true, name: true, email: true, createdAt: true }
        });

        // 3. Fetch Popular Plans
        const popularPlans = await prisma.plan.findMany({
            take: 5,
            orderBy: { views: 'desc' },
            select: { id: true, title: true, views: true, planNumber: true }
        });

        // 4. Generate Chart Data (Mocking monthly revenue for now)
        const chartData = [
            { name: 'Jan', total: 1200 },
            { name: 'Feb', total: 2100 },
            { name: 'Mar', total: 800 },
            { name: 'Apr', total: 1600 },
            { name: 'May', total: 900 },
            { name: 'Jun', total: 1700 },
        ];

        return NextResponse.json({
            stats: {
                revenue: totalRevenue,
                orders: totalOrders,
                customers: totalUsers,
                growth: 12 // Mock growth %
            },
            chartData,
            recentUsers,
            popularPlans
        });

    } catch (error) {
        console.error('Analytics API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
