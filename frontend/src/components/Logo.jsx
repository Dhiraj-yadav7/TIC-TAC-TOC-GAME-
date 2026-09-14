import React, { useState } from 'react';

export default function Logo({ size = 'md', showText = false, textPosition = 'right', className = '', animated = false }) {
  const [imageError, setImageError] = useState(false);

  // Map size keys to CSS classes
  const sizeMap = {
    xs: { box: 'w-7 h-7 rounded-lg', text: 'text-sm' },
    sm: { box: 'w-9 h-9 rounded-xl', text: 'text-base sm:text-lg' },
    md: { box: 'w-11 h-11 rounded-2xl', text: 'text-xl sm:text-2xl' },
    lg: { box: 'w-16 h-16 rounded-2xl', text: 'text-2xl sm:text-3xl' },
    xl: { box: 'w-24 h-24 rounded-3xl', text: 'text-3xl sm:text-4xl' },
    '2xl': { box: 'w-32 h-32 rounded-[2rem]', text: 'text-4xl sm:text-5xl' }
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  return (
    <div className={`inline-flex ${textPosition === 'bottom' ? 'flex-col' : 'flex-row'} items-center gap-3 ${className}`}>
      <div className={`relative group ${currentSize.box} flex-shrink-0 flex items-center justify-center bg-gradient-to-tr from-teal-900 via-emerald-950 to-teal-900 border border-teal-500/30 shadow-lg shadow-teal-500/20 overflow-hidden ${animated ? 'animate-pulse' : ''}`}>
        {!imageError ? (
          <img
            src="/logo.jpg"
            alt="Tic Tac Toe Logo"
            onError={() => setImageError(true)}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300 rounded-[inherit]"
          />
        ) : (
          /* SVG Fallback icon if image path fails */
          <div className="w-full h-full flex items-center justify-center font-black text-teal-300 text-sm tracking-tighter bg-gradient-to-tr from-teal-600 to-emerald-400 text-teal-950 shadow-inner">
            ✕◯
          </div>
        )}
        {/* Soft neon overlay rim */}
        <div className="absolute inset-0 rounded-[inherit] ring-1 ring-inset ring-teal-400/20 pointer-events-none" />
      </div>

      {showText && (
        <div className={textPosition === 'bottom' ? 'text-center' : 'text-left'}>
          <span className={`font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-teal-200 via-emerald-100 to-teal-300 drop-shadow-sm ${currentSize.text}`}>
            Tic Tac Toe
          </span>
        </div>
      )}
    </div>
  );
}
