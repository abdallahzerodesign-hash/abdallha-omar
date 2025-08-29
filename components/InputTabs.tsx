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

const TabButton: React.FC<{
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, isActive, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`flex-1 py-3 px-4 text-center font-bold text-sm sm:text-base rounded-t-lg transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-500 ${
        isActive
          ? 'bg-gray-700 text-cyan-300'
          : 'bg-gray-800 text-gray-400 hover:bg-gray-700/50'
      }`}
      role="tab"
      aria-selected={isActive}
    >
      {label}
    </button>
  );
};

export const InputTabs: React.FC<InputTabsProps> = ({
  activeTab,
  setActiveTab,
  prompt,
  setPrompt,
  images,
  setImages,
  documentFile,
  setDocumentFile,
  disabled,
}) => {
  return (
    <div className="w-full">
      <div className="flex border-b border-gray-700" role="tablist" aria-label="Input method">
        <TabButton
          label="الوصف"
          isActive={activeTab === 'prompt'}
          onClick={() => setActiveTab('prompt')}
        />
        <TabButton
          label="تحريك الصور"
          isActive={activeTab === 'images'}
          onClick={() => setActiveTab('images')}
        />
        <TabButton
          label="تحليل مستند"
          isActive={activeTab === 'document'}
          onClick={() => setActiveTab('document')}
        />
      </div>
      <div className="bg-gray-700/50 rounded-b-lg p-6">
        {activeTab === 'prompt' && (
          <div role="tabpanel">
            <PromptInput
              value={prompt}
              onChange={setPrompt}
              disabled={disabled}
            />
          </div>
        )}
        {activeTab === 'images' && (
          <div role="tabpanel">
            <MultiImageUploader
              images={images}
              onImagesChange={setImages}
              disabled={disabled}
            />
          </div>
        )}
        {activeTab === 'document' && (
          <div role="tabpanel">
            <DocumentUploader
                file={documentFile}
                onFileChange={setDocumentFile}
                disabled={disabled}
            />
          </div>
        )}
      </div>
    </div>
  );
};
