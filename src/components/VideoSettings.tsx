import React, { useState } from 'react';

interface VideoSettingsProps {
  videoDuration: number;
  setVideoDuration: (duration: number) => void;
  isDirectorMode: boolean;
  setIsDirectorMode: (enabled: boolean) => void;
  disabled: boolean;
}

export const VideoSettings: React.FC<VideoSettingsProps> = ({
  videoDuration,
  setVideoDuration,
  isDirectorMode,
  setIsDirectorMode,
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
        <span>إعدادات الفيديو</span>
        <span className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>▼</span>
      </button>
      {isOpen && (
        <div className="p-4 border-t border-gray-700/50 space-y-4">
          {/* Video Duration */}
          <div>
            <label htmlFor="duration-slider" className="mb-2 block font-semibold text-gray-300">
              المدة المستهدفة: <span className="text-cyan-400">{videoDuration} ثوانٍ</span>
            </label>
            <input
              id="duration-slider"
              type="range"
              min="2"
              max="10"
              value={videoDuration}
              onChange={(e) => setVideoDuration(Number(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              disabled={disabled}
            />
          </div>

          {/* Director Mode */}
          <div className="flex items-center justify-between">
            <label htmlFor="director-mode" className="font-semibold text-gray-300">
              🎬 وضع المخرج
              <span className="block text-xs text-gray-500">يلخص السيناريو الطويل في لقطة واحدة متكاملة</span>
            </label>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                id="director-mode"
                checked={isDirectorMode}
                onChange={(e) => setIsDirectorMode(e.target.checked)}
                className="sr-only peer"
                disabled={disabled}
              />
              <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-focus:ring-2 peer-focus:ring-cyan-500 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
            </label>
          </div>
        </div>
      )}
    </div>
  );
};
