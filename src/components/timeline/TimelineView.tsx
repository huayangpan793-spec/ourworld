'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useMemoryStore } from '@/lib/store';
import { getMonthName, sortByDateDesc, sortByDateAsc } from '@/lib/utils';
import { TimelineItem } from './TimelineItem';
import { EmptyState } from '@/components/ui/EmptyState';
import { Globe } from 'lucide-react';

interface TimelineViewProps {
  showFuture?: boolean;
}

export function TimelineView({ showFuture = false }: TimelineViewProps) {
  const router = useRouter();
  const selectMemory = useMemoryStore((s) => s.selectMemory);
  const memories = useMemoryStore((s) => s.memories);

  const grouped = useMemo(() => {
    const filtered = memories
      .filter((m) => !m.isHidden)
      .filter((m) => (showFuture ? m.visitedStatus === 'future' : m.visitedStatus === 'visited'))
      .sort(sortByDateDesc);

    const groups = new Map<string, Map<string, any[]>>();
    for (const m of filtered) {
      const [year, month] = m.date.split('-');
      if (!groups.has(year)) groups.set(year, new Map());
      const monthMap = groups.get(year)!;
      if (!monthMap.has(month)) monthMap.set(month, []);
      monthMap.get(month)!.push(m);
    }
    return groups;
  }, [memories, showFuture]);

  if (grouped.size === 0) {
    return (
      <EmptyState
        icon={<Globe size={28} className="text-sky-400" />}
        title={showFuture ? '还没有未来的计划' : '还没有任何记忆'}
        description={
          showFuture
            ? '在地球上选择一个坐标，把想去的地方先放进来。'
            : '点击地球上的位置，开始记录你们的故事吧。'
        }
        actionText="去地球看看"
        onAction={() => router.push('/globe')}
      />
    );
  }

  let globalIndex = 0;

  return (
    <div className="py-6">
      {/* Decorative header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-sky-200/30 to-transparent" />
        <span className="text-xs text-deep-400 font-[family-name:var(--font-body)]">
          {showFuture ? '✨ 未来之约' : '📖 时光纪念册'}
        </span>
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-sky-200/30 to-transparent" />
      </div>

      {Array.from(grouped.entries()).map(([year, months]) => (
        <div key={year} className="mb-10">
          {/* Year header */}
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-lg font-[family-name:var(--font-title)] text-deep-700">
              {year}
            </h2>
            <div className="flex-1 h-px bg-sky-200/20" />
          </div>

          {Array.from(months.entries()).map(([month, items]) => (
            <div key={month} className="mb-6">
              {/* Month header */}
              <div className="flex items-center gap-2 mb-4 pl-10">
                <div className="w-1.5 h-1.5 rounded-full bg-sky-300/40" />
                <span className="text-xs text-deep-400 font-[family-name:var(--font-body)]">
                  {getMonthName(month)}
                </span>
                <span className="text-[10px] text-deep-300">
                  ({items.length} 个记忆)
                </span>
              </div>

              {/* Items */}
              {items.map((memory) => {
                const idx = globalIndex++;
                return (
                  <TimelineItem
                    key={memory.id}
                    memory={memory}
                    index={idx}
                    onClick={() => {
                      selectMemory(memory.id);
                      router.push('/globe');
                    }}
                  />
                );
              })}
            </div>
          ))}
        </div>
      ))}

      {/* Footer */}
      <div className="flex items-center gap-3 mt-8">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-sky-200/20 to-transparent" />
        <span className="text-[10px] text-deep-300 font-[family-name:var(--font-body)]">
          {showFuture ? '愿所有的愿望都能抵达' : '愿每一段记忆都被好好珍藏'}
        </span>
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-sky-200/20 to-transparent" />
      </div>
    </div>
  );
}
