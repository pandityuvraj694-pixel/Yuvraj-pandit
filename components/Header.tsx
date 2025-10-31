
import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="bg-slate-900/80 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-10">
      <div className="container mx-auto px-4 py-3">
        <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-500">
          AI Prime HD Photo Editor
        </h1>
        <p className="text-sm text-slate-400">Professional editing powered by Gemini</p>
      </div>
    </header>
  );
};
