
import React from 'react';
import { SparklesIcon } from './icons';

export const Loader: React.FC = () => {
  return (
    <div className="absolute inset-0 bg-slate-800/80 backdrop-blur-sm flex flex-col items-center justify-center z-20">
      <div className="relative flex items-center justify-center">
        <div className="absolute h-24 w-24 rounded-full border-t-4 border-b-4 border-sky-500 animate-spin"></div>
        <SparklesIcon className="h-12 w-12 text-sky-400" />
      </div>
      <p className="mt-6 text-lg text-slate-300 font-semibold animate-pulse">AI is enhancing your image...</p>
    </div>
  );
};
