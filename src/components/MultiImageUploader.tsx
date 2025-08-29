import React, { useRef, useState } from 'react';
import type { UploadedFile } from '../types';

interface MultiImageUploaderProps {
  images: UploadedFile[];
  onImagesChange: (images: UploadedFile[]) => void;
  disabled: boolean;
}

export const MultiImageUploader: React.FC<MultiImageUploaderProps> = ({ images, onImagesChange, disabled }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (files: FileList | null) => {
    if (!files) return;
    const newImages: Promise<UploadedFile>[] = Array.from(files).map(file => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const base64 = (event.target?.result as string).split(',')[1];
          if (base64) {
            resolve({
              base64,
              mimeType: file.type,
              name: file.name,
            });
          } else {
            reject(new Error("Failed to read file"));
          }
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    });

    Promise.all(newImages).then(results => {
      onImagesChange([...images, ...results]);
    }).catch(console.error);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileChange(e.dataTransfer.files);
  };

  const removeImage = (index: number) => {
    onImagesChange(images.filter((_, i) => i !== index));
  };
  
  return (
    <div className="space-y-4">
      <div 
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-300 ${
            isDragging ? 'border-cyan-400 bg-gray-700/50' : 'border-gray-600 hover:border-cyan-500 hover:bg-gray-800/50'
        }`}
      >
        <input 
          type="file" 
          multiple
          accept="image/*" 
          ref={fileInputRef} 
          onChange={(e) => handleFileChange(e.target.files)}
          className="hidden"
          disabled={disabled}
        />
        <p className="text-gray-400">اسحب وأفلت الصور هنا، أو انقر للاختيار</p>
        <p className="text-xs text-gray-500 mt-1">سيتم استخدام الصورة الأولى لإنشاء الفيديو حاليًا</p>
      </div>
      
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div key={index} className="relative group aspect-square">
              <img src={`data:${image.mimeType};base64,${image.base64}`} alt={image.name} className="w-full h-full object-cover rounded-md" />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center rounded-md">
                <button onClick={(e) => { e.stopPropagation(); removeImage(index); }} disabled={disabled} className="text-white bg-red-600 hover:bg-red-500 rounded-full w-8 h-8 flex items-center justify-center">
                  &#x2715;
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
