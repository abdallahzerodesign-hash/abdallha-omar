import React from 'react';
import type { GeneratedClip } from '../types';

interface QueueResultDisplayProps {
  clips: GeneratedClip[];
  onStartOver: () => void;
  onPreview: () => void;
}

export const QueueResultDisplay: React.FC<QueueResultDisplayProps> = ({ clips, onStartOver, onPreview }) => {
  return (
    <div className="flex flex-col items-center space-y-6 animate-fade-in-slow">
      <h2 className="text-2xl font-bold text-center text-cyan-300">اكتمل إنتاج الطابور!</h2>
      <p className="text-center text-gray-400">
        تم إنشاء {clips.length} مقطع فيديو بنجاح. يمكنك الآن معاينتها وتجميعها في فيديو واحد.
      </p>
      
      <div className="w-full flex flex-col sm:flex-row gap-4">
        <button
          onClick={onPreview}
          className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-gray-900 font-bold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105"
        >
          🎬 معاينة وتجميع اللقطات
        </button>
        <button
          onClick={onStartOver}
          className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-8 rounded-lg transition-all duration-300"
        >
          البدء من جديد
        </button>
      </div>

      <div className="w-full border-t border-gray-700 pt-6">
        <h3 className="text-lg font-semibold text-center text-gray-300 mb-4">أو قم بتحميل اللقطات بشكل فردي</h3>
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-6">
          {clips.map((clip, index) => (
            <div key={index} className="space-y-3">
              <h3 className="font-semibold text-gray-300 text-center">اللقطة #{index + 1}</h3>
              <div className="w-full aspect-video rounded-lg overflow-hidden bg-black border-2 border-gray-700">
                <video src={clip.src} controls loop className="w-full h-full object-contain" />
              </div>
              <a
                href={clip.src}
                download={clip.name}
                className="w-full block text-center bg-gray-800 hover:bg-gray-700 text-cyan-300 font-bold py-2 px-4 rounded-lg transition-colors duration-300"
              >
                تحميل
              </a>
            </div>
          ))}
        </div>
      </div>
      
    </div>
  );
};