'use client';

import { useState, useEffect, useCallback } from 'react';
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

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setZoomed(false); onClose(); }
      if (e.key === 'ArrowLeft') onSelect(Math.max(0, selectedIndex - 1));
      if (e.key === 'ArrowRight') onSelect(Math.min(photos.length - 1, selectedIndex + 1));
    },
    [onClose, onSelect, selectedIndex, photos.length]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [handleKeyDown]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-50 bg-deep-800/40 backdrop-blur-sm flex items-center justify-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="relative max-w-3xl w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <span className="text-sm text-white/80 font-[family-name:var(--font-body)]">
              {selectedIndex + 1} / {photos.length}
            </span>
            {captions[selectedIndex] && (
              <span className="text-xs text-white/50 font-[family-name:var(--font-body)] truncate max-w-[200px]">
                {captions[selectedIndex]}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setZoomed(!zoomed)}
              className="p-1.5 rounded-lg text-white/60 hover:text-white/90 hover:bg-white/10 transition-colors"
              aria-label={zoomed ? '缩小' : '放大'}
            >
              {zoomed ? <ZoomOut size={16} /> : <ZoomIn size={16} />}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-white/60 hover:text-white/90 hover:bg-white/10 transition-colors"
              aria-label="关闭"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Image container */}
        <div
          className={`relative overflow-hidden rounded-xl bg-black/10 ${
            zoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'
          }`}
          onClick={() => setZoomed(!zoomed)}
        >
          <motion.img
            key={selectedIndex}
            src={photos[selectedIndex]}
            alt={captions[selectedIndex] || `照片 ${selectedIndex + 1}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className={`w-full transition-transform duration-300 ${
              zoomed ? 'scale-150 object-contain' : 'object-contain'
            }`}
            style={{ maxHeight: '70vh' }}
            draggable={false}
          />
        </div>

        {/* Navigation */}
        {photos.length > 1 && (
          <div className="flex items-center justify-center gap-4 mt-4">
            <button
              onClick={() => onSelect(Math.max(0, selectedIndex - 1))}
              disabled={selectedIndex === 0}
              className="p-2 rounded-full bg-white/10 text-white/70 hover:bg-white/20 hover:text-white disabled:opacity-30 transition-all"
              aria-label="上一张"
            >
              <ChevronLeft size={20} />
            </button>

            {/* Thumbnails */}
            <div className="flex gap-2 overflow-x-auto max-w-[60%] py-1">
              {photos.map((photo, i) => (
                <button
                  key={i}
                  onClick={() => onSelect(i)}
                  className={`shrink-0 w-10 h-10 rounded-lg overflow-hidden border-2 transition-all ${
                    i === selectedIndex
                      ? 'border-gold-200 opacity-100'
                      : 'border-transparent opacity-50 hover:opacity-80'
                  }`}
                >
                  <img src={photo} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

            <button
              onClick={() => onSelect(Math.min(photos.length - 1, selectedIndex + 1))}
              disabled={selectedIndex === photos.length - 1}
              className="p-2 rounded-full bg-white/10 text-white/70 hover:bg-white/20 hover:text-white disabled:opacity-30 transition-all"
              aria-label="下一张"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
