import React from 'react';
import { PhotoIcon, DownloadIcon, UndoIcon, RedoIcon } from './icons';
import ReactCrop, { type Crop, type PixelCrop } from 'react-image-crop';

interface ImageDisplayProps {
  originalImage: string | null;
  resultImage: string | null;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  // Crop props
  isCropping: boolean;
  crop?: Crop;
  setCrop: (c: Crop) => void;
  setCompletedCrop: (c: PixelCrop) => void;
  aspect?: number;
  imgRef: React.RefObject<HTMLImageElement>;
  onImageLoad: (e: React.SyntheticEvent<HTMLImageElement>) => void;
}

interface ImagePanelProps {
  title: string;
  imageUrl: string | null;
  isPlaceholder?: boolean;
  showDownloadButton?: boolean;
  historyControls?: React.ReactNode;
  // Crop props for original panel
  isCropping?: boolean;
  crop?: Crop;
  setCrop?: (c: Crop) => void;
  setCompletedCrop?: (c: PixelCrop) => void;
  aspect?: number;
  imgRef?: React.RefObject<HTMLImageElement>;
  onImageLoad?: (e: React.SyntheticEvent<HTMLImageElement>) => void;
}

const HistoryControls: React.FC<{
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}> = ({ onUndo, onRedo, canUndo, canRedo }) => {
  const buttonClass = "p-1.5 text-slate-400 rounded-md hover:bg-slate-700 hover:text-slate-200 disabled:text-slate-600 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors";
  return (
    <div className="flex items-center gap-1 bg-slate-900/80 border border-slate-700 rounded-lg p-0.5">
      <button onClick={onUndo} disabled={!canUndo} className={buttonClass} aria-label="Undo edit" title="Undo (Ctrl+Z)">
        <UndoIcon className="w-5 h-5" />
      </button>
      <button onClick={onRedo} disabled={!canRedo} className={buttonClass} aria-label="Redo edit" title="Redo (Ctrl+Y)">
        <RedoIcon className="w-5 h-5" />
      </button>
    </div>
  );
};


const ImagePanel: React.FC<ImagePanelProps> = ({ 
  title, 
  imageUrl, 
  isPlaceholder = false, 
  showDownloadButton = false, 
  historyControls,
  isCropping,
  crop,
  setCrop,
  setCompletedCrop,
  aspect,
  imgRef,
  onImageLoad,
}) => {
  const handleDownload = () => {
    if (!imageUrl) return;
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = 'ai-prime-hd-edited-image.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full md:w-1/2 flex flex-col items-center p-2">
      <div className="w-full flex justify-between items-center mb-2 min-h-[36px]">
        <h3 className="text-lg font-semibold text-slate-400">{title}</h3>
        {historyControls}
      </div>
      <div className="w-full aspect-square bg-slate-900/70 rounded-lg flex items-center justify-center overflow-hidden relative">
        {imageUrl ? (
          <>
            {isCropping && setCrop && setCompletedCrop ? (
               <ReactCrop
                  crop={crop}
                  onChange={(_, percentCrop) => setCrop(percentCrop)}
                  onComplete={(c) => setCompletedCrop(c)}
                  aspect={aspect}
                >
                  <img
                    ref={imgRef}
                    src={imageUrl}
                    alt={title}
                    className="w-full h-full object-contain"
                    onLoad={onImageLoad}
                  />
               </ReactCrop>
            ) : (
               <img
                  ref={imgRef}
                  src={imageUrl}
                  alt={title}
                  className="w-full h-full object-contain"
                  onLoad={onImageLoad}
                />
            )}
            
            {showDownloadButton && (
              <button
                onClick={handleDownload}
                className="absolute top-3 right-3 p-2 bg-slate-900/60 rounded-full text-slate-300 hover:bg-sky-600 hover:text-white transition-all duration-200 backdrop-blur-sm"
                aria-label="Download edited image"
                title="Download edited image"
              >
                <DownloadIcon className="w-5 h-5" />
              </button>
            )}
          </>
        ) : (
          <div className="text-slate-600 flex flex-col items-center">
            <PhotoIcon className="w-16 h-16" />
            <p className="mt-2 text-sm">{isPlaceholder ? "Your AI-edited image will appear here" : "Upload an image to start"}</p>
          </div>
        )}
      </div>
    </div>
  );
};


export const ImageDisplay: React.FC<ImageDisplayProps> = ({ 
  originalImage, 
  resultImage, 
  onUndo, 
  onRedo, 
  canUndo, 
  canRedo,
  isCropping,
  crop,
  setCrop,
  setCompletedCrop,
  aspect,
  imgRef,
  onImageLoad,
}) => {
  if (!originalImage && !resultImage) {
     return (
        <div className="w-full h-full flex items-center justify-center text-slate-600">
             <div className="text-center">
                 <PhotoIcon className="w-24 h-24 mx-auto" />
                 <p className="mt-4 text-xl">AI Prime HD Photo Editor</p>
                 <p className="text-slate-500">Upload an image and write a prompt to begin.</p>
             </div>
        </div>
     );
  }

  return (
    <div className="flex flex-col md:flex-row gap-4 w-full h-full items-center">
      <ImagePanel 
        title="Original" 
        imageUrl={originalImage}
        isCropping={isCropping}
        crop={crop}
        setCrop={setCrop}
        setCompletedCrop={setCompletedCrop}
        aspect={aspect}
        imgRef={imgRef}
        onImageLoad={onImageLoad}
      />
      <ImagePanel 
        title="AI Prime HD Result" 
        imageUrl={resultImage} 
        isPlaceholder 
        showDownloadButton={!!resultImage}
        historyControls={
          (canUndo || canRedo) && (
            <HistoryControls 
              onUndo={onUndo}
              onRedo={onRedo}
              canUndo={canUndo}
              canRedo={canRedo}
            />
          )
        }
      />
    </div>
  );
};