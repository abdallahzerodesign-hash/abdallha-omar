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
    disabled
}) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
         <div className="bg-gray-800/60 border border-gray-700 rounded-lg animate-fade-in-slow">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center p-4 text-left font-bold text-gray-200"
                aria-expanded={isOpen}
            >
                <span>إعدادات الفيديو (المدة ووضع المخرج)</span>
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
            </button>
            {isOpen && (
                <div className="p-4 border-t border-gray-700 space-y-4">
                    {/* Video Duration */}
                    <div>
                        <label htmlFor="video-duration" className="mb-2 block font-semibold text-sm text-gray-300">
                            المدة المستهدفة: <span className="text-cyan-400 font-bold">{videoDuration} ثوانٍ</span>
                        </label>
                        <input
                            id="video-duration"
                            type="range"
                            min="2"
                            max="10"
                            step="1"
                            value={videoDuration}
                            onChange={(e) => setVideoDuration(Number(e.target.value))}
                            disabled={disabled}
                            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500 disabled:opacity-50"
                        />
                    </div>

                    {/* Director Mode */}
                    <div className="flex items-center justify-between">
                        <div>
                             <label htmlFor="director-mode" className="font-semibold text-sm text-gray-300">
                                🎬 وضع المخرج
                            </label>
                             <p className="text-xs text-gray-500">يلخص السيناريو الطويل في رؤية واحدة مركزة.</p>
                        </div>
                        <label htmlFor="director-mode" className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                id="director-mode"
                                checked={isDirectorMode}
                                onChange={(e) => setIsDirectorMode(e.target.checked)}
                                disabled={disabled}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-focus:ring-2 peer-focus:ring-cyan-500 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
                        </label>
                    </div>
                </div>
            )}
        </div>
    );
};
