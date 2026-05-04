import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';


export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const beds = searchParams.get('beds');
    const baths = searchParams.get('baths');
    const style = searchParams.get('style');
    const sqFtMin = searchParams.get('sqFtMin');
    const sqFtMax = searchParams.get('sqFtMax');
    const sort = searchParams.get('sort') || 'newest';

    const where: any = {};

    // Basic Text Search
    if (query) {
        where.OR = [
            { title: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
            { style: { contains: query, mode: 'insensitive' } },
            { planNumber: { contains: query, mode: 'insensitive' } },
        ];
    }

    // Filter Logic
    if (minPrice || maxPrice) {
        where.price = {};
        if (minPrice) where.price.gte = Number(minPrice);
        if (maxPrice) where.price.lte = Number(maxPrice);
    }

    if (beds) where.beds = { gte: Number(beds) };
    if (baths) where.baths = { gte: Number(baths) };

    if (style) {
        where.style = { contains: style, mode: 'insensitive' };
    }

    if (sqFtMin || sqFtMax) {
        where.sqFt = {};
        if (sqFtMin) where.sqFt.gte = Number(sqFtMin);
        if (sqFtMax) where.sqFt.lte = Number(sqFtMax);
    }

    // Sorting Logic
    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'price_asc') orderBy = { price: 'asc' };
    if (sort === 'price_desc') orderBy = { price: 'desc' };
    if (sort === 'sqft_asc') orderBy = { sqFt: 'asc' };
    if (sort === 'sqft_desc') orderBy = { sqFt: 'desc' };
    if (sort === 'popular') orderBy = { views: 'desc' };

    try {
        const plans = await prisma.plan.findMany({
            where,
            orderBy,
            include: { images: true },
        });

        return NextResponse.json(plans);
    } catch (error) {
        console.error('Search error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
