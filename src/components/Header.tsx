import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="w-full max-w-4xl mx-auto text-center mb-8">
      <h1 className="text-4xl sm:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500 pb-2">
        مولد الفيديو بالذكاء الاصطناعي
      </h1>
      <p className="text-lg text-gray-400">حوّل أفكارك إلى فيديوهات مذهلة</p>
    </header>
  );
};