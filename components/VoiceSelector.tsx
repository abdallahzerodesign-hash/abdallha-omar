import React from 'react';

interface VoiceSelectorProps {
    voices: SpeechSynthesisVoice[];
    selectedVoiceURI: string;
    onVoiceChange: (uri: string) => void;
    disabled: boolean;
}

export const VoiceSelector: React.FC<VoiceSelectorProps> = ({ voices, selectedVoiceURI, onVoiceChange, disabled }) => {
    return (
        <div>
            <label htmlFor="voice-selector" className="mb-2 block font-semibold text-sm text-gray-300">
                اختر صوت الراوي
            </label>
            <select
                id="voice-selector"
                value={selectedVoiceURI}
                onChange={(e) => onVoiceChange(e.target.value)}
                disabled={disabled || voices.length === 0}
                className="w-full bg-gray-900/70 border-2 border-gray-600 rounded-md p-2 text-gray-200 focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {voices.length === 0 && <option>لا توجد أصوات عربية متاحة</option>}
                {voices.map(voice => (
                    <option key={voice.voiceURI} value={voice.voiceURI}>
                        {voice.name} ({voice.lang})
                    </option>
                ))}
            </select>
        </div>
    );
};
