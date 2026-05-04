import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    if (!id || typeof id !== 'string') {
        return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const plan = await prisma.plan.findUnique({
        where: { id },
        include: {
            images: { orderBy: { order: 'asc' } },
            specs: { orderBy: { order: 'asc' } },
            sections: { orderBy: { order: 'asc' } },
            tags: true,
            attributes: {
                include: {
                    attributeValue: { include: { category: true } }
                }
            }
        }
    });

    if (!plan) return NextResponse.json({ error: 'Plan not found' }, { status: 404 });

    // Increment views
    await prisma.plan.update({ where: { id }, data: { views: { increment: 1 } } }).catch(() => {});

    return NextResponse.json(plan);
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const body = await request.json();

    try {
        const oldPlan = await prisma.plan.findUnique({ where: { id } });
        if (!oldPlan) return NextResponse.json({ error: 'Plan not found' }, { status: 404 });

        const updateData: any = {};

        // Basic fields
        const stringFields = ['title', 'planNumber', 'description', 'style', 'roofPitch', 'roofType',
            'exteriorWall', 'framingType', 'foundationTypes', 'sh3dFileUrl', 'floorPlanUrl', 'aiEngine'];
        stringFields.forEach(f => { if (body[f] !== undefined) updateData[f] = body[f]; });

        // Numeric fields
        const intFields = ['sqFt', 'beds', 'stories', 'garage', 'halfBaths',
            'sqFtHeated', 'sqFtMain', 'sqFtUpper', 'sqFtLower', 'sqFtGarage', 'sqFtPorch', 'sqFtBonus'];
        intFields.forEach(f => { if (body[f] !== undefined && body[f] !== '') updateData[f] = parseInt(body[f]); });

        const floatFields = ['price', 'baths', 'width', 'depth', 'height'];
        floatFields.forEach(f => { if (body[f] !== undefined && body[f] !== '') updateData[f] = parseFloat(body[f]); });

        // Optional decimal fields (nullable)
        ['priceReverse', 'priceCAD', 'pricePDF'].forEach(f => {
            if (body[f] !== undefined) updateData[f] = body[f] !== '' ? parseFloat(body[f]) : null;
        });

        // Optional nullable int fields
        intFields.filter(f => f.startsWith('sqFt') && f !== 'sqFt').forEach(f => {
            if (body[f] !== undefined && body[f] === '') updateData[f] = null;
        });

        // Booleans
        if (body.isTrending !== undefined) updateData.isTrending = body.isTrending;
        if (body.isNewPlan !== undefined) updateData.isNewPlan = body.isNewPlan;

        // Images
        if (body.images && Array.isArray(body.images) && body.images.length > 0) {
            updateData.images = {
                deleteMany: {},
                create: body.images.map((img: any, i: number) => ({
                    url: img.url, title: img.title || '', description: img.description || '',
                    isPrimary: img.isPrimary || false, type: img.type || 'IMAGE', order: i
                }))
            };
        }

        // Attributes
        if (body.attributes !== undefined && Array.isArray(body.attributes)) {
            updateData.attributes = {
                deleteMany: {},
                create: body.attributes.map((attrId: string) => ({
                    attributeValue: { connect: { id: attrId } }
                }))
            };
        }

        // Specs (now with category)
        if (body.specs !== undefined && Array.isArray(body.specs)) {
            updateData.specs = {
                deleteMany: {},
                create: body.specs.map((spec: any, i: number) => ({
                    category: spec.category || 'General',
                    label: spec.label, value: spec.value, order: i
                }))
            };
        }

        // Sections (rich content blocks)
        if (body.sections !== undefined && Array.isArray(body.sections)) {
            updateData.sections = {
                deleteMany: {},
                create: body.sections.map((sec: any, i: number) => ({
                    title: sec.title || null, content: sec.content,
                    imageUrl: sec.imageUrl || null, order: i
                }))
            };
        }

        // Tags (connect by name, create if new)
        if (body.tags !== undefined && Array.isArray(body.tags)) {
            updateData.tags = {
                set: [], // disconnect all existing
                connectOrCreate: body.tags.map((tagName: string) => ({
                    where: { name: tagName },
                    create: { name: tagName, slug: tagName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') }
                }))
            };
        }

        // History
        if (Object.keys(updateData).length > 0) {
            updateData.history = {
                create: { action: 'UPDATE', userEmail: 'admin@archpro.com', field: 'plan_update', oldValue: '', newValue: 'Updated via admin' }
            };
        }

        const updatedPlan = await prisma.plan.update({ where: { id }, data: updateData });
        return NextResponse.json(updatedPlan);
    } catch (error) {
        console.error('Error updating plan:', error);
        return NextResponse.json({ error: 'Error updating plan' }, { status: 500 });
    }
}
