import React, { useState } from 'react';

interface OverlaysProps {
    overlayText: string;
    setOverlayText: (text: string) => void;
    textPosition: string;
    setTextPosition: (position: string) => void;
    disabled: boolean;
}

const PositionSelector: React.FC<{
    label: string,
    positions: { value: string, label: string }[],
    currentValue: string,
    onSelect: (value: string) => void,
    disabled: boolean,
}> = ({ label, positions, currentValue, onSelect, disabled }) => (
    <div className="flex items-center justify-between">
        <label className="font-semibold text-sm text-gray-300">{label}</label>
        <div className="flex gap-1 bg-gray-900/50 border border-gray-700 p-1 rounded-md">
            {positions.map(pos => (
                <button
                    key={pos.value}
                    onClick={() => onSelect(pos.value)}
                    disabled={disabled}
                    className={`px-3 py-1 text-xs rounded transition-colors ${currentValue === pos.value ? 'bg-cyan-500 text-gray-900 font-bold' : 'hover:bg-gray-700'}`}
                >
                    {pos.label}
                </button>
            ))}
        </div>
    </div>
);

export const Overlays: React.FC<OverlaysProps> = ({
    overlayText, setOverlayText, textPosition, setTextPosition, disabled
}) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="bg-gray-800/60 border border-gray-700 rounded-lg animate-fade-in-slow">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center p-4 text-left font-bold text-gray-200"
                aria-expanded={isOpen}
            >
                <span>التراكبات والإضافات (نص)</span>
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
            </button>
            {isOpen && (
                <div className="p-4 border-t border-gray-700 space-y-4">
                    {/* Text Overlay */}
                    <div className="space-y-2">
                        <label htmlFor="overlay-text" className="font-semibold text-sm text-gray-300">النص (عنوان أو تعليق)</label>
                        <input
                            id="overlay-text"
                            type="text"
                            value={overlayText}
                            onChange={e => setOverlayText(e.target.value)}
                            placeholder="اكتب النص الذي سيظهر على الفيديو..."
                            disabled={disabled}
                            className="w-full bg-gray-900/70 border-2 border-gray-600 rounded-md p-2 text-gray-200 focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500"
                        />
                         <PositionSelector
                            label="موقع النص"
                            positions={[{value: 'top', label: 'أعلى'}, {value: 'middle', label: 'وسط'}, {value: 'bottom', label: 'أسفل'}]}
                            currentValue={textPosition}
                            onSelect={setTextPosition}
                            disabled={disabled}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};