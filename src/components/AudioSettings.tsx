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

  return (
    <div className="bg-gray-900/50 rounded-lg border border-gray-700/50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center p-3 text-left font-semibold"
        disabled={disabled}
      >
        <span>إعدادات الصوت</span>
        <span className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>▼</span>
      </button>
      {isOpen && (
        <div className="p-4 border-t border-gray-700/50">
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
