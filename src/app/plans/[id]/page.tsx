import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Metadata } from 'next';
import PlanDetailClient from '@/components/PlanDetailClient';

export const dynamic = 'force-dynamic';

async function getPlan(id: string) {
    const plan = await prisma.plan.findUnique({
        where: { id },
        include: {
            images: { orderBy: { order: 'asc' } },
            specs: { orderBy: { order: 'asc' } },
            sections: { orderBy: { order: 'asc' } },
            tags: true,
            attributes: { include: { attributeValue: { include: { category: true } } } }
        }
    });
    if (plan) {
        // Increment views
        await prisma.plan.update({ where: { id }, data: { views: { increment: 1 } } }).catch(() => {});
    }
    return plan;
}

async function getRelatedPlans(planId: string, style: string | null) {
    if (!style) return [];
    return await prisma.plan.findMany({
        where: { id: { not: planId }, style },
        take: 3,
        include: { images: true }
    });
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params;
    const plan = await getPlan(id);
    if (!plan) return { title: 'Plan Not Found | ArchPro' };

    const mainImage = plan.images.find(img => img.isPrimary)?.url || plan.images[0]?.url || '';
    return {
        title: `${plan.title} - Plan #${plan.planNumber} | ArchPro`,
        description: `${plan.beds} Bed, ${plan.baths} Bath, ${plan.sqFt.toLocaleString()} Sq Ft ${plan.style || ''} house plan. Starting at $${Number(plan.price).toLocaleString()}.`,
        openGraph: { title: `${plan.title} | ArchPro`, description: plan.description.substring(0, 200), images: mainImage ? [{ url: mainImage }] : [], type: 'article' },
    };
}

export default async function PlanDetail({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const plan = await getPlan(id);

    if (!plan) return (
        <div className="container mx-auto py-20 text-center">
            <h1 className="text-4xl font-bold mb-4">Plan Not Found</h1>
            <Link href="/plans"><button className="px-6 py-3 bg-primary text-white rounded-lg">Browse All Plans</button></Link>
        </div>
    );

    const relatedPlans = await getRelatedPlans(plan.id, plan.style ?? null);

    const planData = {
        id: plan.id,
        title: plan.title,
        planNumber: plan.planNumber,
        description: plan.description,
        price: Number(plan.price),
        sqFt: plan.sqFt,
        sqFtHeated: plan.sqFtHeated,
        sqFtMain: plan.sqFtMain,
        sqFtUpper: plan.sqFtUpper,
        sqFtLower: plan.sqFtLower,
        sqFtGarage: plan.sqFtGarage,
        sqFtPorch: plan.sqFtPorch,
        sqFtBonus: plan.sqFtBonus,
        beds: plan.beds,
        baths: Number(plan.baths),
        halfBaths: plan.halfBaths,
        stories: plan.stories,
        garage: plan.garage,
        style: plan.style ?? '',
        width: plan.width,
        depth: plan.depth,
        height: plan.height,
        views: plan.views,
        foundationTypes: plan.foundationTypes,
        roofPitch: plan.roofPitch,
        roofType: plan.roofType,
        exteriorWall: plan.exteriorWall,
        framingType: plan.framingType,
        priceReverse: plan.priceReverse ? Number(plan.priceReverse) : null,
        priceCAD: plan.priceCAD ? Number(plan.priceCAD) : null,
        pricePDF: plan.pricePDF ? Number(plan.pricePDF) : null,
        images: plan.images.map(img => ({
            id: img.id, url: img.url, isPrimary: img.isPrimary,
            type: img.type || 'IMAGE', altText: img.altText || null,
            title: img.title || null, description: img.description || null
        })),
        attributes: plan.attributes.map(attr => ({
            id: attr.attributeValue.id,
            value: attr.attributeValue.value,
            category: attr.attributeValue.category.name
        })),
        specs: plan.specs.map(spec => ({
            id: spec.id, category: spec.category, label: spec.label, value: spec.value
        })),
        sections: plan.sections.map(sec => ({
            id: sec.id, title: sec.title, content: sec.content, imageUrl: sec.imageUrl
        })),
        tags: plan.tags.map(t => t.name)
    };

    const relatedPlansData = relatedPlans.map((p: any) => ({
        id: p.id, title: p.title, price: Number(p.price), sqFt: p.sqFt,
        beds: p.beds, baths: Number(p.baths),
        images: (p.images as any[]).map((img: any) => ({ url: img.url, isPrimary: img.isPrimary }))
    }));

    return <PlanDetailClient plan={planData} relatedPlans={relatedPlansData} />;
}
