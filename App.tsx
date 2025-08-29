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
  }, [images]);

  const handleExtractShots = useCallback(async () => {
    if (!prompt) return;
    setIsExtractingShots(true);
    setError(null);
    try {
        const shots = await extractShotsFromScript(prompt);
        setExtractedShots(shots);
        setSelectedShots([]);
    } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : 'حدث خطأ أثناء تحليل السيناريو.');
    } finally {
        setIsExtractingShots(false);
    }
  }, [prompt]);
  
  const handleUpdateShot = useCallback((shotId: number, updates: Partial<Pick<Shot, 'cameraMotion' | 'motionAmount'>>) => {
    setExtractedShots(prevShots =>
        prevShots.map(shot =>
            shot.id === shotId ? { ...shot, ...updates } : shot
        )
    );
  }, []);

  const buildPromptAugmentations = async (shot?: Shot) => {
    const augmentations = [];
    
    // Use per-shot settings if available, otherwise use global settings for single generation
    const motion = shot?.cameraMotion;
    const amount = shot?.motionAmount;

    if (motion && motion !== 'none') {
        const motionMap: { [key: string]: string } = { 'zoom-in': 'تكبير للداخل', 'zoom-out': 'تكبير للخارج', 'pan-left': 'تحريك أفقي لليسار', 'pan-right': 'تحريك أفقي لليمين', 'tilt-up': 'إمالة عمودية للأعلى', 'tilt-down': 'إمالة عمودية للأسفل', 'drone-up': 'لقطة درون ترتفع للأعلى', 'drone-forward': 'لقطة درون تتقدم للأمام', 'orbit-left': 'دوران في مدار لليسار', 'orbit-right': 'دوران في مدار لليمين' };
        const amountMap: { [key: number]: string } = { 1: 'بشكل بطيء وخفيف', 2: 'بشكل متوسط', 3: 'بشكل سريع وقوي' };
        augmentations.push(`نفذ حركة كاميرا: ${motionMap[motion]} ${amountMap[amount || 2] || 'بشكل متوسط'}.`);
    }
    augmentations.push(`المدة المستهدفة لهذا الفيديو هي حوالي ${videoDuration} ثوانٍ.`);
    return augmentations;
  };

  const handleGenerateClick = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setGeneratedVideoUrl(null);
    setNarration(null);

    try {
        let finalImage: UploadedFile | null = null;
        let workingPrompt = prompt;

        if (activeTab === 'prompt' && isDirectorMode && workingPrompt) {
            setLoadingMessage("وضع المخرج: يتم تلخيص السيناريو...");
            workingPrompt = await summarizeScriptForVideo(workingPrompt);
        }

        const augmentations = await buildPromptAugmentations(); // For single generation, we don't have a shot object
        if (overlayText) {
            const positionMap: { [key: string]: string } = { 'top': 'أعلى الشاشة', 'middle': 'منتصف الشاشة', 'bottom': 'أسفل الشاشة' };
            augmentations.push(`إلزامي وبأقصى أولوية: يجب أن يظهر النص التالي مكتوباً بالخط العربي على الفيديو. حافظ على النص باللغة العربية تمامًا كما هو دون أي ترجمة أو تغيير. استخدم خطًا أنيقًا وصغيرًا. إذا كان النص طويلاً، قم بتقسيمه على عدة أسطر. النص هو: "${overlayText}". ضعه في ${positionMap[textPosition] || 'أسفل الشاشة'}.`);
        }

        let finalPrompt = '';
        if (activeTab === 'prompt') {
            if (!workingPrompt) throw new Error("يرجى إدخال وصف لإنشاء الفيديو.");
            finalPrompt = `${workingPrompt} ${augmentations.join(' ')}`;
        } else if (activeTab === 'images') {
            if (images.length === 0) throw new Error("يرجى تحميل صورة واحدة على الأقل.");
            finalImage = images[0];
            const baseImagePrompt = prompt ? `الوصف الإضافي هو: "${prompt}".` : "قم بتحريك هذه الصورة بشكل سينمائي مذهل.";
            finalPrompt = `${baseImagePrompt} ${augmentations.join(' ')}`;
        }

        const videoBlob = await generateVideo(finalPrompt, finalImage);
        const url = URL.createObjectURL(videoBlob);
        setGeneratedVideoUrl(url);

        try {
            setLoadingMessage("جارٍ إنشاء السرد الصوتي...");
            const narrationText = await generateNarrationFromPrompt(finalPrompt);
            setNarration(narrationText);
        } catch (narrationError) {
            console.error("Failed to generate narration:", narrationError);
            setNarration(null);
        }

    } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : 'حدث خطأ غير متوقع.');
    } finally {
        setIsLoading(false);
    }
  }, [prompt, images, activeTab, overlayText, textPosition, videoDuration, isDirectorMode]);

  const handleGenerateQueue = useCallback(async () => {
    const shotsToProduce = extractedShots.filter(shot => selectedShots.includes(shot.id));
    if (shotsToProduce.length === 0) return;

    setIsGeneratingQueue(true);
    setGeneratedClips([]);
    setError(null);

    const clips: GeneratedClip[] = [];
    
    for (let i = 0; i < shotsToProduce.length; i++) {
        const shot = shotsToProduce[i];
        setQueueProgress({ current: i + 1, total: shotsToProduce.length });
        
        try {
            const shotAugmentations = await buildPromptAugmentations(shot);
            if (shot.overlay) {
                const positionMap: { [key: string]: string } = { 'top': 'أعلى الشاشة', 'middle': 'منتصف الشاشة', 'bottom': 'أسفل الشاشة' };
                shotAugmentations.push(`إلزامي وبأقصى أولوية: يجب أن يظهر النص التالي مكتوباً بالخط العربي على الفيديو. حافظ على النص باللغة العربية تمامًا كما هو دون أي ترجمة أو تغيير. استخدم خطًا أنيقًا وصغيرًا. إذا كان النص طويلاً، قم بتقسيمه على عدة أسطر. النص هو: "${shot.overlay}". ضعه في ${positionMap[textPosition] || 'أسفل الشاشة'}.`);
            }
            
            const finalPrompt = `${shot.visual} ${shotAugmentations.join(' ')}`;
            const videoBlob = await generateVideo(finalPrompt, null);
            const url = URL.createObjectURL(videoBlob);
            
            setLoadingMessage(`اللقطة ${i + 1}: جارٍ إنشاء السرد الصوتي...`);
            let narrationText: string | null = null;
            try {
                narrationText = await generateNarrationFromPrompt(finalPrompt);
            } catch (narrationError) {
                console.error(`Failed to generate narration for shot #${shot.id + 1}:`, narrationError);
            }

            clips.push({ src: url, name: `shot_${shot.id + 1}.mp4`, narration: narrationText });

        } catch (err) {
            console.error(`Failed to generate shot #${shot.id + 1}:`, err);
            setError(`فشل إنشاء اللقطة #${shot.id + 1}. تم إيقاف الطابور.`);
            break; // Stop the queue on first error
        }
    }

    setGeneratedClips(clips);
    setIsGeneratingQueue(false);
}, [extractedShots, selectedShots, videoDuration, textPosition]);
  
  const handleEnterApp = () => {
    setSplashExiting(true);
    setTimeout(() => setSplashVisible(false), 700);
  };
  
  const anyLoading = isLoading || isExpanding || isAnalyzing || isExtractingShots || isGeneratingQueue || isAnalyzingImages;
  const isGenerateDisabled = anyLoading || (activeTab === 'prompt' && !prompt) || (activeTab === 'images' && images.length === 0);
  const mainButtonAction = activeTab === 'document' && documentFile ? handleDocumentAnalysis : handleGenerateClick;
  const mainButtonText = activeTab === 'document' && documentFile ? (isAnalyzing ? 'جارٍ التحليل...' : 'تحليل وإنشاء سيناريو') : (isLoading ? 'جارٍ الإنشاء...' : 'إنشاء الفيديو');
  const isMainButtonDisabled = anyLoading || (activeTab === 'prompt' && !prompt) || (activeTab === 'images' && images.length === 0) || (activeTab === 'document' && !documentFile);
  
  const renderContent = () => {
    if (isPreviewMode) {
      return <PreviewStudio clips={generatedClips} onExit={resetInputs} selectedVoiceURI={selectedVoiceURI} />;
    }
    if (isGeneratingQueue) {
        return <LoadingDisplay message={loadingMessage} progress={queueProgress.current} total={queueProgress.total} />;
    }
    if (generatedClips.length > 0) {
        return <QueueResultDisplay clips={generatedClips} onStartOver={resetInputs} onPreview={() => setIsPreviewMode(true)} />;
    }
    if (isLoading) {
        return <LoadingDisplay message={loadingMessage} />;
    }
    if (generatedVideoUrl) {
        return <VideoPlayer src={generatedVideoUrl} onNewVideo={resetInputs} narration={narration} selectedVoiceURI={selectedVoiceURI} />;
    }
    return (
        <div className="space-y-6">
            <h2 className="text-xl sm:text-2xl font-bold text-center text-cyan-300">اختر طريقة الإدخال</h2>
            <p className="text-center text-gray-400">صف مشهدًا، أو حرك صورك، أو دع الذكاء الاصطناعي يحلل مستندًا.</p>
            
            <InputTabs activeTab={activeTab} setActiveTab={setActiveTab} prompt={prompt} setPrompt={setPrompt} images={images} setImages={setImages} documentFile={documentFile} setDocumentFile={setDocumentFile} disabled={anyLoading}/>

            {extractedShots.length > 0 && activeTab === 'prompt' && (
                <ShotSelector shots={extractedShots} selectedShots={selectedShots} onSelectedShotsChange={setSelectedShots} onProduceQueue={handleGenerateQueue} onUpdateShot={handleUpdateShot} disabled={anyLoading} />
            )}
            
            <div className="space-y-4">
                <Overlays overlayText={overlayText} setOverlayText={setOverlayText} textPosition={textPosition} setTextPosition={setTextPosition} disabled={anyLoading} />
                <VideoSettings videoDuration={videoDuration} setVideoDuration={setVideoDuration} isDirectorMode={isDirectorMode} setIsDirectorMode={setIsDirectorMode} disabled={anyLoading || activeTab !== 'prompt'} />
                <AudioSettings availableVoices={availableVoices} selectedVoiceURI={selectedVoiceURI} onVoiceChange={setSelectedVoiceURI} disabled={anyLoading} />
            </div>
             
            {activeTab === 'prompt' && !extractedShots.length && (
                <div className="mt-4 flex flex-col sm:flex-row gap-4 justify-center">
                    <button onClick={handleExpandScriptClick} disabled={!prompt || anyLoading} className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-2 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-indigo-300/50">
                      {isExpanding ? 'جاري المعالجة...' : '✨ توسيع الفكرة'}
                    </button>
                    <button onClick={handleExtractShots} disabled={!prompt || anyLoading} className="flex-1 bg-teal-600 hover:bg-teal-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-2 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-teal-300/50">
                      {isExtractingShots ? 'جاري التحليل...' : '🎬 تحليل واستخراج اللقطات'}
                    </button>
                </div>
            )}

            {activeTab === 'images' && (
                 <div className="pt-2 space-y-4">
                    <label htmlFor="image-prompt" className="mb-2 block font-semibold text-gray-300">وصف إضافي (اختياري)</label>
                    <input id="image-prompt" type="text" value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="مثال: مع التركيز على حركة السحب في السماء" className="w-full bg-gray-900/70 border-2 border-gray-700 rounded-lg p-3 text-gray-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors duration-300" disabled={anyLoading}/>
                    {images.length > 1 && (
                         <button onClick={handleAnalyzeImages} disabled={anyLoading} className="w-full bg-purple-600 hover:bg-purple-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-2 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-purple-300/50">
                            {isAnalyzingImages ? 'جاري تحليل الصور...' : `تحليل الصور وإنشاء قصة (${images.length})`}
                        </button>
                    )}
                 </div>
            )}
           
            {error && (
              <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg text-center">
                <p>{error}</p>
              </div>
            )}
            
            {extractedShots.length === 0 && (
                <button onClick={mainButtonAction} disabled={isMainButtonDisabled} className="w-full flex items-center justify-center bg-cyan-500 hover:bg-cyan-400 disabled:bg-gray-600 disabled:cursor-not-allowed text-gray-900 font-bold py-3 px-6 rounded-lg text-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-cyan-300/50">
                  {mainButtonText}
                </button>
            )}
        </div>
    );
  }

  return (
    <>
      {splashVisible && <SplashScreen onEnter={handleEnterApp} isExiting={splashExiting} />}
      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-4 sm:p-6 lg:p-8">
        <Header />
        <main className="w-full max-w-4xl mx-auto flex-grow flex flex-col justify-center">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl p-6 sm:p-8 border border-gray-700">
            {renderContent()}
          </div>
        </main>
        <footer className="text-center py-4 text-gray-500 text-sm">
          <p>مدعوم بواسطة Google Gemini API</p>
        </footer>
      </div>
    </>
  );
};

export default App;