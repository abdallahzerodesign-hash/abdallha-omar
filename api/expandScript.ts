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
        const { idea } = req.body;

        const prompt = `
أنت مساعد إبداعي متخصص في كتابة السيناريوهات. مهمتك هي أخذ فكرة بسيطة وتحويلها إلى سيناريو فيديو سردي.
نفذ هذه المهمة على خطوتين:
1.  **التوسيع:** قم بتوسيع الفكرة إلى وصف مشهد سينمائي غني بالتفاصيل.
2.  **كتابة السيناريو:** بناءً على الوصف، اكتب سيناريو قصير ومقسم إلى مشاهد.
الناتج النهائي يجب أن يكون **السيناريو فقط**.
فكرة المستخدم: "${idea}"
`;
        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
        const script = response.text.trim();
        
        if (!script) {
            throw new Error('لم يتمكن الذكاء الاصطناعي من إنشاء سيناريو.');
        }

        res.status(200).json({ script });

    } catch (error) {
        return handleGeminiError(error, res);
    }
}
