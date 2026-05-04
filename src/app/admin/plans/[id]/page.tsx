
'use client';

import PlanForm from '@/components/PlanForm';
import { useEffect, useState } from 'react';
import MediaManager from '@/components/admin/MediaManager';
import { Plan, Image } from '@prisma/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Upload, FileBox, Image as ImageIcon, Sparkles } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function EditPlanPage({ params }: { params: Promise<{ id: string }> }) {
    const [plan, setPlan] = useState<Plan & { images: Image[] } | null>(null);
    const [loading, setLoading] = useState(true);
    const [unwrappedParams, setUnwrappedParams] = useState<{ id: string } | null>(null);
    const [uploading, setUploading] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        params.then(setUnwrappedParams);
    }, [params]);

    useEffect(() => {
        if (unwrappedParams) {
            fetch(`/api/plans/${unwrappedParams.id}`)
                .then(res => res.json())
                .then(data => {
                    setPlan(data);
                    setLoading(false);
                });
        }
    }, [unwrappedParams]);

    const handleFileUpload = async (file: File, fieldName: 'sh3dFileUrl' | 'floorPlanUrl') => {
        if (!plan || !unwrappedParams) return;
        setUploading(true);

        try {
            // Step 1: Upload the file to the server
            const formData = new FormData();
            formData.append('file', file);

            const uploadResponse = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });

            if (!uploadResponse.ok) {
                throw new Error('Failed to upload file');
            }

            const uploadResult = await uploadResponse.json();
            const fileUrl = uploadResult.url;

            // Step 2: Update the plan with the new file URL
            const updateResponse = await fetch(`/api/plans/${unwrappedParams.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ [fieldName]: fileUrl })
            });

            if (updateResponse.ok) {
                toast({
                    title: 'Upload Complete',
                    description: `${fieldName === 'sh3dFileUrl' ? '.sh3d file' : 'Floor plan'} has been uploaded successfully.`
                });
                setPlan({ ...plan, [fieldName]: fileUrl } as any);
            } else {
                throw new Error('Failed to update plan');
            }
        } catch (error: any) {
            console.error('Upload error:', error);
            toast({
                title: 'Upload Failed',
                description: error.message || 'Could not upload file.',
                variant: 'destructive'
            });
        } finally {
            setUploading(false);
        }
    };

    const handleAIEngineChange = async (value: string) => {
        if (!plan || !unwrappedParams) return;

        const response = await fetch(`/api/plans/${unwrappedParams.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ aiEngine: value })
        });

        if (response.ok) {
            toast({ title: 'Settings Updated', description: 'AI engine preference saved.' });
            setPlan({ ...plan, aiEngine: value } as any);
        }
    };

    if (loading) return <div className="container p-8">Loading...</div>;
    if (!plan) return <div className="container p-8">Plan not found</div>;

    return (
        <div className="container mx-auto py-8 px-4 space-y-8">
            <h1 className="text-3xl font-bold">Edit Plan: {plan.title}</h1>

            <PlanForm initialData={plan} isEditing={true} />

            <div className="border-t pt-8">
                <h2 className="text-2xl font-bold mb-4">Media Management</h2>
                <MediaManager planId={plan.id} initialMedia={plan.images} />
            </div>

            {/* Sweet Home 3D Integration Section */}
            <div className="border-t pt-8">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <FileBox className="w-6 h-6 text-primary" />
                    Sweet Home 3D Integration
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* .sh3d File Upload */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Upload className="w-5 h-5" /> Upload .sh3d File
                            </CardTitle>
                            <CardDescription>
                                Upload a Sweet Home 3D project file for full 3D editing capabilities.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="sh3dFile">Select .sh3d File</Label>
                                <Input
                                    id="sh3dFile"
                                    type="file"
                                    accept=".sh3d"
                                    disabled={uploading}
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) handleFileUpload(file, 'sh3dFileUrl');
                                    }}
                                />
                            </div>
                            {(plan as any).sh3dFileUrl && (
                                <div className="text-sm text-green-600 bg-green-500/10 p-2 rounded">
                                    ✓ .sh3d file uploaded: {(plan as any).sh3dFileUrl}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* 2D Floor Plan Upload */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <ImageIcon className="w-5 h-5" /> Upload 2D Floor Plan
                            </CardTitle>
                            <CardDescription>
                                Upload a floor plan image for users to trace and create 3D models.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="floorPlan">Select Image (PNG/JPG)</Label>
                                <Input
                                    id="floorPlan"
                                    type="file"
                                    accept="image/*"
                                    disabled={uploading}
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) handleFileUpload(file, 'floorPlanUrl');
                                    }}
                                />
                            </div>
                            {(plan as any).floorPlanUrl && (
                                <div className="text-sm text-green-600 bg-green-500/10 p-2 rounded">
                                    ✓ Floor plan uploaded: {(plan as any).floorPlanUrl}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* AI Engine Selection */}
                <Card className="mt-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Sparkles className="w-5 h-5" /> AI Rendering Engine
                        </CardTitle>
                        <CardDescription>
                            Choose which AI engine to use for photorealistic renders for this specific plan.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-2 max-w-md">
                            <Label>AI Engine for This Plan</Label>
                            <Select
                                value={(plan as any).aiEngine || 'default'}
                                onValueChange={handleAIEngineChange}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select AI Engine" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="default">Use Global Default</SelectItem>
                                    <SelectItem value="gemini">Gemini AI (High Performance)</SelectItem>
                                    <SelectItem value="roomsgpt">RoomsGPT / ControlNet (Architectural Focus)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
