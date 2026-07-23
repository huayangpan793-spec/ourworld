'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, LayoutList, LayoutGrid, Map as MapIcon, Calendar, Sun } from 'lucide-react';
import { TimelineView } from '@/components/timeline/TimelineView';
import { MemoryCard } from '@/components/memory/MemoryCard';
import { useMemoryStore } from '@/lib/store';
import { sortByDateDesc } from '@/lib/utils';
import { PageView } from '@/lib/types';

export default function MemoriesPage() {
  const router = useRouter();
  const memories = useMemoryStore((s) => s.memories);
  const selectMemory = useMemoryStore((s) => s.selectMemory);
  const [view, setView] = useState<PageView>('timeline');

  const visitedMemories = memories
    .filter((m) => !m.isHidden && m.visitedStatus === 'visited')
    .sort(sortByDateDesc);

  const handleMemoryClick = (id: string) => {
    selectMemory(id);
    // On mobile go to detail page, on desktop go to globe with detail panel
    if (window.innerWidth < 1024) {
      router.push(`/memory/${id}`);
    } else {
      router.push('/globe');
    }
  };

  return (
    <div className="flex-1 min-h-screen bg-gradient-to-b from-sky-100 via-sky-50 to-white">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white/40 backdrop-blur-md border-b border-sky-200/20">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => router.push('/globe')}
            className="p-2 rounded-lg text-deep-400 hover:text-deep-700 hover:bg-white/50 transition-colors"
            aria-label="返回星球"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-base font-[family-name:var(--font-title)] text-deep-700 flex-1">
            全部记忆
          </h1>

          {/* View switcher */}
          <div className="flex items-center bg-white/40 rounded-xl p-0.5 border border-sky-200/20">
            <button
              onClick={() => setView('timeline')}
              className={`p-1.5 rounded-lg transition-all ${
                view === 'timeline' ? 'bg-white/60 text-deep-700 shadow-sm' : 'text-deep-400 hover:text-deep-600'
              }`}
              aria-label="时间轴视图"
              title="时间轴"
            >
              <LayoutList size={16} />
            </button>
            <button
              onClick={() => setView('list')}
              className={`p-1.5 rounded-lg transition-all ${
                view === 'list' ? 'bg-white/60 text-deep-700 shadow-sm' : 'text-deep-400 hover:text-deep-600'
              }`}
              aria-label="列表视图"
              title="列表"
            >
              <LayoutGrid size={16} />
            </button>
          </div>

          {/* Future places link */}
          <button
            onClick={() => router.push('/future')}
            className="p-2 rounded-lg text-deep-400 hover:text-deep-700 hover:bg-white/50 transition-colors"
            aria-label="未来地点"
            title="未来之约"
          >
            <Sun size={16} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4">
        {view === 'timeline' && <TimelineView />}

        {view === 'list' && (
          <div className="py-6">
            {visitedMemories.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-deep-400 font-[family-name:var(--font-body)]">还没有任何记忆</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {visitedMemories.map((memory) => (
                  <MemoryCard
                    key={memory.id}
                    memory={memory}
                    onClick={() => handleMemoryClick(memory.id)}
                    variant="default"
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Count */}
        <div className="py-6 text-center">
          <p className="text-[10px] text-deep-300 font-[family-name:var(--font-body)]">
            共 {visitedMemories.length} 段记忆 · 愿每一段都被好好珍藏
          </p>
        </div>
      </div>
    </div>
  );
}
