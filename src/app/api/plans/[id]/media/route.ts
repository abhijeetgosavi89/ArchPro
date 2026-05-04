import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';


// POST: Add new media to a plan
export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { url, type, filename, title } = await request.json();

        const media = await prisma.image.create({
            data: {
                planId: id,
                url,
                type, // 'IMAGE', 'PDF', 'GLB', 'GLTF', '360_VIEW'
                title: title || filename,
                isPrimary: false, // Default to false
            },
        });

        return NextResponse.json(media);
    } catch (error) {
        console.error('Error adding media:', error);
        return NextResponse.json({ error: 'Error adding media' }, { status: 500 });
    }
}

// DELETE: Remove media from a plan (This might need a separate route /api/media/[mediaId] strictly speaking,
// but for simplicity we can handle it here if we pass mediaId in body, or just make a new route.
// Let's make a new route for DELETE to be RESTful: /api/media/[id])
