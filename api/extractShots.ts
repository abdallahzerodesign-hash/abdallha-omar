import { GoogleGenAI, Type } from "@google/genai";
import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { Shot } from '../src/types';

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
أنت مساعد مخرج خبير. مهمتك هي قراءة السيناريو التالي وتقسيمه إلى لقطات (مشاهد) فردية ومتسلسلة.
لكل لقطة، يجب أن تستخرج معلومتين أساسيتين:
1.  **visual**: وصف بصري موجز وواضح للمشهد (ما يجب أن يظهر في الفيديو).
2.  **overlay**: النص المصاحب لهذه اللقطة (حوار أو تعليق وصفي) الذي يجب أن يظهر على الشاشة.
يجب أن يكون الناتج النهائي عبارة عن مصفوفة JSON صالحة من الكائنات. كل كائن يجب أن يحتوي على مفتاحي 'visual' و 'overlay' فقط.

السيناريو:
"${script}"

الآن، قم بإنشاء مصفوفة JSON للقطات.
`;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            visual: { type: Type.STRING },
                            overlay: { type: Type.STRING }
                        },
                        required: ["visual", "overlay"]
                    }
                }
            }
        });
        
        const shotsData: Omit<Shot, 'id' | 'cameraMotion' | 'motionAmount'>[] = JSON.parse(response.text.trim());
        const shots: Shot[] = shotsData.map((shot, index) => ({
            ...shot,
            id: index,
            cameraMotion: 'none',
            motionAmount: 2,
        }));

        res.status(200).json(shots);

    } catch (error) {
        return handleGeminiError(error, res);
    }
}