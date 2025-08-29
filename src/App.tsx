import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { VideoPlayer } from './components/VideoPlayer';
import { LoadingDisplay } from './components/LoadingDisplay';
import { SplashScreen } from './components/SplashScreen';
import { generateVideo, generateScriptFromIdea, generateScriptFromDocument, summarizeScriptForVideo, extractShotsFromScript, generateNarrationFromPrompt, createStoryboardFromImages } from './services/geminiService';
import type { UploadedFile, Shot, GeneratedClip } from './types';
import { InputTabs } from './components/InputTabs';
import { Overlays } from './components/Overlays';
import { VideoSettings } from './components/VideoSettings';
import { ShotSelector } from './components/ShotSelector';
import { QueueResultDisplay } from './components/QueueResultDisplay';
import { PreviewStudio } from './components/PreviewStudio';
import { AudioSettings } from './components/AudioSettings';

type InputTab = 'prompt' | 'images' | 'document';

const App: React.FC = () => {
  const [splashVisible, setSplashVisible] = useState<boolean>(true);
  const [splashExiting, setSplashExiting] = useState<boolean>(false);
  
  // Input management state
  const [activeTab, setActiveTab] = useState<InputTab>('prompt');
  const [prompt, setPrompt] = useState<string>('');
  const [images, setImages] = useState<UploadedFile[]>([]);
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [extractedShots, setExtractedShots] = useState<Shot[]>([]);
  const [selectedShots, setSelectedShots] = useState<number[]>([]);

  // Advanced Controls State
  const [overlayText, setOverlayText] = useState<string>('');
  const [textPosition, setTextPosition] = useState<string>('bottom');
  const [videoDuration, setVideoDuration] = useState<number>(5);
  const [isDirectorMode, setIsDirectorMode] = useState<boolean>(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string>('');

  // Loading and Error State
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isExpanding, setIsExpanding] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [isAnalyzingImages, setIsAnalyzingImages] = useState<boolean>(false);
  const [isExtractingShots, setIsExtractingShots] = useState<boolean>(false);
  const [isGeneratingQueue, setIsGeneratingQueue] = useState<boolean>(false);
  const [queueProgress, setQueueProgress] = useState<{ current: number; total: number }>({ current: 0, total: 0 });
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [narration, setNarration] = useState<string | null>(null);
  const [generatedClips, setGeneratedClips] = useState<GeneratedClip[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Preview Mode
  const [isPreviewMode, setIsPreviewMode] = useState<boolean>(false);

  const loadingMessages = [
    "جارٍ تهيئة المشهد...",
    "تحليل الطلب والإعداد للإنشاء...",
    "يتم الآن تصيير الإطارات الأولية...",
    "بناء تسلسل الفيديو...",
    "تطبيق التحسينات البصرية...",
    "إضافة اللمسات النهائية...",
    "شارفنا على الانتهاء، لحظات قليلة!",
  ];

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isLoading || isGeneratingQueue) {
      setLoadingMessage(loadingMessages[0]);
      let messageIndex = 1;
      interval = setInterval(() => {
        setLoadingMessage(loadingMessages[messageIndex % loadingMessages.length]);
        messageIndex++;
      }, 5000);
    }
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, isGeneratingQueue]);
  
  useEffect(() => {
    const loadVoices = () => {
      const allVoices = window.speechSynthesis.getVoices();
      const arabicVoices = allVoices.filter(voice => voice.lang.toLowerCase().startsWith('ar-'));
      setAvailableVoices(arabicVoices);
      if (arabicVoices.length > 0 && !selectedVoiceURI) {
        setSelectedVoiceURI(arabicVoices[0].voiceURI);
      }
    };

    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, [selectedVoiceURI]);

  const resetInputs = useCallback(() => {
    setGeneratedVideoUrl(null);
    setNarration(null);
    setPrompt('');
    setImages([]);
    setDocumentFile(null);
    setError(null);
    setOverlayText('');
    setTextPosition('bottom');
    setVideoDuration(5);
    setIsDirectorMode(false);
    setExtractedShots([]);
    setSelectedShots([]);
    setGeneratedClips([]);
    setIsPreviewMode(false);
    if (availableVoices.length > 0) {
        setSelectedVoiceURI(availableVoices[0].voiceURI);
    }
  }, [availableVoices]);

  const handleExpandScriptClick = useCallback(async () => {
    if (!prompt) return;
    setIsExpanding(true);
    setError(null);
    try {
        const script = await generateScriptFromIdea(prompt);
        setPrompt(script);
        setExtractedShots([]);
        setSelectedShots([]);
    } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : 'حدث خطأ أثناء إنشاء السيناريو.');
    } finally {
        setIsExpanding(false);
    }
  }, [prompt]);

  const handleDocumentAnalysis = useCallback(async () => {
    if (!documentFile) return;
    setIsAnalyzing(true);
    setError(null);
    try {
        const script = await generateScriptFromDocument(documentFile);
        setPrompt(script);
        setActiveTab('prompt');
        setDocumentFile(null);
        setExtractedShots([]);
        setSelectedShots([]);
    } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : 'حدث خطأ أثناء تحليل المستند.');
    } finally {
        setIsAnalyzing(false);
    }
  }, [documentFile]);

  const handleAnalyzeImages = useCallback(async () => {
    if (images.length === 0) return;
    setIsAnalyzingImages(true);
    setError(null);
    try {
      const shots = await createStoryboardFromImages(images);
      setExtractedShots(shots);
      setActiveTab('prompt');
      setImages([]);
      setPrompt('');
      setSelectedShots([]);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'حدث خطأ أثناء تحليل الصور.');
    } finally {
      setIsAnalyzingImages(false);
    }
  