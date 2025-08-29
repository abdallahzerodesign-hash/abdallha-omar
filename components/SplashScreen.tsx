import React from 'react';

interface SplashScreenProps {
  onEnter: () => void;
  isExiting: boolean;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onEnter, isExiting }) => {
  return (
    <div
      className={`fixed inset-0 bg-gray-900 flex flex-col items-center justify-center text-center p-4 z-50 transition-opacity duration-700 ease-in-out ${isExiting ? 'opacity-0' : 'opacity-100'}`}
      aria-modal="true"
      role="dialog"
    >
      <div className="animate-fade-in-slow">
        <h1 className="text-5xl md:text-6xl font-black bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500 pb-4 leading-tight text-center">
          مولد الفيديو بالذكاء الاصطناعي
        </h1>
        <p className="mt-4 text-2xl md:text-3xl text-gray-300 tracking-wider font-light">
          نبني واحة من الجمال
        </p>
        <blockquote className="mt-8 text-lg text-gray-400 font-serif max-w-2xl mx-auto">
          <p>"وَإِذَا سَأَلَكَ عِبَادِي عَنِّي فَإِنِّي قَرِيبٌ ۖ أُجِيبُ دَعْوَةَ الدَّاعِ إِذَا دَعَانِ ۖ فَلْيَسْتَجِيبُوا لِي وَلْيُؤْمِنُوا بِي لَعَلَّهُمْ يَرْشُدُونَ"</p>
          <p className="mt-4">"قدر الله وما شاء فعل"</p>
        </blockquote>
        <button
          onClick={onEnter}
          className="mt-12 bg-cyan-500 hover:bg-cyan-400 text-gray-900 font-bold py-3 px-10 rounded-lg text-xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-cyan-300/50"
          aria-label="الدخول إلى التطبيق"
        >
          اكتشف الحلم
        </button>
      </div>
    </div>
  );
};