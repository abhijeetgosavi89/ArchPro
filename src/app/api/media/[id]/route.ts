import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';


export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> } // id is the media ID
) {
    try {
        const { id } = await params;

        // Optionally: Delete file from disk if it's local
        // const media = await prisma.image.findUnique({ where: { id } });
        // if (media) { ... delete file ... }

        await prisma.image.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting media:', error);
        return NextResponse.json({ error: 'Error deleting media' }, { status: 500 });
    }
}
