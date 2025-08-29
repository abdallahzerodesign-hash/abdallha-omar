import React from 'react';

const LoadingSpinner: React.FC = () => (
  <svg className="animate-spin -ml-1 mr-3 h-10 w-10 text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

interface LoadingDisplayProps {
  message: string;
  progress?: number;
  total?: number;
}

export const LoadingDisplay: React.FC<LoadingDisplayProps> = ({ message, progress, total }) => {
  const title = total && progress ? `جاري إنتاج اللقطة ${progress} من ${total}...` : "جاري إنشاء تحفتك الفنية";
  
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 min-h-[300px]">
      <LoadingSpinner />
      <h3 className="text-2xl font-bold mt-6 text-cyan-300">{title}</h3>
      <p className="text-gray-400 mt-2 max-w-sm">{message}</p>
      {total && (
        <div className="w-full bg-gray-700 rounded-full h-2.5 mt-4">
          <div className="bg-cyan-500 h-2.5 rounded-full" style={{ width: `${(progress! / total) * 100}%` }}></div>
        </div>
      )}
      <p className="text-sm text-gray-500 mt-4">قد تستغرق هذه العملية عدة دقائق. شكرًا لصبرك!</p>
    </div>
  );
};