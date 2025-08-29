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
        const { script } = req.body;

        const prompt = `
أنت مساعد مخرج خبير. مهمتك هي قراءة السيناريو التالي وتلخيصه في أمر واحد موجز ومؤثر لمولد الفيديو.
يجب أن يلتقط الملخص جوهر القصة، تطور الأحداث، والحالة المزاجية العامة.
الناتج يجب أن يكون وصفًا إبداعيًا يمكن لمولد الفيديو استخدامه لإنشاء مشهد واحد متكامل يمثل القصة بأكملها.

السيناريو:
"${script}"

الآن، قم بإنشاء الأمر الموجز لمولد الفيديو.
`;
        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
        const summary = response.text.trim();
        
        if (!summary) {
            throw new Error('لم يتمكن الذكاء الاصطناعي من تلخيص السيناريو.');
        }

        res.status(200).json({ summary });

    } catch (error) {
        return handleGeminiError(error, res);
    }
}
