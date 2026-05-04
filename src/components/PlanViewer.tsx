'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { cn } from '@/lib/utils';
import { Image as PlanImage } from '@prisma/client';
import { Images, Box, Globe, FileText, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ThreeDViewer = dynamic(() => import('./ThreeDViewer'), {
    ssr: false,
    loading: () => <div className="flex items-center justify-center h-full text-white"><Loader2 className="w-8 h-8 animate-spin" /></div>
});
const PanoramaViewer = dynamic(() => import('./PanoramaViewer'), {
    ssr: false,
    loading: () => <div className="flex items-center justify-center h-full text-white"><Loader2 className="w-8 h-8 animate-spin" /></div>
});

interface PlanViewerProps {
    images: any[]; // Using any to avoid lint errors with dynamic types
    title: string;
}

export default function PlanViewer({ images, title }: PlanViewerProps) {
    const [activeTab, setActiveTab] = useState<'GALLERY' | 'BLUEPRINT' | '360' | '3D'>('GALLERY');
    const [activeImageIndex, setActiveImageIndex] = useState(0);

    // Filter images by type
    // @ts-ignore - Prisma type definition might not update immediately in IDE
    const galleryImages = images.filter(img => !img.type || img.type === 'IMAGE');
    // @ts-ignore
    const blueprints = images.filter(img => img.type === 'BLUEPRINT' || img.type === 'PDF');
    // @ts-ignore
    const panoramas = images.filter(img => img.type === '360_VIEW');
    // @ts-ignore
    const models = images.filter(img => img.type === '3D_MODEL' || img.type === 'GLB' || img.type === 'GLTF');

    const tabs = [
        { id: 'GALLERY', label: 'Gallery', icon: Images, count: galleryImages.length },
        { id: '3D', label: '3D Model', icon: Box, count: models.length },
        { id: '360', label: '360° Tour', icon: Globe, count: panoramas.length },
        { id: 'BLUEPRINT', label: 'Blueprints', icon: FileText, count: blueprints.length },
    ];

    const nextImage = () => setActiveImageIndex((prev) => (prev + 1) % galleryImages.length);
    const prevImage = () => setActiveImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);

    return (
        <div className="flex flex-col gap-6">
            {/* Tabs Navigation */}
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => {
                            if (tab.count > 0 || tab.id === 'GALLERY') {
                                setActiveTab(tab.id as any);
                                setActiveImageIndex(0); // Reset index when switching tabs
                            }
                        }}
                        disabled={tab.count === 0 && tab.id !== 'GALLERY'}
                        className={cn(
                            "flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold transition-all whitespace-nowrap border",
                            activeTab === tab.id
                                ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20"
                                : "bg-card text-muted-foreground border-border hover:bg-muted hover:text-foreground",
                            (tab.count === 0 && tab.id !== 'GALLERY') && "opacity-50 cursor-not-allowed grayscale"
                        )}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                        {tab.count > 0 && <span className="ml-1.5 bg-background/20 px-1.5 py-0.5 rounded-full text-[10px]">{tab.count}</span>}
                    </button>
                ))}
            </div>

            {/* Viewer Area */}
            <div className="bg-neutral-900 rounded-2xl overflow-hidden border border-border/50 shadow-2xl relative min-h-[500px] lg:min-h-[600px] flex flex-col">
                {activeTab === 'GALLERY' && (
                    galleryImages.length > 0 ? (
                        <div className="relative w-full h-full flex-1 group">
                            <img
                                src={galleryImages[activeImageIndex]?.url}
                                alt={galleryImages[activeImageIndex]?.title || title}
                                className="w-full h-full object-contain bg-black/50 backdrop-blur-3xl"
                            />

                            {/* Navigation Arrows */}
                            {galleryImages.length > 1 && (
                                <>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-black/50 rounded-full h-12 w-12 opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={(e) => { e.stopPropagation(); prevImage(); }}
                                    >
                                        <ChevronLeft className="w-8 h-8" />
                                    </Button>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-black/50 rounded-full h-12 w-12 opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={(e) => { e.stopPropagation(); nextImage(); }}
                                    >
                                        <ChevronRight className="w-8 h-8" />
                                    </Button>
                                </>
                            )}

                            {/* Caption */}
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-8 pt-20">
                                <p className="text-white font-medium text-lg">{galleryImages[activeImageIndex]?.title || title}</p>
                                <p className="text-white/60 text-sm">Image {activeImageIndex + 1} of {galleryImages.length}</p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center flex-1 text-neutral-400 gap-4">
                            <Images className="w-16 h-16 opacity-20" />
                            <p>No Images Available</p>
                        </div>
                    )
                )}

                {activeTab === 'BLUEPRINT' && (
                    blueprints.length > 0 ? (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-white p-8 flex-1 gap-4">
                            {blueprints[activeImageIndex]?.url.toLowerCase().endsWith('.pdf') || blueprints[activeImageIndex]?.type === 'PDF' ? (
                                <div className="w-full h-full flex flex-col items-center gap-4">
                                    <div className="flex-1 w-full bg-muted rounded-lg flex items-center justify-center border-2 border-dashed border-border group relative overflow-hidden">
                                        <FileText className="w-20 h-20 text-red-500 opacity-40 group-hover:scale-110 transition-transform duration-500" />
                                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity gap-4">
                                            <p className="text-white font-bold">PDF Blueprint Document</p>
                                            <a
                                                href={blueprints[activeImageIndex].url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="bg-primary text-primary-foreground px-6 py-2 rounded-full font-bold hover:scale-105 transition-transform"
                                            >
                                                Open PDF in New Tab
                                            </a>
                                        </div>
                                    </div>
                                    <p className="text-neutral-500 text-sm font-medium">{blueprints[activeImageIndex]?.title || 'Blueprint PDF'}</p>
                                </div>
                            ) : (
                                <div className="relative w-full h-full flex items-center justify-center">
                                    <img
                                        src={blueprints[activeImageIndex]?.url}
                                        alt="Blueprint"
                                        className="max-w-full max-h-full object-contain shadow-xl rounded-lg"
                                    />
                                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-4 py-1 rounded-full text-xs backdrop-blur-sm">
                                        {blueprints[activeImageIndex]?.title || 'Technical Drawing'}
                                    </div>
                                </div>
                            )}

                            {/* Blueprint Navigation if multiple */}
                            {blueprints.length > 1 && (
                                <div className="flex gap-2 mt-4">
                                    {blueprints.map((_, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setActiveImageIndex(idx)}
                                            className={cn(
                                                "w-3 h-3 rounded-full transition-all",
                                                activeImageIndex === idx ? "bg-primary w-8" : "bg-neutral-300 hover:bg-neutral-400"
                                            )}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : <div className="flex flex-col items-center justify-center flex-1 text-white gap-4">
                        <FileText className="w-16 h-16 opacity-20" />
                        <p>No Blueprints Available</p>
                    </div>
                )}

                {activeTab === '360' && (
                    panoramas.length > 0 ? (
                        <PanoramaViewer imageUrl={panoramas[0].url} title={panoramas[0].title || '360 View'} />
                    ) : <div className="flex items-center justify-center flex-1 text-white">No 360 Tours</div>
                )}

                {activeTab === '3D' && (
                    models.length > 0 ? (
                        <ThreeDViewer modelUrl={models[0].url} />
                    ) : <div className="flex items-center justify-center flex-1 text-white">No 3D Models</div>
                )}
            </div>

            {/* Thumbnails (Only for Gallery) */}
            {activeTab === 'GALLERY' && galleryImages.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar px-1">
                    {galleryImages.map((img, idx) => (
                        <button
                            key={img.id}
                            onClick={() => setActiveImageIndex(idx)}
                            className={cn(
                                "relative w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all duration-300",
                                activeImageIndex === idx
                                    ? "border-primary ring-4 ring-primary/20 scale-105 z-10"
                                    : "border-transparent opacity-60 hover:opacity-100 hover:scale-105"
                            )}
                        >
                            <img src={img.url} className="w-full h-full object-cover" alt="" />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
