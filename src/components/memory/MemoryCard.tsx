'use client';

import { motion } from 'framer-motion';
import { MapPin, Calendar, Sun, Tag } from 'lucide-react';
import { Memory } from '@/lib/types';
import { formatDate } from '@/lib/utils';

interface MemoryCardProps {
  memory: Memory;
  onClick?: () => void;
  variant?: 'default' | 'compact' | 'timeline';
}

export function MemoryCard({ memory, onClick, variant = 'default' }: MemoryCardProps) {
  if (variant === 'compact') {
    return (
      <motion.button
        onClick={onClick}
        className="flex items-center gap-3 w-full p-3 rounded-xl bg-white/50 hover:bg-white/70 border border-sky-200/20 hover:border-sky-200/40 transition-all duration-300 text-left group"
        whileHover={{ y: -1 }}
        transition={{ duration: 0.2 }}
      >
        {/* Thumbnail */}
        <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-sky-100">
          {memory.photos[0] ? (
            <img src={memory.photos[0]} alt="" className="w-full h-full object-cover" loading="lazy" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Sun size={16} className="text-sky-400" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-deep-700 truncate">{memory.title}</p>
          <p className="text-xs text-deep-400 mt-0.5">{formatDate(memory.date)} · {memory.locationName}</p>
        </div>

        {memory.anniversary && (
          <span className="text-gold-300 shrink-0">
            <Sun size={14} />
          </span>
        )}
      </motion.button>
    );
  }

  // Timeline variant
  if (variant === 'timeline') {
    return (
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className="relative pl-8 pb-8 group cursor-pointer"
        onClick={onClick}
      >
        {/* Timeline line */}
        <div className="absolute left-[11px] top-3 bottom-0 w-px bg-sky-200/30 group-last:hidden" />

        {/* Timeline dot */}
        <div className={`absolute left-1 top-2 w-[21px] h-[21px] rounded-full border-2 flex items-center justify-center ${
          memory.anniversary
            ? 'border-gold-200 bg-gold-100/30'
            : 'border-sky-300 bg-white/60'
        }`}>
          <div className={`w-2 h-2 rounded-full ${
            memory.anniversary ? 'bg-gold-300' : 'bg-sky-400'
          }`} />
        </div>

        {/* Card */}
        <div className="bg-white/60 backdrop-blur-sm rounded-xl border border-sky-200/20 p-4 hover:bg-white/80 hover:border-sky-200/40 transition-all duration-300">
          <div className="flex gap-4">
            {memory.photos[0] && (
              <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0">
                <img src={memory.photos[0]} alt="" className="w-full h-full object-cover" loading="lazy" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="text-sm font-medium text-deep-700">{memory.title}</h4>
                {memory.anniversary && <Sun size={12} className="text-gold-300" />}
              </div>
              <div className="flex items-center gap-3 text-xs text-deep-400 mb-2">
                <span className="flex items-center gap-1">
                  <Calendar size={10} />
                  {formatDate(memory.date)}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin size={10} />
                  {memory.locationName}
                </span>
              </div>
              <p className="text-xs text-deep-400/80 leading-relaxed line-clamp-2 font-[family-name:var(--font-body)]">
                {memory.summary}
              </p>
              {memory.tags.length > 0 && (
                <div className="flex gap-1.5 mt-2 flex-wrap">
                  {memory.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded-full bg-sky-100/50 text-deep-400">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Default card
  return (
    <motion.button
      onClick={onClick}
      className="w-full text-left group"
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <div className="bg-white/60 backdrop-blur-sm rounded-xl border border-sky-200/20 overflow-hidden hover:bg-white/80 hover:border-sky-200/40 transition-all duration-300">
        {/* Cover image */}
        {memory.photos[0] && (
          <div className="aspect-[16/9] overflow-hidden">
            <img
              src={memory.photos[0]}
              alt={memory.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
              loading="lazy"
            />
          </div>
        )}

        <div className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-sm font-medium text-deep-700 truncate">{memory.title}</h4>
            {memory.anniversary && <Sun size={12} className="text-gold-300 shrink-0" />}
          </div>
          <div className="flex items-center gap-3 text-xs text-deep-400 mb-2">
            <span className="flex items-center gap-1">
              <Calendar size={10} />
              {formatDate(memory.date)}
            </span>
            <span className="flex items-center gap-1">
              <MapPin size={10} />
              {memory.locationName}
            </span>
          </div>
          {memory.summary && (
            <p className="text-xs text-deep-400/80 leading-relaxed line-clamp-2 font-[family-name:var(--font-body)]">
              {memory.summary}
            </p>
          )}
        </div>
      </div>
    </motion.button>
  );
}
