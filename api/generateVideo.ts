import { GoogleGenAI } from "@google/genai";
import type { VercelRequest, VercelResponse } from '@vercel/node';

const handleGeminiError = (error: unknown, res: VercelResponse) => {
    console.error("Gemini API Error:", error);
    let errorMessage = 'حدث خطأ غير متوقع';
    if (error instanceof Error) {
        errorMessage = error.message;
    } else if (typeof error === 'string') {
        errorMessage = error;
    }

    const lowerCaseError = errorMessage.toLowerCase();
    if (
        lowerCaseError.includes('quota') || 
        lowerCaseError.includes('api key not valid') || 
        lowerCaseError.includes('billing') || 
        lowerCaseError.includes('user location is not supported') ||
        lowerCaseError.includes('resource has been exhausted')
    ) {
        return res.status(429).json({ error: "لقد وصلنا إلى الحد الأقصى من المحاولات اليومية المتاحة للتطبيق. شكرًا لك على إبداعك! يرجى المحاولة مرة أخرى غدًا." });
    }
    
    return res.status(500).json({ error: `حدث خطأ أثناء الاتصال بالخادم: ${errorMessage}` });
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        if (!process.env.API_KEY) {
            return res.status(500).json({ error: "API_KEY environment variable not set on the server." });
        }
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

        const { prompt, image } = req.body;
        
        const generationPayload: any = { model: 'veo-2.0-generate-001', prompt, config: { numberOfVideos: 1 } };

        if (image) {
            generationPayload.image = { imageBytes: image.base64, mimeType: image.mimeType };
        }

        let operation = await ai.models.generateVideos(generationPayload);

        while (!operation.done) {
            await new Promise(resolve => setTimeout(resolve, 10000));
            operation = await ai.operations.getVideosOperation({ operation });
        }

        if (operation.error) {
            const errorMessage = (operation.error as any).message || 'An unknown error occurred during video generation.';
            throw new Error(errorMessage);
        }

        const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;

        if (!downloadLink) {
            throw new Error('لم يتم العثور على رابط تحميل الفيديو. قد يكون الطلب غير مناسب.');
        }

        const videoResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
        
        if (!videoResponse.ok || !videoResponse.body) {
            throw new Error(`فشل تحميل الفيديو من الرابط الذي تم إنشاؤه: ${videoResponse.statusText}`);
        }

        res.setHeader('Content-Type', videoResponse.headers.get('Content-Type') || 'video/mp4');
        res.setHeader('Content-Length', videoResponse.headers.get('Content-Length') || '');
        
        // Pipe the video stream directly to the response
        // FIX: The web ReadableStream from fetch does not have a .pipe() method.
        // Manually pipe the stream by reading chunks and writing them to the response.
        const reader = videoResponse.body.getReader();
        while (true) {
            const { done, value } = await reader.read();
            if (done) {
                break;
            }
            res.write(value);
        }
        res.end();

    } catch (error) {
        return handleGeminiError(error, res);
    }
}