'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Trash2, Upload, FileText, Box, Image as ImageIcon, Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Image as PlanImage } from '@prisma/client';

interface MediaManagerProps {
    planId: string;
    initialMedia: PlanImage[];
}

export default function MediaManager({ planId, initialMedia }: MediaManagerProps) {
    const [mediaList, setMediaList] = useState<PlanImage[]>(initialMedia);
    const [isUploading, setIsUploading] = useState(false);
    const router = useRouter();

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsUploading(true);

        try {
            // 1. Upload file
            const formData = new FormData();
            formData.append('file', file);

            const uploadRes = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (!uploadRes.ok) throw new Error('Upload failed');
            const uploadData = await uploadRes.json();

            // 2. Determine type
            let type = 'IMAGE';
            if (file.type === 'application/pdf') type = 'PDF';
            else if (file.name.endsWith('.glb')) type = 'GLB';
            else if (file.name.endsWith('.gltf')) type = 'GLTF';
            // User might need to manually select 360 view, but we'll default based on extension for now

            // 3. Link to plan
            const linkRes = await fetch(`/api/plans/${planId}/media`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    url: uploadData.url,
                    type,
                    filename: uploadData.filename,
                    title: file.name
                }),
            });

            if (!linkRes.ok) throw new Error('Failed to link media');
            const newMedia = await linkRes.json();

            setMediaList([...mediaList, newMedia]);
            router.refresh();
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to upload media');
        } finally {
            setIsUploading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this media?')) return;

        try {
            await fetch(`/api/media/${id}`, { method: 'DELETE' });
            setMediaList(mediaList.filter(m => m.id !== id));
            router.refresh();
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to delete media');
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'PDF': return <FileText className="w-8 h-8 text-red-500" />;
            case 'GLB':
            case 'GLTF': return <Box className="w-8 h-8 text-blue-500" />;
            case '360_VIEW': return <Eye className="w-8 h-8 text-purple-500" />;
            default: return <ImageIcon className="w-8 h-8 text-gray-500" />;
        }
    };

    return (
        <div className="space-y-6 p-6 bg-card rounded-xl border border-border/50 shadow-sm">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold">Media Gallery</h3>
                <div className="relative">
                    <input
                        type="file"
                        onChange={handleFileUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        accept=".jpg,.jpeg,.png,.webp,.pdf,.glb,.gltf"
                    />
                    <Button disabled={isUploading}>
                        {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                        Upload Media
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {mediaList.map((media) => (
                    <div key={media.id} className="relative group bg-muted rounded-lg border border-border overflow-hidden">
                        <div className="aspect-square flex items-center justify-center p-2">
                            {media.type === 'IMAGE' || media.type === '360_VIEW' ? (
                                <img src={media.url} alt={media.title || ''} className="w-full h-full object-cover rounded-md" />
                            ) : (
                                <div className="flex flex-col items-center gap-2">
                                    {getIcon(media.type)}
                                    <span className="text-xs font-mono truncate max-w-[100px]">{media.type}</span>
                                </div>
                            )}
                        </div>

                        <div className="absolute inset-x-0 bottom-0 bg-black/70 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <p className="text-white text-xs truncate mb-2">{media.title}</p>
                            <Button
                                variant="destructive"
                                size="sm"
                                className="w-full h-8 text-xs"
                                onClick={() => handleDelete(media.id)}
                            >
                                <Trash2 className="w-3 h-3 mr-1" /> Delete
                            </Button>
                        </div>

                        {/* Type Badge */}
                        <div className="absolute top-2 right-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full">
                            {media.type}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
