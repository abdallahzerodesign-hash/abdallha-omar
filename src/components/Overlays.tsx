import React, { useState } from 'react';

interface OverlaysProps {
  overlayText: string;
  setOverlayText: (text: string) => void;
  textPosition: string;
  setTextPosition: (position: string) => void;
  disabled: boolean;
}

export const Overlays: React.FC<OverlaysProps> = ({
  overlayText,
  setOverlayText,
  textPosition,
  setTextPosition,
  disabled,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-gray-900/50 rounded-lg border border-gray-700/50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center p-3 text-left font-semibold"
        disabled={disabled}
      >
        <span>التراكبات والإضافات (نص)</span>
        <span className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>▼</span>
      </button>
      {isOpen && (
        <div className="p-4 border-t border-gray-700/50 space-y-4">
          {/* Text Overlay */}
          <div>
            <label htmlFor="overlay-text" className="mb-2 block font-semibold text-gray-300">
              النص (عنوان أو تعليق)
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                id="overlay-text"
                type="text"
                value={overlayText}
                onChange={(e) => setOverlayText(e.target.value)}
                placeholder="اكتب النص الذي سيظهر على الفيديو..."
                className="flex-grow bg-gray-800 border-2 border-gray-600 rounded-lg p-2 text-gray-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                disabled={disabled}
              />
              <select
                value={textPosition}
                onChange={(e) => setTextPosition(e.target.value)}
                className="bg-gray-800 border-2 border-gray-600 rounded-lg p-2 text-gray-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                disabled={disabled}
              >
                <option value="bottom">أسفل</option>
                <option value="middle">وسط</option>
                <option value="top">أعلى</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
