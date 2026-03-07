import React from 'react';

const PageLoader: React.FC = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 animate-pulse-soft" />
        <div className="flex gap-1.5">
          <div
            className="w-2 h-2 rounded-full bg-brand-500 animate-bounce-soft"
            style={{ animationDelay: '0ms' }}
          />
          <div
            className="w-2 h-2 rounded-full bg-brand-400 animate-bounce-soft"
            style={{ animationDelay: '150ms' }}
          />
          <div
            className="w-2 h-2 rounded-full bg-brand-300 animate-bounce-soft"
            style={{ animationDelay: '300ms' }}
          />
        </div>
      </div>
    </div>
  );
};

export default PageLoader;
