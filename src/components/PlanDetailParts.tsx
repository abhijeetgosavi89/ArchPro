'use client';

import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Bed, Bath, Ruler, Car, Layers, Eye, Check, Shield, Download, Clock, Truck } from 'lucide-react';

// Quick Stats Strip
export function StatsStrip({ plan }: { plan: any }) {
    const stats = [
        { icon: Ruler, value: plan.sqFt.toLocaleString(), label: 'Sq Ft' },
        { icon: Bed, value: plan.beds, label: 'Beds' },
        { icon: Bath, value: `${plan.baths}${plan.halfBaths ? ` + ${plan.halfBaths} Half` : ''}`, label: 'Baths' },
        { icon: Layers, value: plan.stories, label: 'Stories' },
        { icon: Car, value: plan.garage, label: 'Garage' },
    ];
    if (plan.width && plan.depth) stats.push({ icon: Ruler, value: `${plan.width}'×${plan.depth}'`, label: 'Dimensions' });

    return (
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mt-6">
            {stats.map(s => (
                <div key={s.label} className="flex flex-col items-center p-3 bg-card rounded-xl border border-border text-center">
                    <s.icon className="w-5 h-5 text-primary mb-1.5" />
                    <span className="text-lg font-bold leading-tight">{s.value}</span>
                    <span className="text-[11px] text-muted-foreground uppercase tracking-wide">{s.label}</span>
                </div>
            ))}
        </div>
    );
}

// Area Breakdown
export function AreaBreakdown({ plan }: { plan: any }) {
    const areas = [
        { label: 'Total Sq Ft', value: plan.sqFt },
        plan.sqFtHeated && { label: 'Heated Sq Ft', value: plan.sqFtHeated },
        plan.sqFtMain && { label: 'Main Floor', value: plan.sqFtMain },
        plan.sqFtUpper && { label: 'Upper Floor', value: plan.sqFtUpper },
        plan.sqFtLower && { label: 'Lower/Basement', value: plan.sqFtLower },
        plan.sqFtGarage && { label: 'Garage', value: plan.sqFtGarage },
        plan.sqFtPorch && { label: 'Covered Porch', value: plan.sqFtPorch },
        plan.sqFtBonus && { label: 'Bonus Room', value: plan.sqFtBonus },
    ].filter(Boolean) as { label: string; value: number }[];

    if (areas.length <= 1) return null;
    return (
        <div className="bg-card rounded-xl border border-border p-5">
            <h3 className="text-lg font-bold mb-3">Area Breakdown</h3>
            <div className="space-y-2">
                {areas.map(a => (
                    <div key={a.label} className="flex justify-between text-sm py-1.5 border-b border-border/50 last:border-0">
                        <span className="text-muted-foreground">{a.label}</span>
                        <span className="font-semibold">{a.value.toLocaleString()} sq ft</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// Categorized Specs Table
export function SpecsTable({ plan }: { plan: any }) {
    // Build specs from both plan fields and custom specs
    const builtInSpecs: { category: string; label: string; value: string }[] = [];
    if (plan.width) builtInSpecs.push({ category: 'Dimensions', label: 'Width', value: `${plan.width}'` });
    if (plan.depth) builtInSpecs.push({ category: 'Dimensions', label: 'Depth', value: `${plan.depth}'` });
    if (plan.height) builtInSpecs.push({ category: 'Dimensions', label: 'Height', value: `${plan.height}'` });
    builtInSpecs.push({ category: 'General', label: 'Stories', value: String(plan.stories) });
    builtInSpecs.push({ category: 'General', label: 'Style', value: plan.style || 'N/A' });
    if (plan.roofPitch) builtInSpecs.push({ category: 'Roof', label: 'Roof Pitch', value: plan.roofPitch });
    if (plan.roofType) builtInSpecs.push({ category: 'Roof', label: 'Roof Type', value: plan.roofType });
    if (plan.exteriorWall) builtInSpecs.push({ category: 'Construction', label: 'Exterior Wall', value: plan.exteriorWall });
    if (plan.framingType) builtInSpecs.push({ category: 'Construction', label: 'Framing', value: plan.framingType });
    if (plan.foundationTypes) builtInSpecs.push({ category: 'Foundation', label: 'Foundation Options', value: plan.foundationTypes.split(',').join(', ') });

    const allSpecs = [...builtInSpecs, ...(plan.specs || [])];
    const grouped = allSpecs.reduce((acc: Record<string, typeof allSpecs>, spec) => {
        const cat = spec.category || 'General';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(spec);
        return acc;
    }, {});

    return (
        <div className="space-y-6">
            {Object.entries(grouped).map(([category, specs]) => (
                <div key={category}>
                    <h4 className="text-sm font-semibold uppercase tracking-wider text-primary mb-2">{category}</h4>
                    <div className="bg-card rounded-xl border border-border overflow-hidden">
                        <table className="w-full">
                            <tbody>
                                {specs.map((spec, i) => (
                                    <tr key={`${spec.label}-${i}`} className={i % 2 === 0 ? 'bg-muted/30' : ''}>
                                        <td className="px-4 py-2.5 text-sm text-muted-foreground w-2/5">{spec.label}</td>
                                        <td className="px-4 py-2.5 font-semibold text-sm">{spec.value}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ))}
        </div>
    );
}

// Trust Badges
export function TrustBadges() {
    const badges = [
        { icon: Shield, text: 'Best Price Guarantee' },
        { icon: Download, text: 'Instant Download' },
        { icon: Clock, text: '24/7 Support' },
        { icon: Truck, text: 'Free Revisions' },
    ];
    return (
        <div className="grid grid-cols-2 gap-2">
            {badges.map(b => (
                <div key={b.text} className="flex items-center gap-2 text-xs font-medium text-primary/80 bg-primary/5 p-2 rounded-lg">
                    <b.icon className="w-4 h-4" /> {b.text}
                </div>
            ))}
        </div>
    );
}

// What's Included
export function WhatsIncluded() {
    const items = [
        'Complete construction drawings', 'Foundation plans', 'Floor plans for all levels',
        'Roof plan', 'Exterior elevations (all 4 sides)', 'Cross-section details',
        'Electrical layouts', 'General specifications', 'Door & window schedules'
    ];
    return (
        <div className="bg-card rounded-2xl border border-border p-6">
            <h3 className="text-lg font-bold mb-4">What's Included</h3>
            <ul className="space-y-2.5">
                {items.map(item => (
                    <li key={item} className="flex items-start gap-2.5 text-sm">
                        <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" /> {item}
                    </li>
                ))}
            </ul>
        </div>
    );
}

// Tags Display
export function TagsDisplay({ tags }: { tags: string[] }) {
    if (!tags?.length) return null;
    return (
        <div className="flex flex-wrap gap-2">
            {tags.map(tag => (
                <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
            ))}
        </div>
    );
}
