import { GoogleGenAI } from "@google/genai";
import type { VercelRequest, VercelResponse } from '@vercel/node';

const handleGeminiError = (error: unknown, res: VercelResponse) => {
    console.error("Gemini API Error:", error);
    let errorMessage = 'حدث خطأ غير متوقع';
    if (error instanceof Error) errorMessage = error.message;
    else if (typeof error === 'string') errorMessage = error;

    if (errorMessage.toLowerCase().includes('quota')) {
        return res.status(429).json({ error: "لقد وصلنا إلى الحد الأقصى من المحاولات اليومية المتاحة للتطبيق." });
    }
    return res.status(500).json({ error: `حدث خطأ أثناء الاتصال بالخادم: ${errorMessage}` });
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        if (!process.env.API_KEY) {
            return res.status(500).json({ error: "API_KEY environment variable not set." });
        }
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const { prompt } = req.body;

        const narrationPrompt = `
أنت معلق صوتي محترف ومؤلف نصوص. مهمتك هي قراءة وصف الفيديو التالي وكتابة جملة سردية واحدة فقط, قصيرة وموجزة, وجذابة ومناسبة للتعليق الصوتي.
يجب أن يصف النص السردي المشهد بطريقة إبداعية ويثير المشاعر.
الناتج يجب أن يكون **النص السردي فقط**، بدون أي مقدمات أو علامات اقتباس.

وصف الفيديو:
"${prompt}"

الآن، قم بإنشاء النص السردي.
`;
        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: narrationPrompt });
        const narration = response.text.trim();
        
        if (!narration) {
            throw new Error('لم يتمكن الذكاء الاصطناعي من إنشاء السرد.');
        }

        res.status(200).json({ narration });

    } catch (error) {
        return handleGeminiError(error, res);
    }
}
