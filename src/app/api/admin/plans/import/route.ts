import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';


export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { plans } = body;

        if (!Array.isArray(plans) || plans.length === 0) {
            return NextResponse.json({ error: 'Invalid data format. Expected an array of plans.' }, { status: 400 });
        }

        const createdPlans = [];
        const errors = [];

        for (const planData of plans) {
            try {
                // Basic validation
                if (!planData.title || !planData.planNumber || !planData.price) {
                    errors.push({ plan: planData.title || 'Unknown', error: 'Missing required fields' });
                    continue;
                }

                const newPlan = await prisma.plan.create({
                    data: {
                        title: planData.title,
                        planNumber: planData.planNumber,
                        description: planData.description || '',
                        price: Number(planData.price),
                        sqFt: Number(planData.sqFt) || 0,
                        beds: Number(planData.beds) || 0,
                        baths: Number(planData.baths) || 0,
                        stories: Number(planData.stories) || 1,
                        garage: Number(planData.garage) || 0,
                        width: planData.width ? Number(planData.width) : null,
                        depth: planData.depth ? Number(planData.depth) : null,
                        style: planData.style || null,
                        isTrending: planData.isTrending || false,
                        // Handle images if provided as URLs
                        images: planData.imageUrl ? {
                            create: {
                                url: planData.imageUrl,
                                isPrimary: true
                                // type: 'IMAGE' - handled by default
                            }
                        } : undefined
                    }
                });
                createdPlans.push(newPlan);
            } catch (err: any) {
                console.error(`Error importing plan ${planData.planNumber}:`, err);
                // Handle unique constraint violation for planNumber
                if (err.code === 'P2002') {
                    errors.push({ plan: planData.planNumber, error: 'Plan number already exists' });
                } else {
                    errors.push({ plan: planData.planNumber, error: err.message });
                }
            }
        }

        return NextResponse.json({
            success: true,
            count: createdPlans.length,
            errors
        });

    } catch (error) {
        console.error('Import API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
