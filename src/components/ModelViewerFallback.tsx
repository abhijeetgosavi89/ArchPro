'use client';

import React, { useRef, useState, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Text, Box, Plane } from '@react-three/drei';
import { Button } from '@/components/ui/button';
import { Maximize2, RotateCcw, Palette, Sparkles, Loader2 } from 'lucide-react';
import * as THREE from 'three';

interface Room3DProps {
    wallColor: string;
    floorColor: string;
}

function Room3D({ wallColor, floorColor }: Room3DProps) {
    const groupRef = useRef<THREE.Group>(null);

    useFrame((state) => {
        if (groupRef.current) {
            groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.05;
        }
    });

    return (
        <group ref={groupRef}>
            {/* Floor */}
            <Plane args={[10, 10]} rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
                <meshStandardMaterial color={floorColor} />
            </Plane>

            {/* Back Wall */}
            <Box args={[10, 4, 0.2]} position={[0, 0, -5]}>
                <meshStandardMaterial color={wallColor} />
            </Box>

            {/* Left Wall */}
            <Box args={[0.2, 4, 10]} position={[-5, 0, 0]}>
                <meshStandardMaterial color={wallColor} />
            </Box>

            {/* Right Wall */}
            <Box args={[0.2, 4, 10]} position={[5, 0, 0]}>
                <meshStandardMaterial color={wallColor} />
            </Box>

            {/* Window on Back Wall */}
            <Box args={[3, 2, 0.1]} position={[0, 0.5, -4.85]}>
                <meshStandardMaterial color="#87CEEB" transparent opacity={0.5} />
            </Box>

            {/* Floor Lamp */}
            <group position={[-3, -1.5, -3]}>
                <Box args={[0.3, 3, 0.3]}>
                    <meshStandardMaterial color="#333" />
                </Box>
                <Box args={[0.8, 0.5, 0.8]} position={[0, 1.7, 0]}>
                    <meshStandardMaterial color="#FFE4B5" emissive="#FFD700" emissiveIntensity={0.3} />
                </Box>
            </group>

            {/* Sofa */}
            <group position={[0, -1.5, 0]}>
                {/* Seat */}
                <Box args={[4, 0.8, 1.5]} position={[0, 0, 0]}>
                    <meshStandardMaterial color="#4A5568" />
                </Box>
                {/* Back */}
                <Box args={[4, 1.2, 0.4]} position={[0, 0.6, -0.7]}>
                    <meshStandardMaterial color="#4A5568" />
                </Box>
                {/* Armrests */}
                <Box args={[0.4, 0.8, 1.5]} position={[-2, 0.4, 0]}>
                    <meshStandardMaterial color="#4A5568" />
                </Box>
                <Box args={[0.4, 0.8, 1.5]} position={[2, 0.4, 0]}>
                    <meshStandardMaterial color="#4A5568" />
                </Box>
            </group>

            {/* Coffee Table */}
            <group position={[0, -1.7, 2]}>
                <Box args={[2, 0.1, 1]}>
                    <meshStandardMaterial color="#8B4513" />
                </Box>
                {/* Legs */}
                <Box args={[0.1, 0.5, 0.1]} position={[-0.9, -0.3, -0.4]}>
                    <meshStandardMaterial color="#5D4037" />
                </Box>
                <Box args={[0.1, 0.5, 0.1]} position={[0.9, -0.3, -0.4]}>
                    <meshStandardMaterial color="#5D4037" />
                </Box>
                <Box args={[0.1, 0.5, 0.1]} position={[-0.9, -0.3, 0.4]}>
                    <meshStandardMaterial color="#5D4037" />
                </Box>
                <Box args={[0.1, 0.5, 0.1]} position={[0.9, -0.3, 0.4]}>
                    <meshStandardMaterial color="#5D4037" />
                </Box>
            </group>

            {/* Plant */}
            <group position={[3.5, -1.5, -3]}>
                <Box args={[0.6, 0.8, 0.6]}>
                    <meshStandardMaterial color="#8B4513" />
                </Box>
                <Box args={[0.8, 1.2, 0.8]} position={[0, 1, 0]}>
                    <meshStandardMaterial color="#228B22" />
                </Box>
            </group>
        </group>
    );
}

const WALL_COLORS = [
    { name: 'Warm White', color: '#F5F5DC' },
    { name: 'Sage Green', color: '#9CAF88' },
    { name: 'Soft Blue', color: '#B8D4E3' },
    { name: 'Blush Pink', color: '#E8C4C4' },
    { name: 'Charcoal', color: '#36454F' },
    { name: 'Terracotta', color: '#C97D60' },
];

const FLOOR_COLORS = [
    { name: 'Oak Wood', color: '#C19A6B' },
    { name: 'Dark Walnut', color: '#5D432C' },
    { name: 'Light Gray', color: '#D3D3D3' },
    { name: 'Marble White', color: '#F0F0F0' },
];

interface ModelViewerFallbackProps {
    planTitle?: string;
}

export default function ModelViewerFallback({ planTitle }: ModelViewerFallbackProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [wallColor, setWallColor] = useState('#F5F5DC');
    const [floorColor, setFloorColor] = useState('#C19A6B');
    const [showColorPanel, setShowColorPanel] = useState(false);

    const handleFullscreen = () => {
        if (containerRef.current) {
            if (document.fullscreenElement) {
                document.exitFullscreen();
            } else {
                containerRef.current.requestFullscreen();
            }
        }
    };

    return (
        <div ref={containerRef} className="relative w-full h-[700px] bg-gradient-to-b from-slate-800 to-slate-900 rounded-xl overflow-hidden shadow-2xl border border-white/10">
            {/* 3D Canvas */}
            <Canvas
                shadows
                camera={{ position: [8, 5, 8], fov: 50 }}
                className="w-full h-full"
            >
                <Suspense fallback={null}>
                    <ambientLight intensity={0.4} />
                    <directionalLight position={[5, 10, 5]} intensity={1} castShadow />
                    <pointLight position={[-3, 2, -3]} intensity={0.5} color="#FFD700" />
                    <Room3D wallColor={wallColor} floorColor={floorColor} />
                    <Environment preset="apartment" />
                    <OrbitControls
                        enablePan={true}
                        enableZoom={true}
                        enableRotate={true}
                        maxPolarAngle={Math.PI / 2}
                        minDistance={5}
                        maxDistance={20}
                    />
                </Suspense>
            </Canvas>

            {/* Toolbar */}
            <div className="absolute top-4 right-4 flex items-center gap-2 z-40">
                <Button
                    size="icon"
                    variant="secondary"
                    className="bg-black/60 hover:bg-black/80 text-white border border-white/10"
                    onClick={() => setShowColorPanel(!showColorPanel)}
                    title="Customize Colors"
                >
                    <Palette className="w-4 h-4" />
                </Button>
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
                    Interactive 3D Preview
                </div>
            </div>

            {/* Color Panel */}
            {showColorPanel && (
                <div className="absolute top-16 right-4 bg-black/80 backdrop-blur-lg rounded-xl p-4 z-40 border border-white/10 w-64">
                    <h3 className="text-white font-bold mb-3 text-sm">Wall Color</h3>
                    <div className="grid grid-cols-3 gap-2 mb-4">
                        {WALL_COLORS.map((c) => (
                            <button
                                key={c.name}
                                onClick={() => setWallColor(c.color)}
                                className={`w-full aspect-square rounded-lg border-2 transition-all ${wallColor === c.color ? 'border-white scale-110' : 'border-transparent hover:border-white/50'}`}
                                style={{ backgroundColor: c.color }}
                                title={c.name}
                            />
                        ))}
                    </div>
                    <h3 className="text-white font-bold mb-3 text-sm">Floor Color</h3>
                    <div className="grid grid-cols-4 gap-2">
                        {FLOOR_COLORS.map((c) => (
                            <button
                                key={c.name}
                                onClick={() => setFloorColor(c.color)}
                                className={`w-full aspect-square rounded-lg border-2 transition-all ${floorColor === c.color ? 'border-white scale-110' : 'border-transparent hover:border-white/50'}`}
                                style={{ backgroundColor: c.color }}
                                title={c.name}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Help Text */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40">
                <div className="bg-black/70 backdrop-blur-sm text-white text-xs px-4 py-2 rounded-full border border-white/10">
                    Drag to rotate • Scroll to zoom • Click palette to customize
                </div>
            </div>
        </div>
    );
}
