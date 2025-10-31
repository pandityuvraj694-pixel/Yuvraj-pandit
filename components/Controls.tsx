import React from 'react';
import { SparklesIcon, CropIcon } from './icons';

interface ControlsProps {
  prompt: string;
  onPromptChange: (prompt: string) => void;
  onApply: () => void;
  isDisabled: boolean;
  isImageLoaded: boolean;
  isCropping: boolean;
  onToggleCrop: (active: boolean) => void;
  onApplyCrop: () => void;
  aspect: number | undefined;
  onSetAspect: (aspect: number | undefined) => void;
}

const aspectRatios = [
  { name: 'Free', value: undefined },
  { name: '1:1', value: 1 },
  { name: '4:3', value: 4 / 3 },
  { name: '16:9', value: 16 / 9 },
];

export const Controls: React.FC<ControlsProps> = ({ 
  prompt, 
  onPromptChange, 
  onApply, 
  isDisabled,
  isImageLoaded,
  isCropping,
  onToggleCrop,
  onApplyCrop,
  aspect,
  onSetAspect,
}) => {
  return (
    <>
      {isImageLoaded && (
        <div className="bg-slate-800 p-4 rounded-lg flex flex-col gap-4">
          <h2 className="text-lg font-semibold text-slate-300">2. Crop Tool (Optional)</h2>
          {!isCropping ? (
            <button
              onClick={() => onToggleCrop(true)}
              className="flex items-center justify-center gap-2 w-full px-4 py-2 text-md font-semibold text-slate-200 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors"
            >
              <CropIcon className="w-5 h-5" />
              Crop Image
            </button>
          ) : (
            <div className="flex flex-col gap-3">
              <div>
                <h3 className="text-sm font-medium text-slate-400 mb-2">Aspect Ratio</h3>
                <div className="grid grid-cols-4 gap-2">
                  {aspectRatios.map(ratio => (
                    <button
                      key={ratio.name}
                      onClick={() => onSetAspect(ratio.value)}
                      className={`px-2 py-1.5 text-sm font-semibold rounded-md transition-colors ${
                        aspect === ratio.value 
                          ? 'bg-sky-600 text-white' 
                          : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                      }`}
                    >
                      {ratio.name}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <button
                  onClick={onApplyCrop}
                  className="flex-1 px-4 py-2 text-md font-bold text-white bg-sky-600 rounded-lg hover:bg-sky-500 transition-colors"
                >
                  Apply Crop
                </button>
                <button
                  onClick={() => onToggleCrop(false)}
                  className="flex-1 px-4 py-2 text-md font-semibold text-slate-300 bg-slate-600 rounded-lg hover:bg-slate-500 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      <div className="bg-slate-800 p-4 rounded-lg flex flex-col gap-4">
        <div>
          <h2 className="text-lg font-semibold mb-3 text-slate-300">{isImageLoaded ? '3. Describe Your Edit' : '2. Describe Your Edit'}</h2>
          <textarea
            value={prompt}
            onChange={(e) => onPromptChange(e.target.value)}
            placeholder="e.g., 'Make the sky a dramatic sunset', 'Add a cat wearing sunglasses', 'Turn this into a vintage black and white photo'"
            className="w-full h-32 p-2 bg-slate-900 border border-slate-600 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-colors text-slate-300 placeholder-slate-500"
            disabled={isDisabled}
          />
        </div>
        <button
          onClick={onApply}
          disabled={isDisabled || !prompt.trim()}
          className="flex items-center justify-center gap-2 w-full px-4 py-3 text-lg font-bold text-white bg-sky-600 rounded-lg hover:bg-sky-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-100 disabled:scale-100"
        >
          <SparklesIcon className="w-6 h-6" />
          Apply AI Prime HD
        </button>
      </div>
    </>
  );
};