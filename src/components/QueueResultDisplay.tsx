import React from 'react';
import type { GeneratedClip } from '../types';

interface QueueResultDisplayProps {
  clips: GeneratedClip[];
  onStartOver: () => void;
  onPreview: () => void;
}

export const QueueResultDisplay: React.FC<QueueResultDisplayProps> = ({ clips, onStartOver, onPreview }) => {
    
  const handleDownload = (clip: GeneratedClip) => {
    const link = document.createElement('a');
    link.href = clip.src;
    link.download = clip.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full animate-fade-in-slow">
      <h2 className="text-2xl font-bold text-center mb-4 text-cyan-300">اكتمل الإنتاج!</h2>
      <p className="text-center text-gray-400 mb-6">لقطاتك جاهزة للمعاينة والتحميل.</p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {clips.map((clip, index) => (
          <div key={index} className="bg-gray-800/50 rounded-lg overflow-hidden border border-gray-700">
            <div className="aspect-video bg-black">
                <video src={clip.src} controls loop className="w-full h-full object-contain" />
            </div>
            <div className="p-4">
              <p className="font-semibold text-gray-300">{clip.name}</p>
              <button
                onClick={() => handleDownload(clip)}
                className="w-full mt-2 bg-gray-600 hover:bg-gray-500 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-300"
              >
                تحميل
              </button>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-8 flex flex-col sm:flex-row gap-4">
         <button
            onClick={onPreview}
            className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-gray-900 font-bold py-3 px-6 rounded-lg transition-colors duration-300"
        >
            معاينة وتجميع اللقطات
        </button>
        <button
            onClick={onStartOver}
            className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-300"
        >
            مشروع جديد
        </button>
      </div>
    </div>
  );
};
