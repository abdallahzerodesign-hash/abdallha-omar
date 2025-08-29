import React, { useEffect, useState, useRef } from 'react';

interface VideoPlayerProps {
  src: string;
  onNewVideo: () => void;
  narration: string | null;
  selectedVoiceURI: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ src, onNewVideo, narration, selectedVoiceURI }) => {
  const [isNarrating, setIsNarrating] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    // Cleanup function to stop any ongoing speech when the component unmounts or src changes
    return () => {
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
    };
  }, [src]);

  const handleToggleNarration = () => {
    if (isNarrating) {
      window.speechSynthesis.cancel();
      setIsNarrating(false);
    } else if (narration) {
      const allVoices = window.speechSynthesis.getVoices();
      const selectedVoice = allVoices.find(v => v.voiceURI === selectedVoiceURI);

      const utterance = new SpeechSynthesisUtterance(narration);
      utterance.lang = selectedVoice?.lang || 'ar-SA';
      if (selectedVoice) {
          utterance.voice = selectedVoice;
      }

      utterance.onend = () => setIsNarrating(false);
      utterance.onerror = (e) => {
        console.error("Speech synthesis error", e);
        setIsNarrating(false);
      };
      
      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
      setIsNarrating(true);
    }
  };
  
  return (
    <div className="w-full animate-fade-in-slow">
      <h2 className="text-2xl font-bold text-center mb-4 text-cyan-300">الفيديو جاهز!</h2>
      <div className="aspect-video bg-black rounded-lg overflow-hidden shadow-lg border-2 border-cyan-500/50">
        <video src={src} controls autoPlay loop className="w-full h-full" />
      </div>
      <div className="mt-6 flex flex-col sm:flex-row gap-4">
        {narration && (
          <button
            onClick={handleToggleNarration}
            className="flex-1 bg-teal-600 hover:bg-teal-500 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-300 flex items-center justify-center gap-2"
          >
            {isNarrating ? '🔇 إيقاف السرد' : '🔊 تشغيل السرد'}
          </button>
        )}
        <button
          onClick={onNewVideo}
          className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-gray-900 font-bold py-3 px-6 rounded-lg transition-colors duration-300"
        >
          إنشاء فيديو جديد
        </button>
      </div>
    </div>
  );
};
