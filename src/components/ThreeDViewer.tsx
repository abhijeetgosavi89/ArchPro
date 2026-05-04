'use client';

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage, useGLTF, Center, Environment } from '@react-three/drei';
import { Loader2, Rotate3D } from 'lucide-react';

function Model({ url }: { url: string }) {
    const { scene } = useGLTF(url);
    return <primitive object={scene} />;
}

export default function ThreeDViewer({ modelUrl }: { modelUrl?: string }) {
    if (!modelUrl) {
        return (
            <div className="flex flex-col items-center justify-center h-[500px] bg-muted/20 text-muted-foreground border border-border/50 rounded-lg">
                <Rotate3D className="w-12 h-12 mb-4 opacity-50" />
                <p>No 3D Model Available</p>
                <p className="text-sm">Upload a .glb or .gltf file to view it in 3D</p>
            </div>
        );
    }

    return (
        <div className="w-full h-[600px] bg-gradient-to-b from-neutral-800 to-neutral-900 rounded-xl overflow-hidden relative shadow-2xl border border-white/10 group">
            <Suspense fallback={
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-neutral-900">
                    <Loader2 className="w-8 h-8 animate-spin mb-4 text-primary" />
                    <p className="text-sm font-medium tracking-wider">LOADING 3D MODEL...</p>
                </div>
            }>
                <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 0, 150], fov: 50 }}>
                    <OrbitControls
                        makeDefault
                        autoRotate
                        autoRotateSpeed={0.5}
                        minPolarAngle={0}
                        maxPolarAngle={Math.PI / 1.75}
                    />
                    <Stage environment="city" shadows>
                        <Model url={modelUrl} />
                    </Stage>
                    <Environment preset="city" />
                </Canvas>
            </Suspense>

            {/* Overlay UI */}
            <div className="absolute top-4 left-4 pointer-events-none">
                <div className="bg-black/60 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-2 border border-white/10">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    Interactive 3D Preview
                </div>
            </div>

            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="bg-black/70 backdrop-blur-sm text-white text-xs px-4 py-2 rounded-full border border-white/10">
                    Click & Drag to Rotate • Scroll to Zoom
                </div>
            </div>
        </div>
    );
}

// Preload the model to avoid waterfalls if possible, or just rely on suspense
// useGLTF.preload(modelUrl);
