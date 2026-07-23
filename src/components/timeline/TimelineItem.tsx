'use client';

import { motion } from 'framer-motion';
import { Memory } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import { MapPin, Calendar, Sun } from 'lucide-react';

interface TimelineItemProps {
  memory: Memory;
  onClick: () => void;
  index: number;
}

export function TimelineItem({ memory, onClick, index }: TimelineItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: 'easeOut' }}
      className="relative pl-10 pb-8 group cursor-pointer"
      onClick={onClick}
    >
      {/* Timeline line */}
      <div className="absolute left-[15px] top-2 bottom-0 w-px bg-gradient-to-b from-sky-200/40 to-transparent group-last:hidden" />

      {/* Dot */}
      <div className={`absolute left-2 top-1.5 w-[26px] h-[26px] rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
        memory.anniversary
          ? 'border-gold-200 bg-gold-100/30 group-hover:bg-gold-100/50'
          : 'border-sky-300 bg-white/60 group-hover:bg-sky-100/50'
      }`}>
        <div className={`w-[10px] h-[10px] rounded-full transition-all duration-300 ${
          memory.anniversary
            ? 'bg-gold-300 group-hover:scale-125'
            : 'bg-sky-400 group-hover:scale-125'
        }`} />
      </div>

      {/* Content card */}
      <div className="bg-white/60 backdrop-blur-sm rounded-xl border border-sky-200/20 p-4 hover:bg-white/80 hover:border-sky-200/40 hover:shadow-sm transition-all duration-300">
        <div className="flex gap-4">
          {/* Thumbnail */}
          {memory.photos[0] && (
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden shrink-0">
              <img
                src={memory.photos[0]}
                alt={memory.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
            </div>
          )}

          <div className="flex-1 min-w-0">
            {/* Title row */}
            <div className="flex items-center gap-2 mb-1">
              <h4 className="text-sm font-medium text-deep-700 truncate">
                {memory.title}
              </h4>
              {memory.anniversary && (
                <Sun size={14} className="text-gold-300 shrink-0 animate-breathing" />
              )}
            </div>

            {/* Meta */}
            <div className="flex items-center gap-3 text-xs text-deep-400 mb-2 flex-wrap">
              <span className="flex items-center gap-1">
                <Calendar size={11} />
                {formatDate(memory.date)}
              </span>
              <span className="flex items-center gap-1">
                <MapPin size={11} />
                {memory.locationName}
              </span>
            </div>

            {/* Summary */}
            {memory.summary && (
              <p className="text-xs text-deep-400/80 leading-relaxed line-clamp-2 font-[family-name:var(--font-body)]">
                {memory.summary}
              </p>
            )}

            {/* Tags */}
            {memory.tags.length > 0 && (
              <div className="flex gap-1.5 mt-2 flex-wrap">
                {memory.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] px-2 py-0.5 rounded-full bg-sky-100/40 text-deep-400"
                  >
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
