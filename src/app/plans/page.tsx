import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import PlanCard from '@/components/PlanCard';
import PlanFilters from '@/components/PlanFilters';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Suspense } from 'react';

export const dynamic = 'force-dynamic';

interface SearchParams {
    style?: string; q?: string; minPrice?: string; maxPrice?: string;
    beds?: string; baths?: string; sqFtMin?: string; sqFtMax?: string;
    stories?: string; garage?: string; tags?: string; sort?: string;
    [key: string]: string | undefined; // for dynamic attr_ params
}

const SORT_MAP: Record<string, Prisma.PlanOrderByWithRelationInput> = {
    'newest': { createdAt: 'desc' },
    'oldest': { createdAt: 'asc' },
    'price_asc': { price: 'asc' },
    'price_desc': { price: 'desc' },
    'popular': { views: 'desc' },
    'sqft_desc': { sqFt: 'desc' },
    'sqft_asc': { sqFt: 'asc' },
};

async function getPlans(params: SearchParams) {
    const where: Prisma.PlanWhereInput = {};

    // Style filter (supports comma-separated multi-select)
    if (params.style) {
        const styles = params.style.split(',').filter(Boolean);
        if (styles.length === 1) where.style = styles[0];
        else if (styles.length > 1) where.style = { in: styles };
    }

    // Text search
    if (params.q) {
        where.OR = [
            { title: { contains: params.q } },
            { planNumber: { contains: params.q } },
            { description: { contains: params.q } },
        ];
    }

    // Price range
    if (params.minPrice || params.maxPrice) {
        where.price = {};
        if (params.minPrice) where.price.gte = Number(params.minPrice);
        if (params.maxPrice) where.price.lte = Number(params.maxPrice);
    }

    // Numeric filters
    if (params.beds) where.beds = { gte: Number(params.beds) };
    if (params.baths) where.baths = { gte: Number(params.baths) };
    if (params.stories) where.stories = params.stories === '3' ? { gte: 3 } : Number(params.stories);
    if (params.garage) where.garage = { gte: Number(params.garage) };

    // Sq ft range
    if (params.sqFtMin || params.sqFtMax) {
        where.sqFt = {};
        if (params.sqFtMin) where.sqFt.gte = Number(params.sqFtMin);
        if (params.sqFtMax) where.sqFt.lte = Number(params.sqFtMax);
    }

    // Tags filter
    if (params.tags) {
        const tagNames = params.tags.split(',').filter(Boolean);
        if (tagNames.length > 0) {
            where.tags = { some: { name: { in: tagNames } } };
        }
    }

    // Dynamic attribute filters (attr_foundation=Slab, attr_roof_type=Hip)
    const attrFilters = Object.entries(params).filter(([k]) => k.startsWith('attr_'));
    if (attrFilters.length > 0) {
        where.AND = attrFilters.map(([, values]) => ({
            attributes: {
                some: {
                    attributeValue: {
                        value: { in: (values || '').split(',').filter(Boolean) }
                    }
                }
            }
        }));
    }

    const orderBy = SORT_MAP[params.sort || 'newest'] || SORT_MAP.newest;

    return await prisma.plan.findMany({
        where,
        include: { images: true, tags: true },
        orderBy
    });
}

async function getFilterOptions() {
    // Get styles with counts
    const styleCounts = await prisma.plan.groupBy({
        by: ['style'],
        _count: { _all: true },
        where: { style: { not: null } },
        orderBy: { _count: { style: 'desc' } }
    });
    const styles = styleCounts
        .filter(s => s.style)
        .map(s => ({ value: s.style!, label: s.style!, count: s._count._all }));

    // Get tags with counts
    const allTags = await prisma.tag.findMany({
        include: { _count: { select: { plans: true } } },
        orderBy: { name: 'asc' }
    });
    const tags = allTags.map(t => ({ value: t.name, label: t.name, count: t._count.plans }));

    // Get attribute categories with their values
    const categories = await prisma.attributeCategory.findMany({
        include: { values: { orderBy: { value: 'asc' } } },
        orderBy: { name: 'asc' }
    });
    const attributeCategories = categories.map(c => ({
        name: c.name,
        values: c.values.map(v => ({ value: v.value, label: v.value }))
    }));

    // Get total count
    const totalCount = await prisma.plan.count();

    return { styles, tags, attributeCategories, totalCount };
}

export default async function PlansPage(props: { searchParams: Promise<SearchParams> }) {
    const searchParams = await props.searchParams;
    const [plans, filterOptions] = await Promise.all([getPlans(searchParams), getFilterOptions()]);

    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Header */}
            <div className="bg-slate-900 text-white py-12 px-4 shadow-lg border-b border-white/10">
                <div className="container mx-auto">
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
                        {searchParams.style ? `${searchParams.style} Plans` : 'Explore Our Plans'}
                    </h1>
                    <p className="text-xl text-slate-300 max-w-2xl font-light">
                        Find the perfect blueprint for your dream home. Filter by style, size, or features.
                    </p>
                </div>
            </div>

            <div className="container mx-auto py-10 px-4">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Filter Sidebar */}
                    <Suspense fallback={<div className="w-full lg:w-72 shrink-0 h-96 bg-muted/30 rounded-xl animate-pulse" />}>
                        <PlanFilters
                            styles={filterOptions.styles}
                            tags={filterOptions.tags}
                            attributeCategories={filterOptions.attributeCategories}
                            totalCount={filterOptions.totalCount}
                            filteredCount={plans.length}
                        />
                    </Suspense>

                    {/* Main Content */}
                    <div className="flex-1">
                        {/* Search Bar */}
                        <form action="/plans" className="mb-8 flex items-center gap-4 bg-card p-4 rounded-xl border border-border/50 shadow-sm">
                            <Search className="text-muted-foreground w-5 h-5 ml-2" />
                            <Input name="q" defaultValue={searchParams.q || ''} type="text"
                                placeholder="Search by plan number or keyword..."
                                className="bg-transparent border-none outline-none w-full text-foreground placeholder:text-muted-foreground shadow-none focus-visible:ring-0" />
                            {/* Preserve current filters in search */}
                            {searchParams.style && <input type="hidden" name="style" value={searchParams.style} />}
                            {searchParams.beds && <input type="hidden" name="beds" value={searchParams.beds} />}
                            {searchParams.baths && <input type="hidden" name="baths" value={searchParams.baths} />}
                            {searchParams.sort && <input type="hidden" name="sort" value={searchParams.sort} />}
                            <Button type="submit">Search</Button>
                        </form>

                        {plans.length === 0 ? (
                            <div className="text-center py-20 bg-muted/30 rounded-xl border border-dashed border-border">
                                <h3 className="text-2xl font-bold text-muted-foreground mb-2">No plans found</h3>
                                <p className="text-muted-foreground">Try adjusting your filters or search criteria.</p>
                                <Link href="/plans" className="mt-6 inline-block">
                                    <Button variant="outline">Clear Filters</Button>
                                </Link>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                                {plans.map(plan => (
                                    <PlanCard key={plan.id} plan={plan} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
