import React, { useRef, useState } from 'react';

interface DocumentUploaderProps {
  onFileChange: (file: File | null) => void;
  file: File | null;
  disabled: boolean;
}

export const DocumentUploader: React.FC<DocumentUploaderProps> = ({ onFileChange, file, disabled }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (selectedFile: File | null) => {
    if (selectedFile) {
      onFileChange(selectedFile);
    }
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
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const clearFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFileChange(null);
    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };
  
  return (
    <div 
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => !file && fileInputRef.current?.click()}
      className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg transition-colors duration-300 ${
          isDragging ? 'border-cyan-400 bg-gray-700/50' : 'border-gray-600'
      } ${!file ? 'cursor-pointer hover:border-cyan-500 hover:bg-gray-800/50' : ''}`}
    >
      <input 
        type="file" 
        accept=".pdf,.doc,.docx,.ppt,.pptx"
        ref={fileInputRef} 
        onChange={(e) => handleFileChange(e.target.files ? e.target.files[0] : null)}
        className="hidden"
        disabled={disabled}
      />
      {file ? (
        <div className="text-center">
            <p className="font-semibold text-cyan-400">الملف المحدد:</p>
            <p className="text-gray-300 truncate max-w-xs">{file.name}</p>
            <button onClick={clearFile} disabled={disabled} className="mt-2 text-sm text-red-400 hover:text-red-300">إزالة</button>
        </div>
      ) : (
        <div className="text-center">
            <p className="text-gray-400">اسحب وأفلت مستندًا هنا، أو انقر للاختيار</p>
            <p className="text-xs text-gray-500 mt-1">يدعم PDF, Word, PowerPoint</p>
        </div>
      )}
    </div>
  );
};
