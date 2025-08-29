// FIX: Removed 'GenerativePart' from import as it's not exported from the module.
import { GoogleGenAI, Type } from "@google/genai";
import type { UploadedFile, Shot } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * A centralized error handler for Gemini API calls.
 * It checks for specific quota-related errors and throws a user-friendly message.
 * For other errors, it throws a generic server communication error.
 * @param error The error caught from the API call.
 * @throws A custom, user-friendly Error object.
 */
const handleGeminiError = (error: unknown): never => {
    console.error("Gemini API Error:", error);
    let errorMessage = 'حدث خطأ غير متوقع';
    if (error instanceof Error) {
        errorMessage = error.message;
    } else if (typeof error === 'string') {
        errorMessage = error;
    }

    const lowerCaseError = errorMessage.toLowerCase();
    // Check for common quota-related phrases from Google API errors
    if (
        lowerCaseError.includes('quota') || 
        lowerCaseError.includes('api key not valid') || 
        lowerCaseError.includes('billing') || 
        lowerCaseError.includes('user location is not supported') ||
        lowerCaseError.includes('resource has been exhausted')
    ) {
        throw new Error("لقد وصلنا إلى الحد الأقصى من المحاولات اليومية المتاحة للتطبيق. شكرًا لك على إبداعك! يرجى المحاولة مرة أخرى غدًا.");
    }
    
    // For other errors, re-throw a more generic but still informative message.
    throw new Error(`حدث خطأ أثناء الاتصال بالخادم: ${errorMessage}`);
};


// FIX: Removed 'Promise<GenerativePart>' return type annotation. TypeScript will infer the return type.
const fileToGenerativePart = async (file: File) => {
    const base64EncodedData = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });

    return {
        inlineData: {
            data: base64EncodedData,
            mimeType: file.type,
        },
    };
};

export const createStoryboardFromImages = async (images: UploadedFile[]): Promise<Shot[]> => {
    try {
        console.log('Creating storyboard from images...');
        const model = 'gemini-2.5-flash';
        const textPart = {
            text: `
أنت مخرج سينمائي وخبير في رواية القصص. مهمتك هي تحليل سلسلة من الصور التي قدمها المستخدم وإنشاء لوحة قصة (storyboard) متماسكة.
لكل صورة، بالترتيب، يجب عليك إنشاء معلومتين أساسيتين:
1.  **visual**: وصف بصري موجز وواضح لمولد الفيديو الذكي لتحريك تلك الصورة المحددة.
2.  **overlay**: جملة سردية واحدة قصيرة يجب أن تظهر كنص على الفيديو لتلك الصورة، مما يساعد في سرد القصة.
يجب أن يكون الناتج النهائي عبارة عن مصفوفة JSON صالحة من الكائنات. كل كائن يجب أن يحتوي على مفتاحي 'visual' و 'overlay' فقط.

حلل الصور التالية وقم بإنشاء لوحة قصة JSON.
`
        };
        const imageParts = images.map(image => ({
            inlineData: {
                data: image.base64,
                mimeType: image.mimeType,
            },
        }));

        const response = await ai.models.generateContent({
            model: model,
            contents: { parts: [textPart, ...imageParts] },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            visual: {
                                type: Type.STRING,
                                description: "وصف بصري موجز للمشهد لمولد الفيديو."
                            },
                            overlay: {
                                type: Type.STRING,
                                description: "النص المصاحب (حوار أو سرد) الذي يجب عرضه كتراكب على هذه اللقطة."
                            }
                        },
                        required: ["visual", "overlay"]
                    }
                }
            }
        });

        const jsonText = response.text.trim();
        const shotsData: Omit<Shot, 'id' | 'cameraMotion' | 'motionAmount'>[] = JSON.parse(jsonText);
        
        const shots = shotsData.map((shot, index) => ({
            ...shot,
            id: index,
            cameraMotion: 'none',
            motionAmount: 2,
        }));

        return shots;
    } catch (error) {
        handleGeminiError(error);
    }
};

export const generateNarrationFromPrompt = async (prompt: string): Promise<string> => {
    try {
        console.log('Generating narration for prompt...');
        const model = 'gemini-2.5-flash';
        const narrationPrompt = `
أنت معلق صوتي محترف ومؤلف نصوص. مهمتك هي قراءة وصف الفيديو التالي وكتابة جملة سردية واحدة فقط, قصيرة وموجزة, وجذابة ومناسبة للتعليق الصوتي.
يجب أن يصف النص السردي المشهد بطريقة إبداعية ويثير المشاعر.
الناتج يجب أن يكون **النص السردي فقط**، بدون أي مقدمات أو علامات اقتباس.

وصف الفيديو:
"${prompt}"

الآن، قم بإنشاء النص السردي.
`;
        const response = await ai.models.generateContent({ model, contents: narrationPrompt });
        const narration = response.text;
        if (!narration) throw new Error('لم يتمكن الذكاء الاصطناعي من إنشاء السرد.');
        return narration.trim();
    } catch (error) {
        handleGeminiError(error);
    }
};

export const extractShotsFromScript = async (script: string): Promise<Shot[]> => {
    try {
        console.log('Extracting shots from script...');
        const model = 'gemini-2.5-flash';
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
            model: model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            visual: {
                                type: Type.STRING,
                                description: "وصف بصري موجز للمشهد لمولد الفيديو."
                            },
                            overlay: {
                                type: Type.STRING,
                                description: "النص المصاحب (حوار أو سرد) الذي يجب عرضه كتراكب على هذه اللقطة."
                            }
                        },
                        required: ["visual", "overlay"]
                    }
                }
            }
        });

        const jsonText = response.text.trim();
        const shotsData: Omit<Shot, 'id' | 'cameraMotion' | 'motionAmount'>[] = JSON.parse(jsonText);
        
        const shots = shotsData.map((shot, index) => ({
            ...shot,
            id: index,
            cameraMotion: 'none',
            motionAmount: 2,
        }));

        return shots;
    } catch (error) {
        handleGeminiError(error);
    }
};


export const generateScriptFromDocument = async (file: File): Promise<string> => {
    try {
        console.log(`Generating script from document: ${file.name}`);
        const model = 'gemini-2.5-flash';
        const documentPart = await fileToGenerativePart(file);
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
            model: model,
            contents: { parts: [documentPart, textPart] },
        });

        const script = response.text;
        if (!script) throw new Error('لم يتمكن الذكاء الاصطناعي من إنشاء سيناريو من المستند.');
        return script.trim();
    } catch (error) {
        handleGeminiError(error);
    }
};

export const summarizeScriptForVideo = async (script: string): Promise<string> => {
    try {
        console.log('Summarizing script for Director Mode');
        const model = 'gemini-2.5-flash';
        const prompt = `
أنت مساعد مخرج خبير. مهمتك هي قراءة السيناريو التالي وتلخيصه في أمر واحد موجز ومؤثر لمولد الفيديو.
يجب أن يلتقط الملخص جوهر القصة، تطور الأحداث، والحالة المزاجية العامة.
الناتج يجب أن يكون وصفًا إبداعيًا يمكن لمولد الفيديو استخدامه لإنشاء مشهد واحد متكامل يمثل القصة بأكملها.

السيناريو:
"${script}"

الآن، قم بإنشاء الأمر الموجز لمولد الفيديو.
`;
        const response = await ai.models.generateContent({ model, contents: prompt });
        const summary = response.text;
        if (!summary) throw new Error('لم يتمكن الذكاء الاصطناعي من تلخيص السيناريو.');
        return summary.trim();
    } catch (error) {
        handleGeminiError(error);
    }
}


export const generateScriptFromIdea = async (idea: string): Promise<string> => {
    try {
        console.log(`Generating script for idea: ${idea}`);
        const model = 'gemini-2.5-flash';
        const prompt = `
أنت مساعد إبداعي متخصص في كتابة السيناريوهات. مهمتك هي أخذ فكرة بسيطة وتحويلها إلى سيناريو فيديو سردي.
نفذ هذه المهمة على خطوتين:
1.  **التوسيع:** قم بتوسيع الفكرة إلى وصف مشهد سينمائي غني بالتفاصيل.
2.  **كتابة السيناريو:** بناءً على الوصف، اكتب سيناريو قصير ومقسم إلى مشاهد.
الناتج النهائي يجب أن يكون **السيناريو فقط**.
فكرة المستخدم: "${idea}"
`;
        const response = await ai.models.generateContent({ model: model, contents: prompt });
        const script = response.text;
        if (!script) throw new Error('لم يتمكن الذكاء الاصطناعي من إنشاء سيناريو.');
        return script.trim();
    } catch (error) {
        handleGeminiError(error);
    }
};

export const generateVideo = async (prompt: string, image: UploadedFile | null): Promise<Blob> => {
    try {
        console.log('Starting video generation...');
        
        const generationPayload: any = { model: 'veo-2.0-generate-001', prompt, config: { numberOfVideos: 1 } };

        if (image) {
            generationPayload.image = { imageBytes: image.base64, mimeType: image.mimeType };
        }

        let operation = await ai.models.generateVideos(generationPayload);
        console.log('Polling for completion...');

        while (!operation.done) {
            await new Promise(resolve => setTimeout(resolve, 10000));
            operation = await ai.operations.getVideosOperation({ operation });
        }

        console.log('Video generation operation complete.');

        if (operation.error) {
            const errorMessage = (operation.error as any).message || 'An unknown error occurred.';
            throw new Error(errorMessage);
        }

        const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;

        if (!downloadLink) {
            throw new Error('لم يتم العثور على رابط تحميل الفيديو. قد يكون الطلب غير مناسب.');
        }

        const videoResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
        
        if (!videoResponse.ok) {
            throw new Error(`فشل تحميل الفيديو: ${videoResponse.statusText}`);
        }

        return await videoResponse.blob();
    } catch (error) {
        handleGeminiError(error);
    }
};