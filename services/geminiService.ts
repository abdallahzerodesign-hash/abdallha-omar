import type { UploadedFile, Shot } from '../types';

/**
 * A centralized error handler for API fetch calls.
 * It parses the JSON error from the backend and throws a user-friendly message.
 * @param response The raw Response object from fetch.
 * @throws A new Error with a user-friendly message.
 */
const handleApiError = async (response: Response): Promise<never> => {
    const errorBody = await response.json().catch(() => ({ error: 'فشل تحليل استجابة الخطأ من الخادم.' }));
    throw new Error(errorBody.error || `فشل الطلب. رمز الحالة: ${response.status}`);
};

/**
 * Converts a File object to a serializable format (base64) to be sent to the backend.
 * @param file The File object to convert.
 * @returns An object with base64 string and mimeType.
 */
const fileToSerializable = async (file: File) => {
    const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
    return {
        base64,
        mimeType: file.type
    };
};


export const createStoryboardFromImages = async (images: UploadedFile[]): Promise<Shot[]> => {
    const response = await fetch('/api/analyzeImages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ images }),
    });

    if (!response.ok) {
        return handleApiError(response);
    }
    return response.json();
};

export const generateNarrationFromPrompt = async (prompt: string): Promise<string> => {
    const response = await fetch('/api/generateNarration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
        return handleApiError(response);
    }
    const data = await response.json();
    return data.narration;
};

export const extractShotsFromScript = async (script: string): Promise<Shot[]> => {
    const response = await fetch('/api/extractShots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ script }),
    });

    if (!response.ok) {
        return handleApiError(response);
    }
    return response.json();
};

export const generateScriptFromDocument = async (file: File): Promise<string> => {
    const fileData = await fileToSerializable(file);
    const response = await fetch('/api/analyzeDocument', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileData }),
    });

    if (!response.ok) {
        return handleApiError(response);
    }
    const data = await response.json();
    return data.script;
};

export const summarizeScriptForVideo = async (script: string): Promise<string> => {
    const response = await fetch('/api/summarizeScript', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ script }),
    });

    if (!response.ok) {
        return handleApiError(response);
    }
    const data = await response.json();
    return data.summary;
}

export const generateScriptFromIdea = async (idea: string): Promise<string> => {
    const response = await fetch('/api/expandScript', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea }),
    });

    if (!response.ok) {
        return handleApiError(response);
    }
    const data = await response.json();
    return data.script;
};

export const generateVideo = async (prompt: string, image: UploadedFile | null): Promise<Blob> => {
    const response = await fetch('/api/generateVideo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, image }),
    });

    if (!response.ok) {
        return handleApiError(response);
    }

    return response.blob();
};
