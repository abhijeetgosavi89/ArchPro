import { prisma } from '@/lib/prisma';

import { NextResponse } from 'next/server';


export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    try {
        await prisma.attributeValue.delete({
            where: { id }
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete value' }, { status: 500 });
    }
}
