'use client';

import { motion } from 'framer-motion';
import { Mail } from 'lucide-react';

interface EnvelopeProps {
  onClick: () => void;
  date?: string;
  locationName?: string;
  summary?: string;
}

export function Envelope({ onClick, date, locationName, summary }: EnvelopeProps) {
  return (
    <motion.button
      onClick={onClick}
      className="relative group"
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      aria-label="打开信封"
    >
      {/* Envelope body */}
      <div className="relative w-16 h-12 bg-gradient-to-br from-paper to-white rounded-md border border-sky-200/30 shadow-md overflow-hidden transition-shadow duration-300 group-hover:shadow-lg">
        {/* Envelope flap */}
        <div className="absolute top-0 left-0 right-0 h-0">
          <svg viewBox="0 0 100 60" className="w-full h-full">
            <polygon points="0,0 50,35 100,0" fill="#FDF8F0" stroke="rgba(158,203,227,0.2)" strokeWidth="1" />
          </svg>
        </div>

        {/* Seal */}
        <div className="absolute top-1 left-1/2 -translate-x-1/2">
          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-gold-200 to-gold-300 flex items-center justify-center shadow-sm">
            <div className="w-3 h-3 rounded-full border border-white/40" />
          </div>
        </div>

        {/* Mini text preview */}
        <div className="absolute bottom-2 left-2 right-2">
          <div className="h-0.5 bg-deep-200/20 rounded mb-0.5" />
          <div className="h-0.5 bg-deep-200/15 rounded w-2/3" />
        </div>
      </div>

      {/* Hover glow */}
      <div className="absolute -inset-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="absolute inset-0 rounded-lg bg-gold-100/10 blur-sm" />
      </div>

      {/* Sparkle dots on hover */}
      <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-gold-200 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="absolute -bottom-1 -left-1 w-1.5 h-1.5 rounded-full bg-gold-200/60 opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-100" />

      {/* Label */}
      <span className="block text-[10px] text-deep-400 mt-1.5 text-center font-[family-name:var(--font-body)] opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        展开信纸
      </span>
    </motion.button>
  );
}
