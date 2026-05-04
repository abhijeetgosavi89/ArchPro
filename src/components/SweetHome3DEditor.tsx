'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Loader2, Maximize2, RotateCcw, Eye, Home as HomeIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ModelViewerFallback from '@/components/ModelViewerFallback';

interface SweetHome3DEditorProps {
    sh3dFileUrl?: string;
    floorPlanUrl?: string;
    planTitle?: string;
    onWallSelect?: (wall: any) => void;
}

// Scripts required by SweetHome3DJS Viewer in order
const SWEETHOME3D_SCRIPTS = [
    '/lib/sweethome3djs/lib/big.min.js',
    '/lib/sweethome3djs/lib/gl-matrix-min.js',
    '/lib/sweethome3djs/lib/jszip.min.js',
    '/lib/sweethome3djs/lib/core.min.js',
    '/lib/sweethome3djs/lib/geom.min.js',
    '/lib/sweethome3djs/lib/stroke.min.js',
    '/lib/sweethome3djs/lib/batik-svgpathparser.min.js',
    '/lib/sweethome3djs/lib/jsXmlSaxParser.min.js',
    '/lib/sweethome3djs/lib/triangulator.min.js',
    '/lib/sweethome3djs/lib/viewmodel.min.js',
    '/lib/sweethome3djs/lib/viewhome.min.js',
];

declare global {
    interface Window {
        viewHome: any;
        HomeRecorder: any;
        Node3D: any;
    }
}

export default function SweetHome3DEditor({
    sh3dFileUrl,
    floorPlanUrl,
    planTitle,
    onWallSelect
}: SweetHome3DEditorProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [loadingMessage, setLoadingMessage] = useState('Loading viewer...');
    const [error, setError] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'aerial' | 'visit'>('aerial');

    useEffect(() => {
        let mounted = true;

        const loadScriptsSequentially = async () => {
            try {
                // Check if already loaded
                if (window.viewHome) {
                    initializeViewer();
                    return;
                }

                // Load scripts one by one
                for (let i = 0; i < SWEETHOME3D_SCRIPTS.length; i++) {
                    const src = SWEETHOME3D_SCRIPTS[i];
                    await new Promise<void>((resolve, reject) => {
                        // Check if script already exists
                        if (document.querySelector(`script[src="${src}"]`)) {
                            resolve();
                            return;
                        }

                        const script = document.createElement('script');
                        script.src = src;
                        script.async = false;
                        script.onload = () => resolve();
                        script.onerror = () => reject(new Error(`Failed to load: ${src}`));
                        document.body.appendChild(script);
                    });

                    if (mounted) {
                        setLoadingProgress(Math.round(((i + 1) / SWEETHOME3D_SCRIPTS.length) * 50));
                    }
                }

                // Wait a bit for scripts to initialize
                await new Promise(resolve => setTimeout(resolve, 500));

                if (mounted && window.viewHome) {
                    initializeViewer();
                } else if (mounted) {
                    setError('SweetHome3DJS library not loaded properly');
                    setIsLoading(false);
                }
            } catch (err: any) {
                if (mounted) {
                    console.error('Error loading SweetHome3DJS:', err);
                    setError(err.message || 'Failed to load 3D viewer library');
                    setIsLoading(false);
                }
            }
        };

        const initializeViewer = () => {
            if (!canvasRef.current) return;

            // Determine which home file to load
            const homeUrl = sh3dFileUrl || '/lib/sweethome3djs/default.sh3d';

            const onError = (err: any) => {
                if (mounted) {
                    if (err === 'No WebGL') {
                        setError('Your browser does not support WebGL');
                    } else {
                        setError(err.message || 'Error loading home file');
                    }
                    setIsLoading(false);
                }
            };

            const onProgression = (part: string, info: string, percentage: number) => {
                if (!mounted) return;

                if (part === 'Reading home') {
                    setLoadingProgress(50 + Math.round(percentage * 25));
                    setLoadingMessage(`Loading home: ${Math.round(percentage * 100)}%`);
                } else if (part === 'Reading model') {
                    setLoadingProgress(75 + Math.round(percentage * 25));
                    setLoadingMessage(`Loading 3D models: ${Math.round(percentage * 100)}%`);
                    if (percentage === 1) {
                        setIsLoading(false);
                    }
                } else {
                    setLoadingMessage(`${part} ${info}`);
                }
            };

            try {
                window.viewHome(
                    canvasRef.current.id,
                    homeUrl,
                    onError,
                    onProgression,
                    {
                        roundsPerMinute: 0,
                        navigationPanel: 'default',
                        activateCameraSwitchKey: true
                    }
                );
            } catch (err: any) {
                onError(err);
            }
        };

        loadScriptsSequentially();

        return () => {
            mounted = false;
        };
    }, [sh3dFileUrl]);

    const handleFullscreen = () => {
        const container = canvasRef.current?.parentElement;
        if (container) {
            if (document.fullscreenElement) {
                document.exitFullscreen();
            } else {
                container.requestFullscreen();
            }
        }
    };

    // If there's an error loading SweetHome3DJS, show the fallback
    if (error) {
        return (
            <div className="relative">
                <ModelViewerFallback planTitle={planTitle} />
                <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-50">
                    <div className="bg-amber-500/90 backdrop-blur-sm text-black text-xs px-4 py-2 rounded-lg border border-amber-400">
                        ℹ️ Using demo 3D preview. {error}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="relative w-full h-[700px] bg-gradient-to-b from-slate-800 to-slate-900 rounded-xl overflow-hidden shadow-2xl border border-white/10">
            {/* Loading Overlay */}
            {isLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 z-50">
                    <Loader2 className="w-12 h-12 animate-spin mb-4 text-primary" />
                    <p className="text-white font-medium mb-2">{loadingMessage}</p>
                    <div className="w-64 h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-primary transition-all duration-300"
                            style={{ width: `${loadingProgress}%` }}
                        />
                    </div>
                    <p className="text-white/60 text-sm mt-4">{planTitle || 'Sweet Home 3D Viewer'}</p>
                </div>
            )}

            {/* 3D Canvas */}
            <canvas
                id="sweethome3d-canvas"
                ref={canvasRef}
                className="w-full h-full"
                style={{
                    backgroundColor: '#2d3748',
                    outline: 'none',
                    touchAction: 'none'
                }}
                tabIndex={1}
            />

            {/* Toolbar */}
            <div className="absolute top-4 right-4 flex items-center gap-2 z-40">
                <Button
                    size="icon"
                    variant="secondary"
                    className="bg-black/60 hover:bg-black/80 text-white border border-white/10"
                    onClick={handleFullscreen}
                    title="Fullscreen"
                >
                    <Maximize2 className="w-4 h-4" />
                </Button>
            </div>

            {/* Status Badge */}
            <div className="absolute top-4 left-4 z-40">
                <div className="bg-black/60 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-2 border border-white/10">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    Sweet Home 3D Viewer
                </div>
            </div>

            {/* Controls Help */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40">
                <div className="bg-black/70 backdrop-blur-sm text-white text-xs px-4 py-2 rounded-full border border-white/10">
                    Drag to rotate • Scroll to zoom • Space bar to switch views
                </div>
            </div>
        </div>
    );
}
