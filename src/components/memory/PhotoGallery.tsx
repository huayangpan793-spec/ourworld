'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';

interface PhotoGalleryProps {
  photos: string[];
  captions: string[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  onClose: () => void;
}

export function PhotoGallery({ photos, captions, selectedIndex, onSelect, onClose }: PhotoGalleryProps) {
  const [zoomed, setZoomed] = useState(false);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const [imgLoaded, setImgLoaded] = useState(false);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') { setZoomed(false); onClose(); }
    if (e.key === 'ArrowLeft') onSelect(Math.max(0, selectedIndex - 1));
    if (e.key === 'ArrowRight') onSelect(Math.min(photos.length - 1, selectedIndex + 1));
  }, [onClose, onSelect, selectedIndex, photos.length]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', handleKeyDown); document.body.style.overflow = ''; };
  }, [handleKeyDown]);

  // Touch swipe for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    // Only horizontal swipe, ignore if vertical scroll
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
      if (dx > 0) onSelect(Math.max(0, selectedIndex - 1));
      else onSelect(Math.min(photos.length - 1, selectedIndex + 1));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-50 bg-deep-800/40 backdrop-blur-sm flex flex-col items-center justify-center"
      onClick={onClose}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="relative w-full max-w-4xl mx-4 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between px-1 py-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-sm text-white/80 shrink-0 font-[family-name:var(--font-body)]">
              {selectedIndex + 1} / {photos.length}
            </span>
            {captions[selectedIndex] && (
              <span className="text-xs text-white/50 truncate font-[family-name:var(--font-body)]">
                {captions[selectedIndex]}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button onClick={() => setZoomed(!zoomed)}
              className="p-1.5 rounded-lg text-white/60 hover:text-white/90 hover:bg-white/10 transition-colors"
              aria-label={zoomed ? '缩小' : '放大'}>
              {zoomed ? <ZoomOut size={16} /> : <ZoomIn size={16} />}
            </button>
            <button onClick={onClose}
              className="p-1.5 rounded-lg text-white/60 hover:text-white/90 hover:bg-white/10 transition-colors"
              aria-label="关闭">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Image area — relative container for overlay buttons */}
        <div className="relative flex items-center justify-center w-full" style={{ minHeight: '40vh', maxHeight: '70vh' }}>
          {/* Previous button — overlaid on image */}
          {photos.length > 1 && selectedIndex > 0 && (
            <button onClick={() => onSelect(selectedIndex - 1)}
              className="absolute left-1 sm:left-2 z-10 p-2 rounded-full bg-black/20 text-white/70 hover:bg-black/40 hover:text-white transition-all"
              aria-label="上一张">
              <ChevronLeft size={24} />
            </button>
          )}

          {/* Image */}
          <div className="w-full h-full flex items-center justify-center overflow-hidden">
            <motion.img
              key={selectedIndex}
              src={photos[selectedIndex]}
              alt={captions[selectedIndex] || `照片 ${selectedIndex + 1}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onLoad={() => setImgLoaded(true)}
              className={`max-w-full max-h-full transition-transform duration-300 ${
                zoomed ? 'scale-150 cursor-zoom-out' : 'cursor-zoom-in'
              }`}
              style={{ objectFit: 'contain', width: 'auto', height: 'auto' }}
              draggable={false}
              onClick={() => setZoomed(!zoomed)}
            />
          </div>

          {/* Next button — overlaid on image */}
          {photos.length > 1 && selectedIndex < photos.length - 1 && (
            <button onClick={() => onSelect(selectedIndex + 1)}
              className="absolute right-1 sm:right-2 z-10 p-2 rounded-full bg-black/20 text-white/70 hover:bg-black/40 hover:text-white transition-all"
              aria-label="下一张">
              <ChevronRight size={24} />
            </button>
          )}
        </div>

        {/* Thumbnail strip */}
        {photos.length > 1 && (
          <div className="flex items-center justify-center gap-2 mt-3 overflow-x-auto px-4 py-1">
            {photos.map((photo, i) => (
              <button key={i} onClick={() => onSelect(i)}
                className={`shrink-0 w-10 h-10 rounded-lg overflow-hidden border-2 transition-all ${
                  i === selectedIndex ? 'border-gold-200 opacity-100' : 'border-transparent opacity-40 hover:opacity-70'
                }`}>
                <img src={photo} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
