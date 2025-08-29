import React, { useRef, useCallback } from 'react';
import type { UploadedFile } from '../types';

interface MultiImageUploaderProps {
  images: UploadedFile[];
  onImagesChange: (images: UploadedFile[]) => void;
  disabled: boolean;
}

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result.split(',')[1]);
      } else {
        reject(new Error('Failed to read file as base64 string'));
      }
    };
    reader.onerror = error => reject(error);
  });
};

export const MultiImageUploader: React.FC<MultiImageUploaderProps> = ({ 
    images, 
    onImagesChange, 
    disabled
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFilesChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      try {
        const newImages = await Promise.all(
          Array.from(files).map(async (file) => {
            const base64 = await fileToBase64(file);
            return { base64, mimeType: file.type, name: file.name };
          })
        );
        onImagesChange([...images, ...newImages]);
      } catch (error) {
        console.error("Error converting files to base64:", error);
      }
    }
  }, [images, onImagesChange]);
  
  const handleRemoveImage = (indexToRemove: number) => {
    onImagesChange(images.filter((_, index) => index !== indexToRemove));
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };
  
  return (
    <div className="flex flex-col space-y-4">
        <p className="text-center text-gray-400">
            قم بتحميل صورة أو أكثر لتحريكها وإنشاء فيديو.
        </p>
        <div className="w-full bg-gray-900/70 border-2 border-dashed border-gray-600 rounded-lg p-4 transition-colors duration-300 min-h-[150px] flex items-center justify-center">
            <div className="text-center">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFilesChange}
                  className="hidden"
                  accept="image/*"
                  multiple
                  disabled={disabled}
                />
                <button
                  onClick={handleUploadClick}
                  disabled={disabled}
                  className="bg-cyan-600/50 text-cyan-300 hover:bg-cyan-600/80 font-semibold transition-colors py-2 px-4 rounded-md"
                >
                  اختر ملفات
                </button>
                <p className="text-xs text-gray-500 mt-2">أو اسحب وأفلت الصور هنا</p>
            </div>
        </div>
        
        {images.length > 0 && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {images.map((image, index) => (
                <div key={index} className="relative aspect-square group">
                    <img src={`data:${image.mimeType};base64,${image.base64}`} alt={`Preview ${index}`} className="w-full h-full object-cover rounded-md" />
                    <button
                    onClick={() => handleRemoveImage(index)}
                    disabled={disabled}
                    className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 hover:bg-black/90 transition-opacity opacity-0 group-hover:opacity-100"
                    aria-label={`Remove image ${index + 1}`}
                    >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    </button>
                </div>
                ))}
            </div>
          </>
        )}
        <p className="text-xs text-center text-amber-400/80">
          ملاحظة: حاليًا، سيتم استخدام الصورة الأولى فقط لإنشاء الفيديو.
        </p>
    </div>
  );
};
