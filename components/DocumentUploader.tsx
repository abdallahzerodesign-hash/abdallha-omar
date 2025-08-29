import React, { useRef } from 'react';

interface DocumentUploaderProps {
    file: File | null;
    onFileChange: (file: File | null) => void;
    disabled: boolean;
}

export const DocumentUploader: React.FC<DocumentUploaderProps> = ({ file, onFileChange, disabled }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        onFileChange(selectedFile || null);
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <p className="text-gray-400">
                قم بتحميل ملف (PDF, Word, PPT)، وسيقوم الذكاء الاصطناعي بتحليله وإنشاء سيناريو فيديو يلخص محتواه.
            </p>
            <div className="w-full max-w-md bg-gray-900/70 border-2 border-dashed border-gray-600 rounded-lg p-8 transition-colors duration-300">
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.ppt,.pptx"
                    disabled={disabled}
                />
                {file ? (
                     <div className="flex items-center justify-between text-left">
                        <div className="flex items-center space-x-3 rtl:space-x-reverse min-w-0">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-cyan-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span className="text-gray-300 truncate" title={file.name}>{file.name}</span>
                        </div>
                        <button
                            onClick={() => onFileChange(null)}
                            disabled={disabled}
                            className="text-gray-500 hover:text-white flex-shrink-0 ml-2"
                            aria-label="Remove file"
                        >
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={handleUploadClick}
                        disabled={disabled}
                        className="bg-cyan-600/50 text-cyan-300 hover:bg-cyan-600/80 font-semibold transition-colors py-2 px-4 rounded-md disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        اختر ملفًا
                    </button>
                )}
            </div>
        </div>
    );
};
