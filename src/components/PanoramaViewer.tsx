'use client';

import React, { useState } from 'react';
// @ts-ignore
import { Pannellum } from "pannellum-react";
import { Maximize2, Compass, Map, Info } from 'lucide-react';
import { Button } from './ui/button';

export default function PanoramaViewer({ imageUrl, title }: { imageUrl?: string; title?: string }) {
    const [isHotspotVisible, setIsHotspotVisible] = useState(true);

    if (!imageUrl) {
        return (
            <div className="flex flex-col items-center justify-center h-[500px] bg-muted/20 text-muted-foreground border border-border/50 rounded-lg">
                <Compass className="w-12 h-12 mb-4 opacity-50" />
                <p>No 360° View Available</p>
            </div>
        );
    }

    return (
        <div className="w-full h-[600px] rounded-xl overflow-hidden relative shadow-2xl border border-border/50 group bg-black">
            <Pannellum
                width="100%"
                height="100%"
                image={imageUrl}
                pitch={10}
                yaw={180}
                hfov={110}
                autoLoad
                showZoomCtrl={false}
                showFullscreenCtrl={false}
                onLoad={() => console.log("Panorama loaded")}
            >
                {/* Example Hotspots - in real app, these would be dynamic */}
                {isHotspotVisible && (
                    <Pannellum.Hotspot
                        type="info"
                        pitch={11}
                        yaw={-167}
                        text="Master Bedroom Access"
                        URL="#"
                    />
                )}
            </Pannellum>

            {/* Premium Overlays */}
            <div className="absolute top-0 left-0 w-full bg-gradient-to-b from-black/60 to-transparent p-4 flex justify-between items-start pointer-events-none">
                <div className="text-white">
                    <h3 className="font-bold text-lg drop-shadow-md">{title || "Virtual Tour"}</h3>
                    <div className="text-xs text-white/80 uppercase tracking-widest flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" /> Live View
                    </div>
                </div>
            </div>

            {/* Controls Bar */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Button size="icon" variant="ghost" className="text-white hover:bg-white/20 rounded-full w-10 h-10" onClick={() => setIsHotspotVisible(!isHotspotVisible)}>
                    <Info className="w-5 h-5" />
                </Button>
                <div className="w-px h-4 bg-white/20" />
                <Button size="icon" variant="ghost" className="text-white hover:bg-white/20 rounded-full w-10 h-10">
                    <Map className="w-5 h-5" />
                </Button>
                <div className="w-px h-4 bg-white/20" />
                <Button size="icon" variant="ghost" className="text-white hover:bg-white/20 rounded-full w-10 h-10">
                    <Compass className="w-5 h-5" />
                </Button>
            </div>

            <div className="absolute bottom-6 right-6">
                <div className="bg-black/60 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-2 border border-white/10">
                    Drag to Look Around
                </div>
            </div>
        </div>
    );
}
