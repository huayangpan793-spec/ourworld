'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ImageIcon } from 'lucide-react';
import { PhotoGallery } from './PhotoGallery';

interface PhotoStackProps {
  photos: string[];
  captions: string[];
  onReorder?: (photos: string[]) => void;
  editable?: boolean;
}

export function PhotoStack({ photos, captions, editable = false }: PhotoStackProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (!photos || photos.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 bg-sky-50/50 rounded-xl border border-sky-200/30">
        <div className="text-center text-deep-400">
          <ImageIcon size={28} className="mx-auto mb-2 opacity-50" />
          <p className="text-xs font-[family-name:var(--font-body)]">暂无照片</p>
        </div>
      </div>
    );
  }

  const displayPhotos = photos.slice(0, 9);
  const count = displayPhotos.length;

  const handleStackClick = () => {
    setSelectedIndex(0);
    setIsExpanded(true);
  };

  return (
    <>
      {/* Stacked view */}
      <div
        className="relative cursor-pointer group"
        onClick={handleStackClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && handleStackClick()}
        aria-label="展开照片"
      >
        {/* Back layers */}
        {displayPhotos.slice(0, Math.min(count, 3)).map((photo, i) => {
          const isLast = i === Math.min(count, 3) - 1;
          return (
            <div
              key={i}
              className="absolute inset-0 rounded-xl overflow-hidden transition-transform duration-300"
              style={{
                zIndex: count - i,
                transform: `rotate(${(i - (Math.min(count, 3) - 1) / 2) * 2.5}deg) translateY(${i * 4}px)`,
                boxShadow: i === Math.min(count, 3) - 1
                  ? '0 2px 12px rgba(48, 75, 92, 0.08)'
                  : '0 1px 4px rgba(48, 75, 92, 0.04)',
                border: '2px solid rgba(255, 255, 255, 0.8)',
              }}
            >
              <img
                src={photo}
                alt={captions[i] || `照片 ${i + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          );
        })}

        {/* Top photo */}
        <div
          className="relative rounded-xl overflow-hidden aspect-[4/3]"
          style={{
            boxShadow: '0 4px 20px rgba(48, 75, 92, 0.1)',
            border: '2px solid rgba(255, 255, 255, 0.9)',
          }}
        >
          <img
            src={displayPhotos[0]}
            alt={captions[0] || '封面照片'}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            loading="lazy"
          />

          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />

          {/* Photo count badge */}
          {count > 1 && (
            <div className="absolute bottom-2 right-2 bg-white/70 backdrop-blur-sm rounded-full px-2.5 py-0.5 text-xs text-deep-700 font-[family-name:var(--font-body)]">
              共 {count} 张
            </div>
          )}
        </div>

        {/* Hover hint */}
        <div className="absolute inset-0 rounded-xl bg-white/0 group-hover:bg-white/5 transition-colors duration-300" />
      </div>

      {/* Expanded gallery */}
      <AnimatePresence>
        {isExpanded && (
          <PhotoGallery
            photos={displayPhotos}
            captions={captions}
            selectedIndex={selectedIndex}
            onSelect={setSelectedIndex}
            onClose={() => setIsExpanded(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
