'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Home as HomeIcon, Sparkles, Paintbrush } from 'lucide-react';
import dynamic from 'next/dynamic';

// Dynamic import to avoid SSR issues with SweetHome3DJS
const SweetHome3DEditor = dynamic(() => import('@/components/SweetHome3DEditor'), {
    ssr: false,
    loading: () => (
        <div className="h-[700px] bg-muted/20 rounded-xl flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">Loading 3D Editor...</div>
        </div>
    )
});

interface CustomizeClientProps {
    plan: {
        id: string;
        title: string;
        planNumber: string;
        beds: number;
        baths: number | string;
        sqFt: number;
        sh3dFileUrl?: string | null;
        floorPlanUrl?: string | null;
    };
}

export default function CustomizeClient({ plan }: CustomizeClientProps) {
    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="bg-muted/30 border-b border-border/50 py-4">
                <div className="container mx-auto px-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={`/plans/${plan.id}`}>
                            <Button variant="ghost" size="sm" className="gap-2">
                                <ChevronLeft className="w-4 h-4" />
                                Back to Plan
                            </Button>
                        </Link>
                        <div className="h-6 w-px bg-border" />
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Link href="/" className="hover:text-primary transition-colors flex items-center gap-1">
                                <HomeIcon className="w-4 h-4" /> Home
                            </Link>
                            <span>/</span>
                            <Link href="/plans" className="hover:text-primary transition-colors">Plans</Link>
                            <span>/</span>
                            <span className="text-foreground font-medium">Customize</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <div className="flex items-start justify-between">
                        <div>
                            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                                <Paintbrush className="w-8 h-8 text-primary" />
                                Customize: {plan.title}
                            </h1>
                            <p className="text-muted-foreground">
                                Plan #{plan.planNumber} • {plan.beds} Bed • {plan.baths} Bath • {plan.sqFt} Sq Ft
                            </p>
                        </div>
                    </div>
                </div>

                {/* Editor Section */}
                <div className="grid grid-cols-1 gap-8">
                    <div className="relative">
                        <SweetHome3DEditor
                            sh3dFileUrl={plan.sh3dFileUrl || undefined}
                            floorPlanUrl={plan.floorPlanUrl || undefined}
                            planTitle={plan.title}
                        />
                    </div>

                    {/* Instructions Panel */}
                    <div className="bg-card border border-border/50 rounded-xl p-6">
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-primary" />
                            How to Customize Your Plan
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="flex gap-4">
                                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">1</div>
                                <div>
                                    <h3 className="font-semibold mb-1">Navigate the 3D View</h3>
                                    <p className="text-sm text-muted-foreground">Click and drag to rotate. Scroll to zoom in and out. Right-click to pan.</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">2</div>
                                <div>
                                    <h3 className="font-semibold mb-1">Select & Customize</h3>
                                    <p className="text-sm text-muted-foreground">Click on walls to select them. Use the panel to change colors and textures.</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">3</div>
                                <div>
                                    <h3 className="font-semibold mb-1">Generate AI Render</h3>
                                    <p className="text-sm text-muted-foreground">Click the AI button to create a photorealistic render of your customized design.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
