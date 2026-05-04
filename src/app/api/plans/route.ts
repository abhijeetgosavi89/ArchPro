import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const style = searchParams.get('style');
        const query = searchParams.get('q');

        const where: any = {};
        if (style) where.style = style;
        if (query) {
            where.OR = [
                { title: { contains: query } },
                { planNumber: { contains: query } },
                { description: { contains: query } },
            ];
        }

        const plans = await prisma.plan.findMany({
            where,
            include: {
                images: true,
                tags: true,
                attributes: { include: { attributeValue: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(plans);
    } catch (error) {
        console.error('Error fetching plans:', error);
        return NextResponse.json({ error: 'Error fetching plans' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        const plan = await prisma.plan.create({
            data: {
                planNumber: body.planNumber,
                title: body.title,
                description: body.description,
                price: parseFloat(body.price),
                sqFt: parseInt(body.sqFt),
                sqFtHeated: body.sqFtHeated ? parseInt(body.sqFtHeated) : null,
                sqFtMain: body.sqFtMain ? parseInt(body.sqFtMain) : null,
                sqFtUpper: body.sqFtUpper ? parseInt(body.sqFtUpper) : null,
                sqFtLower: body.sqFtLower ? parseInt(body.sqFtLower) : null,
                sqFtGarage: body.sqFtGarage ? parseInt(body.sqFtGarage) : null,
                sqFtPorch: body.sqFtPorch ? parseInt(body.sqFtPorch) : null,
                sqFtBonus: body.sqFtBonus ? parseInt(body.sqFtBonus) : null,
                beds: parseInt(body.beds),
                baths: parseFloat(body.baths),
                halfBaths: body.halfBaths ? parseInt(body.halfBaths) : 0,
                stories: parseInt(body.stories),
                garage: parseInt(body.garage),
                width: body.width ? parseFloat(body.width) : null,
                depth: body.depth ? parseFloat(body.depth) : null,
                height: body.height ? parseFloat(body.height) : null,
                style: body.style || null,
                isTrending: body.isTrending || false,
                isNewPlan: body.isNewPlan || false,
                foundationTypes: body.foundationTypes || null,
                roofPitch: body.roofPitch || null,
                roofType: body.roofType || null,
                exteriorWall: body.exteriorWall || null,
                framingType: body.framingType || null,
                priceReverse: body.priceReverse ? parseFloat(body.priceReverse) : null,
                priceCAD: body.priceCAD ? parseFloat(body.priceCAD) : null,
                pricePDF: body.pricePDF ? parseFloat(body.pricePDF) : null,
                images: {
                    create: (body.images || []).map((img: any, i: number) => ({
                        url: img.url, title: img.title || '', description: img.description || '',
                        isPrimary: img.isPrimary || false, type: img.type || 'IMAGE', order: i
                    }))
                },
                attributes: {
                    create: (body.attributes || []).map((attrId: string) => ({
                        attributeValue: { connect: { id: attrId } }
                    }))
                },
                specs: {
                    create: (body.specs || []).map((spec: any, i: number) => ({
                        category: spec.category || 'General',
                        label: spec.label, value: spec.value, order: i
                    }))
                },
                sections: {
                    create: (body.sections || []).map((sec: any, i: number) => ({
                        title: sec.title || null, content: sec.content,
                        imageUrl: sec.imageUrl || null, order: i
                    }))
                },
                tags: {
                    connectOrCreate: (body.tags || []).map((tagName: string) => ({
                        where: { name: tagName },
                        create: { name: tagName, slug: tagName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') }
                    }))
                }
            }
        });

        return NextResponse.json(plan);
    } catch (error) {
        console.error('Error creating plan:', error);
        return NextResponse.json({ error: 'Error creating plan' }, { status: 500 });
    }
}
