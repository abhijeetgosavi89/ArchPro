'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2, Download } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

interface AIRenderButtonProps {
    containerRef: React.RefObject<HTMLDivElement>;
    aiEngine?: 'gemini' | 'roomsgpt';
}

export default function AIRenderButton({ containerRef, aiEngine = 'gemini' }: AIRenderButtonProps) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [resultImage, setResultImage] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const captureScreenshot = async (): Promise<string> => {
        // In real implementation, we would use html2canvas or access the WebGL context
        // For now, we'll use a placeholder approach
        if (!containerRef.current) {
            throw new Error('Container not found');
        }

        // Try to get canvas from the 3D view
        const canvas = containerRef.current.querySelector('canvas');
        if (canvas) {
            return canvas.toDataURL('image/png');
        }

        throw new Error('Could not capture 3D view');
    };

    const handleGenerateRender = async () => {
        setIsGenerating(true);
        setError(null);
        setShowModal(true);

        try {
            // Capture screenshot
            const screenshot = await captureScreenshot();

            // Send to AI API
            const response = await fetch('/api/ai/render', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    imageBase64: screenshot,
                    engine: aiEngine,
                    style: 'photorealistic'
                })
            });

            if (!response.ok) {
                throw new Error('Failed to generate render');
            }

            const data = await response.json();
            setResultImage(data.imageUrl || data.image);
        } catch (err: any) {
            setError(err.message || 'Failed to generate AI render');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleDownload = () => {
        if (resultImage) {
            const link = document.createElement('a');
            link.href = resultImage;
            link.download = 'ai-rendered-plan.png';
            link.click();
        }
    };

    return (
        <>
            <Button
                onClick={handleGenerateRender}
                disabled={isGenerating}
                className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg"
            >
                {isGenerating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                    <Sparkles className="w-4 h-4" />
                )}
                {isGenerating ? 'Generating...' : 'AI Photoreal Render'}
            </Button>

            <Dialog open={showModal} onOpenChange={setShowModal}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-purple-500" />
                            AI Photorealistic Render
                        </DialogTitle>
                        <DialogDescription>
                            Powered by {aiEngine === 'gemini' ? 'Google Gemini AI' : 'RoomsGPT'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="mt-4">
                        {isGenerating && (
                            <div className="flex flex-col items-center justify-center py-20">
                                <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
                                <p className="text-sm text-muted-foreground">Creating your photorealistic render...</p>
                                <p className="text-xs text-muted-foreground mt-2">This may take 15-30 seconds</p>
                            </div>
                        )}

                        {error && !isGenerating && (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                                    <span className="text-3xl">⚠️</span>
                                </div>
                                <p className="text-sm text-destructive font-medium">{error}</p>
                                <p className="text-xs text-muted-foreground mt-2">
                                    Please try again or check your AI API configuration.
                                </p>
                                <Button variant="outline" className="mt-4" onClick={() => setShowModal(false)}>
                                    Close
                                </Button>
                            </div>
                        )}

                        {resultImage && !isGenerating && (
                            <div className="space-y-4">
                                <div className="rounded-lg overflow-hidden border border-border/50 shadow-xl">
                                    <img
                                        src={resultImage}
                                        alt="AI Rendered Plan"
                                        className="w-full h-auto"
                                    />
                                </div>
                                <div className="flex justify-end gap-2">
                                    <Button variant="outline" onClick={() => setShowModal(false)}>
                                        Close
                                    </Button>
                                    <Button onClick={handleDownload} className="gap-2">
                                        <Download className="w-4 h-4" />
                                        Download
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
