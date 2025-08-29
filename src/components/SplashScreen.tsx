import React from 'react';

interface SplashScreenProps {
  onEnter: () => void;
  isExiting: boolean;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onEnter, isExiting }) => {
  const exitClass = isExiting ? 'opacity-0 scale-95' : 'opacity-100 scale-100';

  return (
    <div className={`fixed inset-0 bg-gray-900 z-50 flex flex-col items-center justify-center transition-all duration-700 ease-in-out ${exitClass}`}>
      <div className="text-center animate-fade-in-slow">
        <div className="text-6xl mb-4">🎬</div>
        <h1 className="text-4xl sm:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500 pb-2">
          مولد الفيديو بالذكاء الاصطناعي
        </h1>
        <p className="text-lg text-gray-400 mt-2">حوّل أفكارك إلى فيديوهات مذهلة</p>
        <button 
          onClick={onEnter}
          className="mt-12 bg-cyan-500 hover:bg-cyan-400 text-gray-900 font-bold py-3 px-8 rounded-lg text-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-cyan-300/50"
        >
          ابدأ الآن
        </button>
      </div>
    </div>
  );
};
