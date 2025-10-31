import React, { useState, useCallback, useRef } from 'react';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { Controls } from './components/Controls';
import { ImageDisplay } from './components/ImageDisplay';
import { Loader } from './components/Loader';
import type { ImageState } from './types';
import { editImageWithAI } from './services/geminiService';
import { centerCrop, makeAspectCrop, type Crop, type PixelCrop } from 'react-image-crop';

function getCroppedImg(
  image: HTMLImageElement,
  crop: PixelCrop,
  fileName: string,
): Promise<File> {
  const canvas = document.createElement('canvas');
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;
  canvas.width = crop.width;
  canvas.height = crop.height;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return Promise.reject(new Error('Failed to get canvas context.'));
  }

  const pixelRatio = window.devicePixelRatio;
  canvas.width = crop.width * pixelRatio;
  canvas.height = crop.height * pixelRatio;
  ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  ctx.imageSmoothingQuality = 'high';

  ctx.drawImage(
    image,
    crop.x * scaleX,
    crop.y * scaleY,
    crop.width * scaleX,
    crop.height * scaleY,
    0,
    0,
    crop.width,
    crop.height,
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Canvas is empty'));
        return;
      }
      const file = new File([blob], fileName, { type: 'image/png' });
      resolve(file);
    }, 'image/png');
  });
}


const App: React.FC = () => {
  const [image, setImage] = useState<ImageState>(null);
  const [prompt, setPrompt] = useState<string>('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Cropping state
  const imgRef = useRef<HTMLImageElement>(null);
  const [isCropping, setIsCropping] = useState<boolean>(false);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [aspect, setAspect] = useState<number | undefined>();

  const resetCropState = () => {
    setIsCropping(false);
    setCrop(undefined);
    setCompletedCrop(undefined);
    setAspect(undefined);
  };

  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = (reader.result as string).split(',')[1];
      setImage({ file, base64, mimeType: file.type });
      setHistory([]);
      setHistoryIndex(-1);
      setError(null);
      resetCropState();
    };
    reader.onerror = () => {
      setError("Failed to read the image file.");
    };
    reader.readAsDataURL(file);
  };

  const handleApplyAI = useCallback(async () => {
    if (!image || !prompt) {
      setError("Please upload an image and provide an editing prompt.");
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      const editedImageBase64 = await editImageWithAI(image.base64, image.mimeType, prompt);
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(editedImageBase64);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "An unknown error occurred during AI processing.");
    } finally {
      setIsLoading(false);
    }
  }, [image, prompt, history, historyIndex]);
  
  const handleToggleCrop = (active: boolean) => {
    setIsCropping(active);
    if (!active) {
       setCrop(undefined);
       setCompletedCrop(undefined);
    }
  };

  const handleApplyCrop = useCallback(async () => {
    if (!completedCrop || !imgRef.current || !image) {
      return;
    }
    try {
      const croppedImageFile = await getCroppedImg(imgRef.current, completedCrop, image.file.name);
      handleImageUpload(croppedImageFile); // Re-use the upload logic to set the new state
    } catch (e) {
      console.error(e);
      setError("Failed to apply crop.");
    }
  }, [completedCrop, image]);

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    if (aspect) {
      const { width, height } = e.currentTarget;
      setCrop(centerCrop(
        makeAspectCrop(
          {
            unit: '%',
            width: 90,
          },
          aspect,
          width,
          height,
        ),
        width,
        height,
      ));
    }
  }

  const handleUndo = useCallback(() => {
    if (historyIndex >= 0) {
      setHistoryIndex(historyIndex - 1);
    }
  }, [historyIndex]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
    }
  }, [historyIndex, history.length]);

  const canUndo = historyIndex >= 0;
  const canRedo = historyIndex < history.length - 1;
  const currentResultImage = historyIndex === -1 ? null : `data:image/png;base64,${history[historyIndex]}`;

  return (
    <div className="min-h-screen bg-slate-900 font-sans text-slate-200 flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto p-4 lg:p-8 flex flex-col lg:flex-row gap-8">
        <aside className="lg:w-1/3 xl:w-1/4 flex flex-col gap-6">
          <ImageUploader onImageUpload={handleImageUpload} currentImage={image?.file ?? null} />
          <Controls
            prompt={prompt}
            onPromptChange={setPrompt}
            onApply={handleApplyAI}
            isDisabled={isLoading || !image || isCropping}
            isImageLoaded={!!image}
            isCropping={isCropping}
            onToggleCrop={handleToggleCrop}
            onApplyCrop={handleApplyCrop}
            aspect={aspect}
            onSetAspect={setAspect}
          />
        </aside>
        <section className="flex-grow lg:w-2/3 xl:w-3/4 flex flex-col items-center justify-center bg-slate-800/50 rounded-lg p-4 relative min-h-[400px] lg:min-h-0">
          {isLoading && <Loader />}
          {error && <div className="text-red-400 text-center p-4 bg-red-900/50 rounded-md">{error}</div>}
          
          <div className={`transition-opacity duration-500 ${isLoading || error ? 'opacity-0' : 'opacity-100'} w-full h-full`}>
            <ImageDisplay 
              originalImage={image ? URL.createObjectURL(image.file) : null}
              resultImage={currentResultImage}
              onUndo={handleUndo}
              onRedo={handleRedo}
              canUndo={canUndo}
              canRedo={canRedo}
              isCropping={isCropping}
              crop={crop}
              setCrop={setCrop}
              setCompletedCrop={setCompletedCrop}
              aspect={aspect}
              imgRef={imgRef}
              onImageLoad={onImageLoad}
            />
          </div>
        </section>
      </main>
    </div>
  );
};

export default App;