import { prisma } from '@/lib/prisma';
import HomepageClient from '@/components/HomepageClient';

// Prevent static generation - this page requires database access
export const dynamic = 'force-dynamic';

const STYLE_CATEGORIES = [
    { title: 'Modern Minimalist', subtitle: 'Clean & Contemporary', style: 'Modern', image: 'https://images.unsplash.com/photo-1600607686527-6fb886090705?auto=format&fit=crop&q=80&w=800' },
    { title: 'Luxury Estates',    subtitle: 'Grand & Elegant',      style: 'Luxury', image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&q=80&w=800' },
    { title: 'Farmhouse',         subtitle: 'Rustic Charm',         style: 'Farmhouse', image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800' },
    { title: 'Coastal Living',    subtitle: 'Beach & Breeze',       style: 'Coastal', image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=800' },
];

async function getTrendingPlans() {
    const plans = await prisma.plan.findMany({
        where: { isTrending: true },
        take: 6,
        include: { images: true },
        orderBy: { createdAt: 'desc' }
    });

    if (plans.length === 0) {
        return await prisma.plan.findMany({
            take: 6,
            include: { images: true },
            orderBy: { createdAt: 'desc' }
        });
    }
    return plans;
}

async function getSiteStats() {
    const [totalPlans, totalOrders, reviewStats] = await Promise.all([
        prisma.plan.count(),
        prisma.order.count({ where: { status: 'COMPLETED' } }),
        prisma.review.aggregate({ _avg: { rating: true }, _count: { id: true } }).catch(() => ({ _avg: { rating: null }, _count: { id: 0 } })),
    ]);

    const avgRating = reviewStats._avg.rating ? reviewStats._avg.rating.toFixed(1) : '5.0';

    return {
        totalPlans,
        totalOrders,
        avgRating,
        totalReviews: reviewStats._count.id,
    };
}

async function getCategoryCounts() {
    const counts = await Promise.all(
        STYLE_CATEGORIES.map(async (cat) => {
            const count = await prisma.plan.count({
                where: { style: cat.style }
            });
            return { style: cat.style, count };
        })
    );
    return Object.fromEntries(counts.map(c => [c.style, c.count]));
}

export default async function HomePage() {
    const [trendingPlans, stats, categoryCounts] = await Promise.all([
        getTrendingPlans(),
        getSiteStats(),
        getCategoryCounts(),
    ]);

    const plansData = trendingPlans.map(plan => ({
        id: plan.id,
        title: plan.title,
        price: Number(plan.price),
        sqFt: plan.sqFt,
        beds: plan.beds,
        baths: plan.baths,
        isTrending: plan.isTrending,
        images: plan.images.map(img => ({
            url: img.url,
            isPrimary: img.isPrimary
        }))
    }));

    // Build style categories with real counts
    const styleCategories = STYLE_CATEGORIES.map(cat => ({
        ...cat,
        count: categoryCounts[cat.style] ?? 0,
    }));

    return (
        <HomepageClient
            trendingPlans={plansData}
            styleCategories={styleCategories}
            stats={stats}
        />
    );
}
