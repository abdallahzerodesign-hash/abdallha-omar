import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { GeneratedClip } from '../types';

export const PreviewStudio: React.FC<{ clips: GeneratedClip[]; onExit: () => void; selectedVoiceURI: string; }> = ({ clips, onExit, selectedVoiceURI }) => {
    const [currentClipIndex, setCurrentClipIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);

    // Recording State
    const [isRecording, setIsRecording] = useState(false);
    const [finalVideoUrl, setFinalVideoUrl] = useState<string | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const recordedChunksRef = useRef<Blob[]>([]);

    const videoRef = useRef<HTMLVideoElement>(null);
    
    const playNextClip = useCallback(() => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
        if (currentClipIndex < clips.length - 1) {
            setCurrentClipIndex(prevIndex => prevIndex + 1);
        } else {
            setIsPlaying(false);
        }
    }, [clips.length, currentClipIndex]);

    useEffect(() => {
        const videoElement = videoRef.current;
        if (!videoElement || !isPlaying) return;

        const currentClip = clips[currentClipIndex];
        videoElement.src = currentClip.src;
        videoElement.play().catch(e => console.error("Error playing video:", e));

        if (currentClip.narration && 'speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(currentClip.narration);
            
            const voices = window.speechSynthesis.getVoices();
            const selectedVoice = voices.find(voice => voice.voiceURI === selectedVoiceURI);
            
            if (selectedVoice) {
                utterance.voice = selectedVoice;
            } else {
                utterance.lang = 'ar';
            }
            utterance.rate = 0.9;
            window.speechSynthesis.cancel(); // Cancel any previous utterance
            window.speechSynthesis.speak(utterance);
        }

        videoElement.onended = playNextClip;

        return () => {
            videoElement.onended = null;
        };

    }, [currentClipIndex, clips, playNextClip, isPlaying, selectedVoiceURI]);

    const handleStartPlayback = () => {
        setCurrentClipIndex(0);
        setIsPlaying(true);
    };
    
    const handleStartRecording = async () => {
        if (isRecording) return;
        setFinalVideoUrl(null);

        try {
            const stream = await navigator.mediaDevices.getDisplayMedia({ video: { mediaSource: "screen" } as any, audio: true });
            
            stream.getVideoTracks()[0].onended = handleStopRecording;

            mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'video/webm' });
            recordedChunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    recordedChunksRef.current.push(event.data);
                }
            };
            
            mediaRecorderRef.current.onstop = () => {
                const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
                const url = URL.createObjectURL(blob);
                setFinalVideoUrl(url);
                setIsRecording(false);
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
            handleStartPlayback();

        } catch (error) {
            console.error("Error starting screen recording:", error);
            if (error instanceof DOMException && error.name === 'NotAllowedError') {
                alert("فشل بدء التسجيل. يرجى التأكد من منح الإذن بمشاركة الشاشة والمحاولة مرة أخرى.");
            } else {
                alert(`حدث خطأ غير متوقع أثناء بدء التسجيل: ${error}`);
            }
        }
    };
    
    const handleStopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
        }
    };

    const handleShare = async () => {
        if (!finalVideoUrl) return;

        try {
            const response = await fetch(finalVideoUrl);
            const blob = await response.blob();
            const file = new File([blob], `assembled_video_${Date.now()}.webm`, { type: blob.type });

            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    files: [file],
                    title: 'فيديو تم إنشاؤه بالذكاء الاصطناعي',
                    text: 'شاهد هذا الفيديو الذي تم إنشاؤه باستخدام مولد الفيديو بالذكاء الاصطناعي.',
                });
            } else {
                alert('المشاركة غير مدعومة على هذا المتصفح أو لهذا النوع من الملفات.');
            }
        } catch (error) {
            if ((error as Error).name !== 'AbortError') {
                console.error('Error sharing:', error);
                alert(`فشلت المشاركة: ${error}`);
            }
        }
    };

    return (
        <div className="flex flex-col items-center space-y-6 animate-fade-in-slow">
            <h2 className="text-2xl font-bold text-center text-cyan-300">استوديو المعاينة والتجميع</h2>
            
            <div className="w-full aspect-video rounded-lg overflow-hidden bg-black border-2 border-gray-700 relative">
                <video ref={videoRef} className="w-full h-full object-contain" muted={isRecording} controls />
            </div>
            
            <div className="w-full p-4 bg-gray-800/60 border border-gray-700 rounded-lg flex flex-col items-center justify-center gap-4 min-h-[120px]">
                {!isRecording && !finalVideoUrl && (
                    <>
                        <p className="text-center text-gray-400 -mt-2 mb-2">شاهد معاينة لفيلمك، ثم قم بتسجيله للحصول على المنتج النهائي.</p>
                        <button onClick={handleStartRecording} className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white font-bold py-3 px-6 rounded-lg transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10" /></svg>
                            <span>بدء التسجيل</span>
                        </button>
                    </>
                )}
                {isRecording && (
                     <>
                        <p className="text-center text-gray-400 -mt-2 mb-2">جاري تسجيل فيلمك الآن...</p>
                        <button onClick={handleStopRecording} className="flex items-center gap-2 bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 px-6 rounded-lg transition-colors animate-pulse">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /></svg>
                            <span>إيقاف التسجيل</span>
                        </button>
                    </>
                )}
                 {finalVideoUrl && (
                    <div className="text-center">
                        <h3 className="text-lg font-bold text-green-400">المنتج النهائي جاهز!</h3>
                        <div className="flex flex-col sm:flex-row gap-4 mt-4">
                            <a href={finalVideoUrl} download={`assembled_video_${Date.now()}.webm`} className="flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-gray-900 font-bold py-3 px-6 rounded-lg transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                <span>تحميل الفيديو المجمع</span>
                            </a>
                             {navigator.share && (
                                <button onClick={handleShare} className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-6 rounded-lg transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" /></svg>
                                    <span>مشاركة</span>
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
             <p className="text-xs text-gray-500 text-center max-w-md">عند بدء التسجيل، اختر هذا التبويب وتأكد من تفعيل "مشاركة صوت التبويب" للحصول على أفضل النتائج.</p>

            <button onClick={onExit} className="mt-4 bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg transition-colors">
                العودة
            </button>
        </div>
    );
};