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
            <label htmlFor="voice-selector" className="mb-2 block font-semibold text-gray-300">
                اختر صوت الراوي
            </label>
            <select
                id="voice-selector"
                value={selectedVoiceURI}
                onChange={(e) => onVoiceChange(e.target.value)}
                disabled={disabled || voices.length === 0}
                className="w-full bg-gray-800 border-2 border-gray-600 rounded-lg p-2 text-gray-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
            >
                {voices.length > 0 ? (
                    voices.map(voice => (
                        <option key={voice.voiceURI} value={voice.voiceURI}>
                            {voice.name} ({voice.lang})
                        </option>
                    ))
                ) : (
                    <option value="">لا توجد أصوات عربية متاحة</option>
                )}
            </select>
        </div>
    );
};
