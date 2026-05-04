import { prisma } from '@/lib/prisma';

import { NextResponse } from 'next/server';


export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { value, categoryId } = body;

        if (!value || !categoryId) return NextResponse.json({ error: 'Value and Category ID are required' }, { status: 400 });

        const attributeValue = await prisma.attributeValue.create({
            data: { value, categoryId }
        });

        return NextResponse.json(attributeValue);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to add value' }, { status: 500 });
    }
}
