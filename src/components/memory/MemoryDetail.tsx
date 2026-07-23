'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Calendar, Edit3, Trash2, Tag, Sun, Heart, Clock, MoreHorizontal } from 'lucide-react';
import { useMemoryStore } from '@/lib/store';
import { Memory } from '@/lib/types';
import { formatDate, formatDateTime } from '@/lib/utils';
import { PhotoStack } from './PhotoStack';
import { Envelope } from './Envelope';
import { Letter } from './Letter';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useRouter } from 'next/navigation';

interface MemoryDetailProps {
  memory: Memory;
  onClose?: () => void;
}

export function MemoryDetail({ memory, onClose }: MemoryDetailProps) {
  const router = useRouter();
  const deleteMemory = useMemoryStore((s) => s.deleteMemory);
  const showToast = useMemoryStore((s) => s.showToast);
  const [letterOpen, setLetterOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (letterOpen) setLetterOpen(false);
        else onClose?.();
      }
    },
    [letterOpen, onClose]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleDelete = () => {
    deleteMemory(memory.id);
    showToast('这段记忆已从地图上收起。');
    setShowDeleteConfirm(false);
    onClose?.();
  };

  const importanceLabel = ['', '普通', '重要', '特别重要'];
  const typeLabels: Record<string, string> = {
    travel: '旅行', daily: '日常', anniversary: '纪念日',
    first: '第一次', birthday: '生日', surprise: '惊喜', custom: '自定义',
  };

  return (
    <>
      {/* Sidebar / Detail Panel */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 50 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="h-full flex flex-col bg-white/50 backdrop-blur-md"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-sky-200/20">
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-[family-name:var(--font-title)] text-deep-800 truncate">
              {memory.title}
            </h2>
            <div className="flex items-center gap-2 text-xs text-deep-400 mt-0.5">
              <span className="flex items-center gap-1">
                <Calendar size={10} />
                {formatDate(memory.date)}
              </span>
              <span className="flex items-center gap-1">
                <MapPin size={10} />
                {memory.locationName}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {/* Edit */}
            <button
              onClick={() => router.push(`/edit/${memory.id}`)}
              className="p-2 rounded-lg text-deep-400 hover:text-deep-700 hover:bg-white/50 transition-colors"
              aria-label="编辑记忆"
            >
              <Edit3 size={15} />
            </button>

            {/* Menu */}
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 rounded-lg text-deep-400 hover:text-deep-700 hover:bg-white/50 transition-colors"
                aria-label="更多"
              >
                <MoreHorizontal size={15} />
              </button>
              <AnimatePresence>
                {showMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="absolute right-0 top-full mt-1 bg-white/90 backdrop-blur-md rounded-xl border border-sky-200/30 shadow-md py-1 min-w-[120px] z-20"
                  >
                    <button
                      onClick={() => { setShowDeleteConfirm(true); setShowMenu(false); }}
                      className="w-full px-4 py-2 text-xs text-red-400 hover:text-red-500 hover:bg-red-50/50 text-left flex items-center gap-2 transition-colors"
                    >
                      <Trash2 size={13} />
                      删除记忆
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-deep-400 hover:text-deep-700 hover:bg-white/50 transition-colors"
              aria-label="关闭"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {/* Summary */}
          {memory.summary && (
            <p className="text-sm text-deep-500 italic mb-4 font-[family-name:var(--font-body)] leading-relaxed border-l-2 border-sky-200/30 pl-3">
              "{memory.summary}"
            </p>
          )}

          {/* Photo Stack */}
          <div className="mb-4">
            <PhotoStack photos={memory.photos} captions={memory.photoCaptions} />
          </div>

          {/* Envelope + Info row */}
          <div className="flex items-end gap-4 mb-4">
            <div className="flex-1 space-y-2">
              {/* Tags */}
              {memory.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {memory.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-sky-100/40 text-deep-400"
                    >
                      <Tag size={9} />
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Meta info */}
              <div className="flex items-center gap-3 text-xs text-deep-400">
                {memory.anniversary && (
                  <span className="flex items-center gap-1 text-gold-300">
                    <Sun size={12} />
                    纪念日
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Heart size={11} />
                  {importanceLabel[memory.importance]}
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={11} />
                  {typeLabels[memory.memoryType] || memory.memoryType}
                </span>
              </div>

              {/* Author */}
              <p className="text-xs text-deep-400 font-[family-name:var(--font-body)]">
                记录于 {memory.author} · {formatDateTime(memory.date, memory.time)}
              </p>
            </div>

            {/* Envelope */}
            {memory.content && (
              <Envelope
                onClick={() => setLetterOpen(true)}
                date={formatDate(memory.date)}
                locationName={memory.locationName}
                summary={memory.summary}
              />
            )}
          </div>
        </div>
      </motion.div>

      {/* Letter */}
      <AnimatePresence>
        {letterOpen && (
          <Letter
            isOpen={letterOpen}
            onClose={() => setLetterOpen(false)}
            title={memory.title}
            content={memory.content}
            author={memory.author}
            date={formatDate(memory.date)}
            locationName={memory.locationName}
          />
        )}
      </AnimatePresence>

      {/* Delete confirm */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="删除这段记忆？"
        message="删除后这段记忆将从这个星球上消失，包括照片和故事。此操作无法撤销。"
        confirmText="确认删除"
        cancelText="再想想"
        variant="danger"
      />
    </>
  );
}
