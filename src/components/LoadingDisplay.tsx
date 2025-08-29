import React from 'react';

interface LoadingDisplayProps {
  message: string;
  progress?: number;
  total?: number;
}

const LoadingSpinner: React.FC = () => (
  <svg className="animate-spin h-10 w-10 text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

export const LoadingDisplay: React.FC<LoadingDisplayProps> = ({ message, progress, total }) => {
  const showProgress = typeof progress === 'number' && typeof total === 'number' && total > 0;
  const percentage = showProgress ? Math.round((progress / total) * 100) : 0;

  return (
    <div className="flex flex-col items-center justify-center text-center p-8 min-h-[400px]">
      <LoadingSpinner />
      <h2 className="text-2xl font-bold mt-6 text-cyan-300">جارٍ الإنشاء...</h2>
      <p className="text-gray-400 mt-2 text-lg">{message}</p>
      {showProgress && (
        <div className="w-full max-w-md mt-6">
          <div className="flex justify-between mb-1">
            <span className="text-base font-medium text-cyan-400">التقدم</span>
            <span className="text-sm font-medium text-cyan-400">{progress} / {total}</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2.5">
            <div className="bg-cyan-500 h-2.5 rounded-full" style={{ width: `${percentage}%` }}></div>
          </div>
           <p className="text-gray-400 mt-2 text-sm">جاري إنتاج اللقطة {progress} من {total}...</p>
        </div>
      )}
    </div>
  );
};
