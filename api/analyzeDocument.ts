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
        const { fileData } = req.body; // { base64, mimeType }

        const documentPart = {
            inlineData: {
                data: fileData.base64,
                mimeType: fileData.mimeType,
            },
        };
        const textPart = {
            text: `
أنت مساعد خبير في تحليل المستندات وتحويلها إلى سيناريوهات فيديو موجزة وجذابة.
حلل محتوى الملف المرفق (قد يكون PDF, Word, أو PowerPoint) وقم بالمهام التالية:
1.  استخرج الأفكار والنقاط الرئيسية.
2.  اكتب سيناريو فيديو قصير ومقسم إلى مشاهد، يلخص هذا المحتوى بطريقة بصرية ومناسبة للتحويل إلى فيديو.
3.  يجب أن يكون الناتج النهائي هو **السيناريو فقط**، بدون أي مقدمات أو شروحات إضافية.
`,
        };
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [documentPart, textPart] },
        });

        const script = response.text.trim();
        if (!script) {
            throw new Error('لم يتمكن الذكاء الاصطناعي من إنشاء سيناريو من المستند.');
        }

        res.status(200).json({ script });

    } catch (error) {
        return handleGeminiError(error, res);
    }
}
