import React, { useState } from 'react';
import { VoiceSelector } from './VoiceSelector';

interface AudioSettingsProps {
    availableVoices: SpeechSynthesisVoice[];
    selectedVoiceURI: string;
    onVoiceChange: (uri: string) => void;
    disabled: boolean;
}

export const AudioSettings: React.FC<AudioSettingsProps> = ({
    availableVoices,
    selectedVoiceURI,
    onVoiceChange,
    disabled
}) => {
    const [isOpen, setIsOpen] = useState(false);

    if (availableVoices.length === 0) {
        return null; // Don't show settings if no voices are available
    }

    return (
         <div className="bg-gray-800/60 border border-gray-700 rounded-lg animate-fade-in-slow">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center p-4 text-left font-bold text-gray-200"
                aria-expanded={isOpen}
            >
                <span>إعدادات الصوت (الراوي)</span>
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
            </button>
            {isOpen && (
                <div className="p-4 border-t border-gray-700 space-y-4">
                    <VoiceSelector
                        voices={availableVoices}
                        selectedVoiceURI={selectedVoiceURI}
                        onVoiceChange={onVoiceChange}
                        disabled={disabled}
                    />
                </div>
            )}
        </div>
    );
};
