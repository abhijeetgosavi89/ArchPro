import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';

export async function POST(request: Request) {
    try {
        const data = await request.formData();
        const file: File | null = data.get('file') as unknown as File;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Ensure uploads directory exists
        const uploadDir = join(process.cwd(), 'public/uploads');
        if (!existsSync(uploadDir)) {
            mkdirSync(uploadDir, { recursive: true });
        }

        // Generate unique filename to prevent overwrites
        const timestamp = Date.now();
        const uniqueFilename = `${timestamp}-${file.name.replace(/\s+/g, '-')}`;
        const filePath = join(uploadDir, uniqueFilename);

        // Write file to disk
        await writeFile(filePath, buffer);
        console.log(`Saved file to ${filePath}`);

        // Return public URL
        const publicUrl = `/uploads/${uniqueFilename}`;

        return NextResponse.json({
            url: publicUrl,
            filename: uniqueFilename,
            originalName: file.name,
            size: file.size,
            type: file.type
        });
    } catch (error) {
        console.error('Error uploading file:', error);
        return NextResponse.json({ error: 'Error uploading file' }, { status: 500 });
    }
}
