'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

interface LetterProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string;
  author: string;
  date: string;
  locationName: string;
  onDateClick?: () => void;
}

export function Letter({ isOpen, onClose, title, content, author, date, locationName }: LetterProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-40 flex items-end sm:items-center justify-center p-4 sm:p-6"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-deep-800/20 backdrop-blur-[1px]" />

      {/* Letter paper */}
      <motion.div
        initial={{ opacity: 0, y: 40, rotateX: 15, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, rotateX: 5, scale: 0.97 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-lg max-h-[80vh] overflow-y-auto rounded-2xl bg-paper shadow-xl border border-sky-200/20"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Paper texture lines */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]">
          {Array.from({ length: 30 }).map((_, i) => (
            <div key={i} className="h-8 border-b border-deep-800" style={{ marginTop: `${i * 24}px` }} />
          ))}
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-deep-400 hover:text-deep-700 hover:bg-white/50 transition-colors z-10"
          aria-label="关闭信纸"
        >
          <X size={18} />
        </button>

        {/* Content */}
        <div className="relative px-8 py-10">
          {/* Title */}
          <h3 className="text-xl font-[family-name:var(--font-title)] text-deep-800 mb-2 text-center">
            {title}
          </h3>

          {/* Date & location */}
          <p className="text-xs text-deep-400 text-center mb-6 font-[family-name:var(--font-body)]">
            {date} · {locationName}
          </p>

          {/* Decorative line */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gold-200/30 to-transparent" />
            <div className="w-1.5 h-1.5 rounded-full bg-gold-200/40" />
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gold-200/30 to-transparent" />
          </div>

          {/* Story content — WenKai body */}
          <div className="font-[family-name:var(--font-body)] text-sm text-deep-700 leading-8 tracking-wide whitespace-pre-line">
            {content}
          </div>

          {/* Divider */}
          <div className="my-6 h-px bg-sky-200/20" />

          {/* Author & date */}
          <div className="text-right">
            <p className="text-sm text-deep-700 font-[family-name:var(--font-body)]">
              {author}
            </p>
            <p className="text-xs text-deep-400 mt-0.5 font-[family-name:var(--font-body)]">
              {date}
            </p>
          </div>

          {/* Footer decoration */}
          <div className="mt-6 flex justify-center">
            <svg width="24" height="12" viewBox="0 0 24 12" fill="none">
              <path d="M2 6C6 2 10 10 14 6C18 2 22 10 22 6" stroke="#E8D59A" strokeWidth="0.8" opacity="0.5" />
            </svg>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
