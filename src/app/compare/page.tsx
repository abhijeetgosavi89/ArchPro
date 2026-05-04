'use client';

import { useCompare } from '@/context/CompareContext';
import { useState, useEffect } from 'react';
import { Plan, Image as PlanImage, Specification, PlanAttribute, AttributeValue } from '@prisma/client';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Check, X, Loader2 } from 'lucide-react';
import AddToCartButton from '@/components/AddToCartButton';

// Extended type for plan with relations
type DetailedPlan = Plan & {
    images: PlanImage[];
    specs: Specification[];
    attributes: (PlanAttribute & {
        attributeValue: AttributeValue & {
            category: { name: string } | null
        }
    })[];
};

export default function ComparePage() {
    const { selectedPlans, removeFromCompare } = useCompare();
    const [plans, setPlans] = useState<DetailedPlan[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPlans = async () => {
            if (selectedPlans.length === 0) {
                setPlans([]);
                setLoading(false);
                return;
            }

            try {
                // Fetch details for all selected plans
                // In a real app, create a bulk fetch endpoint: /api/plans?ids=1,2,3
                // For now, parallel fetch individually
                const planPromises = selectedPlans.map(id =>
                    fetch(`/api/plans/${id}`).then(res => res.json())
                );

                const results = await Promise.all(planPromises);
                // Filter out any failed fetches or nulls
                setPlans(results.filter(p => p && !p.error));
            } catch (error) {
                console.error("Error fetching comparison plans:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPlans();
    }, [selectedPlans]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (plans.length === 0) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
                <h1 className="text-3xl font-bold mb-4">No Plans Selected</h1>
                <p className="text-muted-foreground mb-8">Select plans to compare their features side-by-side.</p>
                <Link href="/plans">
                    <Button>Browse Plans</Button>
                </Link>
            </div>
        );
    }

    // Prepare feature list from all plans to ensure rows align
    const allSpecLabels = Array.from(new Set(
        plans.flatMap(p => p.specs.map(s => s.label))
    ));

    const attributeCategories = Array.from(new Set(
        plans.flatMap(p => p.attributes.map(a => a.attributeValue.category?.name || 'Features'))
    )).filter(Boolean); // Assuming category name is available, otherwise just list values

    return (
        <div className="container mx-auto px-4 py-8 pb-32">
            <div className="flex items-center gap-4 mb-8">
                <Link href="/plans" className="text-muted-foreground hover:text-foreground transition-colors">
                    <ArrowLeft className="w-6 h-6" />
                </Link>
                <h1 className="text-3xl font-bold">Compare Plans</h1>
            </div>

            <div className="overflow-x-auto pb-4">
                <div className="min-w-[800px]">
                    <div className="grid grid-cols-[200px_repeat(auto-fit,minmax(250px,1fr))] gap-0 border rounded-xl overflow-hidden shadow-sm">

                        {/* Header Row: Images & Titles */}
                        <div className="bg-muted/30 p-4 border-r border-b font-bold flex items-center">
                            Plan Details
                        </div>
                        {plans.map(plan => (
                            <div key={plan.id} className="p-4 border-r border-b min-w-[250px] relative group">
                                <button
                                    onClick={() => removeFromCompare(plan.id)}
                                    className="absolute top-2 right-2 p-1 bg-background/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive hover:text-destructive-foreground"
                                    title="Remove"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                                <div className="aspect-[4/3] relative rounded-lg overflow-hidden mb-4 bg-muted">
                                    <img
                                        src={plan.images.find(i => i.isPrimary)?.url || plan.images[0]?.url || '/placeholder.svg'}
                                        alt={plan.title}
                                        className="object-cover w-full h-full"
                                    />
                                </div>
                                <h3 className="font-bold text-lg mb-1 line-clamp-1">{plan.title}</h3>
                                <p className="text-sm text-muted-foreground mb-3">#{plan.planNumber}</p>
                                <p className="text-2xl font-extrabold text-primary mb-4">
                                    ${Number(plan.price).toLocaleString()}
                                </p>
                                <AddToCartButton plan={{ ...plan, price: Number(plan.price), baths: Number(plan.baths) }} />
                            </div>
                        ))}

                        {/* Basic Specs */}
                        <div className="bg-muted/10 p-4 border-r border-b font-medium text-muted-foreground">Square Footage</div>
                        {plans.map(plan => (
                            <div key={plan.id} className="p-4 border-r border-b font-semibold">{plan.sqFt} sq. ft.</div>
                        ))}

                        <div className="bg-muted/10 p-4 border-r border-b font-medium text-muted-foreground">Bedrooms</div>
                        {plans.map(plan => (
                            <div key={plan.id} className="p-4 border-r border-b font-semibold">{plan.beds}</div>
                        ))}

                        <div className="bg-muted/10 p-4 border-r border-b font-medium text-muted-foreground">Bathrooms</div>
                        {plans.map(plan => (
                            <div key={plan.id} className="p-4 border-r border-b font-semibold">{plan.baths}</div>
                        ))}

                        <div className="bg-muted/10 p-4 border-r border-b font-medium text-muted-foreground">Stories</div>
                        {plans.map(plan => (
                            <div key={plan.id} className="p-4 border-r border-b font-semibold">{plan.stories}</div>
                        ))}

                        <div className="bg-muted/10 p-4 border-r border-b font-medium text-muted-foreground">Garage Bays</div>
                        {plans.map(plan => (
                            <div key={plan.id} className="p-4 border-r border-b font-semibold">{plan.garage}</div>
                        ))}

                        <div className="bg-muted/10 p-4 border-r border-b font-medium text-muted-foreground">Dimensions</div>
                        {plans.map(plan => (
                            <div key={plan.id} className="p-4 border-r border-b text-sm">
                                {plan.width}' W x {plan.depth}' D <br />
                                {plan.height ? `x ${plan.height}' H` : ''}
                            </div>
                        ))}

                        {/* Dynamic Specs */}
                        {allSpecLabels.map(label => (
                            <>
                                <div className="bg-muted/10 p-4 border-r border-b font-medium text-muted-foreground">{label}</div>
                                {plans.map(plan => {
                                    const spec = plan.specs.find(s => s.label === label);
                                    return (
                                        <div key={plan.id} className="p-4 border-r border-b text-sm">
                                            {spec ? spec.value : '-'}
                                        </div>
                                    );
                                })}
                            </>
                        ))}

                        {/* Attributes/Features */}
                        <div className="bg-muted/30 p-4 border-r border-b font-bold col-span-full">Key Features</div>

                        {/* Simple list of features for now, could be grouped by category */}
                        <div className="bg-muted/10 p-4 border-r border-b font-medium text-muted-foreground">Included Features</div>
                        {plans.map(plan => (
                            <div key={plan.id} className="p-4 border-r border-b text-sm space-y-1">
                                {plan.attributes.map(attr => (
                                    <div key={attr.attributeValueId} className="flex items-center gap-1.5">
                                        <Check className="w-3 h-3 text-primary" />
                                        <span>{attr.attributeValue.value}</span>
                                    </div>
                                ))}
                                {plan.attributes.length === 0 && <span className="text-muted-foreground">-</span>}
                            </div>
                        ))}

                    </div>
                </div>
            </div>
        </div>
    );
}
