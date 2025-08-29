import React, { useState, useEffect, useRef } from 'react';
import type { GeneratedClip } from '../types';

interface PreviewStudioProps {
  clips: GeneratedClip[];
  onExit: () => void;
  selectedVoiceURI: string;
}

export const PreviewStudio: React.FC<PreviewStudioProps> = ({ clips, onExit, selectedVoiceURI }) => {
  const [currentClipIndex, setCurrentClipIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  const currentClip = clips[currentClipIndex];

  useEffect(() => {
    const videoElement = videoRef.current;
    if (videoElement) {
      videoElement.src = currentClip.src;
      if(isPlaying) {
         videoElement.play().catch(console.error);
      }
    }
  }, [currentClip, isPlaying]);

  useEffect(() => {
    if (currentClip?.narration) {
      const allVoices = window.speechSynthesis.getVoices();
      const selectedVoice = allVoices.find(v => v.voiceURI === selectedVoiceURI);
      const utterance = new SpeechSynthesisUtterance(currentClip.narration);
      utterance.lang = selectedVoice?.lang || 'ar-SA';
      if (selectedVoice) utterance.voice = selectedVoice;
      window.speechSynthesis.cancel();
      if (isPlaying) {
        window.speechSynthesis.speak(utterance);
      }
    }
    return () => window.speechSynthesis.cancel();
  }, [currentClip, selectedVoiceURI, isPlaying]);

  const handleVideoEnded = () => {
    if (currentClipIndex < clips.length - 1) {
      setCurrentClipIndex(prev => prev + 1);
    } else {
      setIsPlaying(false); // Stop at the end
    }
  };

  const startRecording = async () => {
    try {
      setError(null);
      const mediaStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });

      const options = { mimeType: 'video/webm; codecs=vp9' };
      const recorder = new MediaRecorder(mediaStream, options);
      mediaRecorderRef.current = recorder;
      recordedChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        setRecordedBlob(blob);
      };

      recorder.start();
      setIsRecording(true);
      setCurrentClipIndex(0); // Restart playback for recording
      setIsPlaying(true);

    } catch (err) {
      console.error("Error starting screen recording:", err);
      setError("فشل بدء التسجيل. يرجى منح الإذن والمحاولة مرة أخرى.");
      setIsRecording(false);
    }
  };
  
  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };
  
  const downloadRecordedVideo = () => {
    if (recordedBlob) {
      const url = URL.createObjectURL(recordedBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'video_montage.webm';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }
  };
  
  const shareVideo = async () => {
    if (recordedBlob) {
        const file = new File([recordedBlob], 'video_montage.webm', { type: 'video/webm' });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
            try {
                await navigator.share({
                    files: [file],
                    title: 'فيديو مجمع',
                    text: 'شاهد الفيديو الذي قمت بإنشائه!',
                });
            } catch (err) {
                console.error('Error sharing file:', err);
                setError("حدث خطأ أثناء محاولة المشاركة.");
            }
        } else {
           setError("المشاركة غير مدعومة على هذا المتصفح أو الجهاز.");
        }
    }
  };


  return (
    <div className="w-full animate-fade-in-slow">
      <h2 className="text-2xl font-bold text-center mb-4 text-cyan-300">استوديو المعاينة والمونتاج</h2>
      <div className="aspect-video bg-black rounded-lg overflow-hidden shadow-lg border-2 border-cyan-500/50">
        <video ref={videoRef} onEnded={handleVideoEnded} onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} controls className="w-full h-full" />
      </div>
      
      {/* Filmstrip */}
      <div className="flex gap-2 mt-4 overflow-x-auto p-2 bg-gray-900/50 rounded-lg">
        {clips.map((clip, index) => (
          <div key={index} onClick={() => setCurrentClipIndex(index)} className={`w-24 h-14 flex-shrink-0 cursor-pointer rounded-md overflow-hidden border-2 ${index === currentClipIndex ? 'border-cyan-400' : 'border-transparent'}`}>
            <video src={clip.src} className="w-full h-full object-cover" />
          </div>
        ))}
      </div>

      {error && (
        <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg text-center mt-4">
          <p>{error}</p>
        </div>
      )}

      {/* Controls */}
      <div className="mt-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
        {!recordedBlob ? (
          <div className="flex flex-col sm:flex-row gap-4">
            <button onClick={startRecording} disabled={isRecording} className="flex-1 bg-green-600 hover:bg-green-500 disabled:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg">
              {isRecording ? '🔴 جاري التسجيل...' : 'بدء تسجيل الشاشة'}
            </button>
            <button onClick={stopRecording} disabled={!isRecording} className="flex-1 bg-red-600 hover:bg-red-500 disabled:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg">
              إيقاف التسجيل
            </button>
          </div>
        ) : (
          <div className="text-center">
            <h3 className="text-lg font-bold text-green-400">المنتج النهائي جاهز!</h3>
            <div className="mt-4 flex flex-col sm:flex-row gap-4">
                <button onClick={downloadRecordedVideo} className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-gray-900 font-bold py-3 px-6 rounded-lg">
                    تحميل الفيديو المجمع
                </button>
                <button onClick={shareVideo} className="flex-1 bg-purple-600 hover:bg-purple-500 text-white font-semibold py-3 px-6 rounded-lg">
                    مشاركة
                </button>
            </div>
          </div>
        )}
      </div>

      <button onClick={onExit} className="w-full mt-4 bg-gray-600 hover:bg-gray-500 text-white font-semibold py-2 px-4 rounded-lg">
        العودة
      </button>
    </div>
  );
};
