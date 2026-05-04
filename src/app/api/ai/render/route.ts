import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: Request) {
    try {
        const { imageBase64, engine, style } = await req.json();

        if (!imageBase64) {
            return NextResponse.json(
                { error: 'Image data is required' },
                { status: 400 }
            );
        }

        if (engine === 'gemini' || engine === 'GEMINI') {
            // Gemini AI Implementation
            const apiKey = process.env.GEMINI_API_KEY;
            if (!apiKey) {
                return NextResponse.json(
                    { error: 'Gemini API key not configured' },
                    { status: 500 }
                );
            }

            try {
                const genAI = new GoogleGenerativeAI(apiKey);
                const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

                // Remove data URL prefix if present
                const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');

                const result = await model.generateContent([
                    {
                        text: `Transform this 3D architectural floor plan into a photorealistic interior render. 
                        Style: ${style || 'modern minimalist'}
                        Make it look like a professional architectural visualization with:
                        - Natural lighting from windows
                        - High-quality materials and textures
                        - Realistic shadows and reflections
                        - Professional interior design staging`
                    },
                    {
                        inlineData: {
                            mimeType: 'image/png',
                            data: base64Data
                        }
                    }
                ]);

                // Note: Gemini's image generation capabilities vary by model
                // This is a placeholder for when image-to-image is available
                return NextResponse.json({
                    success: true,
                    message: 'Gemini processing complete',
                    // imageUrl would come from actual Gemini response
                    description: result.response.text()
                });
            } catch (geminiError: any) {
                console.error('Gemini API error:', geminiError);
                return NextResponse.json(
                    { error: 'Gemini API processing failed', details: geminiError.message },
                    { status: 500 }
                );
            }
        } else {
            // RoomsGPT / Replicate ControlNet Implementation
            const replicateApiKey = process.env.REPLICATE_API_KEY;
            if (!replicateApiKey) {
                return NextResponse.json(
                    { error: 'Replicate API key not configured' },
                    { status: 500 }
                );
            }

            try {
                const response = await fetch('https://api.replicate.com/v1/predictions', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Token ${replicateApiKey}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        // Using a popular interior design model
                        version: 'jagilley/controlnet-interior:latest',
                        input: {
                            image: imageBase64,
                            prompt: `A photorealistic ${style || 'modern'} interior design, professional architectural visualization, high quality render, natural lighting, 8k`,
                            negative_prompt: 'low quality, blurry, distorted',
                            num_inference_steps: 30,
                            guidance_scale: 7.5
                        }
                    })
                });

                if (!response.ok) {
                    throw new Error('Replicate API request failed');
                }

                const prediction = await response.json();

                // For async predictions, we'd need to poll for the result
                // For simplicity, returning the prediction ID
                return NextResponse.json({
                    success: true,
                    predictionId: prediction.id,
                    status: prediction.status,
                    // If completed immediately:
                    imageUrl: prediction.output?.[0] || null
                });
            } catch (replicateError: any) {
                console.error('Replicate API error:', replicateError);
                return NextResponse.json(
                    { error: 'Replicate API processing failed', details: replicateError.message },
                    { status: 500 }
                );
            }
        }
    } catch (error: any) {
        console.error('AI Render API error:', error);
        return NextResponse.json(
            { error: 'Internal server error', details: error.message },
            { status: 500 }
        );
    }
}
