import { prisma } from '@/lib/prisma';

import { NextResponse } from 'next/server';


export async function GET() {
    try {
        const categories = await prisma.attributeCategory.findMany({
            include: { values: true },
            orderBy: { name: 'asc' }
        });
        return NextResponse.json(categories);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch attributes' }, { status: 500 });
    }
}
