import React, { useState, useEffect } from 'react';

interface VideoPlayerProps {
  src: string;
  onNewVideo: () => void;
  narration: string | null;
  selectedVoiceURI: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ src, onNewVideo, narration, selectedVoiceURI }) => {
  const [isNarrating, setIsNarrating] = useState(false);
  
  useEffect(() => {
    // Effect to cancel speech synthesis on component unmount
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleToggleNarration = () => {
    if (!narration || !('speechSynthesis' in window)) {
      return;
    }

    if (isNarrating) {
      window.speechSynthesis.cancel();
      setIsNarrating(false);
    } else {
      const utterance = new SpeechSynthesisUtterance(narration);
      
      const voices = window.speechSynthesis.getVoices();
      const selectedVoice = voices.find(voice => voice.voiceURI === selectedVoiceURI);

      if (selectedVoice) {
        utterance.voice = selectedVoice;
      } else {
        // Fallback if the selected voice isn't found
        utterance.lang = 'ar';
      }
      utterance.rate = 0.9; // Slightly slower for clarity

      utterance.onend = () => {
        setIsNarrating(false);
      };
      utterance.onerror = (event) => {
        console.error('SpeechSynthesis Error:', event.error);
        setIsNarrating(false);
      };
      
      window.speechSynthesis.cancel(); // Cancel any previous utterance
      window.speechSynthesis.speak(utterance);
      setIsNarrating(true);
    }
  };


  return (
    <div className="flex flex-col items-center space-y-6">
        <h2 className="text-2xl font-bold text-center text-cyan-300">الفيديو الخاص بك جاهز!</h2>
        <div className="w-full aspect-video rounded-lg overflow-hidden bg-black border-2 border-gray-700">
            <video src={src} controls autoPlay loop className="w-full h-full object-contain" />
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full">
            <a
                href={src}
                download={`ai_video_${Date.now()}.mp4`}
                className="flex-1 text-center bg-cyan-500 hover:bg-cyan-400 text-gray-900 font-bold py-3 px-6 rounded-lg transition-all duration-300"
            >
                تحميل الفيديو
            </a>
            {narration && 'speechSynthesis' in window && (
                 <button
                    onClick={handleToggleNarration}
                    className="flex-1 flex items-center justify-center gap-2 text-center bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300"
                >
                    {isNarrating ? (
                        <>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1zm4 0a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                            <span>إيقاف السرد</span>
                        </>
                    ) : (
                         <>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a6 6 0 00-6 6v3.586l-1.707 1.707A1 1 0 003 15v2a1 1 0 001 1h12a1 1 0 001-1v-2a1 1 0 00-.293-.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" /></svg>
                            <span>تشغيل السرد</span>
                        </>
                    )}
                </button>
            )}
            <button
                onClick={onNewVideo}
                className="flex-1 text-center bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300"
            >
                إنشاء فيديو جديد
            </button>
        </div>
    </div>
  );
};