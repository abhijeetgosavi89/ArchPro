import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import CustomizeClient from '@/components/CustomizeClient';


export const dynamic = 'force-dynamic';

async function getPlan(id: string) {
    return prisma.plan.findUnique({
        where: { id },
        include: { images: true }
    });
}

export default async function CustomizePlanPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const plan = await getPlan(id);

    if (!plan) {
        return (
            <div className="container mx-auto py-20 text-center">
                <h1 className="text-4xl font-bold mb-4">Plan Not Found</h1>
                <Link href="/plans"><Button>Browse All Plans</Button></Link>
            </div>
        );
    }

    // Pass plan data to client component
    return (
        <CustomizeClient
            plan={{
                id: plan.id,
                title: plan.title,
                planNumber: plan.planNumber,
                beds: plan.beds,
                baths: plan.baths,
                sqFt: plan.sqFt,
                sh3dFileUrl: (plan as any).sh3dFileUrl || null,
                floorPlanUrl: (plan as any).floorPlanUrl || null
            }}
        />
    );
}
