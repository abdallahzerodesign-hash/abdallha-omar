import React from 'react';
import { PromptInput } from './PromptInput';
import { MultiImageUploader } from './MultiImageUploader';
import { DocumentUploader } from './DocumentUploader';
import type { UploadedFile } from '../types';

type InputTab = 'prompt' | 'images' | 'document';

interface InputTabsProps {
  activeTab: InputTab;
  setActiveTab: (tab: InputTab) => void;
  prompt: string;
  setPrompt: (prompt: string) => void;
  images: UploadedFile[];
  setImages: (images: UploadedFile[]) => void;
  documentFile: File | null;
  setDocumentFile: (file: File | null) => void;
  disabled: boolean;
}

export const InputTabs: React.FC<InputTabsProps> = ({
  activeTab,
  setActiveTab,
  prompt,
  setPrompt,
  images,
  setImages,
  documentFile,
  setDocumentFile,
  disabled
}) => {
  const TabButton: React.FC<{ tabName: InputTab; label: string }> = ({ tabName, label }) => (
    <button
      onClick={() => setActiveTab(tabName)}
      disabled={disabled}
      className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors duration-300 ${
        activeTab === tabName
          ? 'bg-cyan-500 text-gray-900'
          : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div>
      <div className="flex justify-center gap-2 mb-4">
        <TabButton tabName="prompt" label="الوصف" />
        <TabButton tabName="images" label="تحريك الصور" />
        <TabButton tabName="document" label="تحليل مستند" />
      </div>
      <div className="min-h-[250px] p-4 bg-gray-900/50 rounded-lg border border-gray-700/50">
        {activeTab === 'prompt' && <PromptInput value={prompt} onChange={setPrompt} disabled={disabled} />}
        {activeTab === 'images' && <MultiImageUploader images={images} onImagesChange={setImages} disabled={disabled} />}
        {activeTab === 'document' && <DocumentUploader onFileChange={setDocumentFile} file={documentFile} disabled={disabled} />}
      </div>
    </div>
  );
};
