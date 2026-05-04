import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// GET all tags
export async function GET() {
    try {
        const tags = await prisma.tag.findMany({
            orderBy: { name: 'asc' },
            include: { _count: { select: { plans: true } } }
        });
        return NextResponse.json(tags);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch tags' }, { status: 500 });
    }
}

// POST create a new tag
export async function POST(request: Request) {
    try {
        const { name } = await request.json();
        if (!name?.trim()) return NextResponse.json({ error: 'Name required' }, { status: 400 });

        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const tag = await prisma.tag.upsert({
            where: { name: name.trim() },
            update: {},
            create: { name: name.trim(), slug }
        });
        return NextResponse.json(tag);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create tag' }, { status: 500 });
    }
}
