'use client';

import React from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Paintbrush, Palette, Image as ImageIcon, X } from 'lucide-react';

interface WallCustomizerPanelProps {
    selectedWall: any;
    onColorChange: (color: string) => void;
    onTextureChange: (textureUrl: string) => void;
    onClose: () => void;
}

const WALL_COLORS = [
    { name: 'Warm White', hex: '#F5F5DC' },
    { name: 'Soft Gray', hex: '#D3D3D3' },
    { name: 'Sage Green', hex: '#9DC183' },
    { name: 'Sky Blue', hex: '#87CEEB' },
    { name: 'Blush Pink', hex: '#F4C2C2' },
    { name: 'Sand Beige', hex: '#E8D4B8' },
    { name: 'Charcoal', hex: '#36454F' },
    { name: 'Navy Blue', hex: '#000080' },
    { name: 'Forest Green', hex: '#228B22' },
    { name: 'Burgundy', hex: '#800020' },
    { name: 'Terracotta', hex: '#E2725B' },
    { name: 'Pure White', hex: '#FFFFFF' },
];

const WALL_TEXTURES = [
    { name: 'Brick', url: '/textures/brick.jpg', preview: '🧱' },
    { name: 'Oak Wood', url: '/textures/oak.jpg', preview: '🪵' },
    { name: 'Marble', url: '/textures/marble.jpg', preview: '⬜' },
    { name: 'Concrete', url: '/textures/concrete.jpg', preview: '🔲' },
    { name: 'Tile', url: '/textures/tile.jpg', preview: '🔳' },
    { name: 'Wallpaper', url: '/textures/wallpaper.jpg', preview: '🎨' },
];

export default function WallCustomizerPanel({
    selectedWall,
    onColorChange,
    onTextureChange,
    onClose
}: WallCustomizerPanelProps) {
    if (!selectedWall) return null;

    return (
        <div className="absolute right-4 top-20 w-72 bg-card/95 backdrop-blur-lg rounded-xl shadow-2xl border border-border/50 z-50 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border/50 bg-muted/50">
                <div className="flex items-center gap-2">
                    <Paintbrush className="w-5 h-5 text-primary" />
                    <h3 className="font-bold text-sm">Wall Customizer</h3>
                </div>
                <Button
                    size="icon"
                    variant="ghost"
                    className="w-8 h-8"
                    onClick={onClose}
                >
                    <X className="w-4 h-4" />
                </Button>
            </div>

            <div className="p-4 space-y-6">
                {/* Color Selection */}
                <div>
                    <Label className="flex items-center gap-2 mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        <Palette className="w-4 h-4" /> Wall Color
                    </Label>
                    <div className="grid grid-cols-6 gap-2">
                        {WALL_COLORS.map((color) => (
                            <button
                                key={color.hex}
                                className="w-9 h-9 rounded-lg border-2 border-transparent hover:border-primary hover:scale-110 transition-all shadow-sm"
                                style={{ backgroundColor: color.hex }}
                                onClick={() => onColorChange(color.hex)}
                                title={color.name}
                            />
                        ))}
                    </div>
                </div>

                {/* Texture Selection */}
                <div>
                    <Label className="flex items-center gap-2 mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        <ImageIcon className="w-4 h-4" /> Wall Texture
                    </Label>
                    <div className="grid grid-cols-3 gap-2">
                        {WALL_TEXTURES.map((texture) => (
                            <button
                                key={texture.name}
                                className="aspect-square rounded-lg border-2 border-border/50 hover:border-primary hover:scale-105 transition-all overflow-hidden bg-muted flex flex-col items-center justify-center text-xs font-medium"
                                onClick={() => onTextureChange(texture.url)}
                                title={texture.name}
                            >
                                <span className="text-2xl mb-1">{texture.preview}</span>
                                <span className="text-[10px] text-muted-foreground">{texture.name}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Actions */}
                <div className="pt-2 border-t border-border/50">
                    <p className="text-xs text-muted-foreground text-center">
                        Click on walls in the 3D view to apply changes
                    </p>
                </div>
            </div>
        </div>
    );
}
