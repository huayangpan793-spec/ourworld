'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, MapPin, Calendar, Heart, Star } from 'lucide-react';
import { TimelineView } from '@/components/timeline/TimelineView';
import { Button } from '@/components/ui/Button';
import { useMemoryStore } from '@/lib/store';
import { formatDate } from '@/lib/utils';

export default function FuturePage() {
  const router = useRouter();
  const memories = useMemoryStore((s) => s.memories);
  const updateMemory = useMemoryStore((s) => s.updateMemory);
  const showToast = useMemoryStore((s) => s.showToast);

  const futureMemories = memories
    .filter((m) => !m.isHidden && m.visitedStatus === 'future')
    .sort((a, b) => a.date.localeCompare(b.date));

  const handleConvertToVisited = (id: string) => {
    updateMemory(id, { visitedStatus: 'visited' });
    showToast('愿望已实现！现在可以添加照片和故事了。');
    router.push(`/edit/${id}`);
  };

  return (
    <div className="flex-1 min-h-screen bg-gradient-to-b from-sky-100 via-sky-50 to-white">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white/40 backdrop-blur-md border-b border-sky-200/20">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg text-deep-400 hover:text-deep-700 hover:bg-white/50 transition-colors"
            aria-label="返回"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-base font-[family-name:var(--font-title)] text-deep-700">
            未来之约
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Decorative header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Star size={16} className="text-gold-300" />
            <span className="text-xs text-deep-400 font-[family-name:var(--font-body)]">
              还未抵达的地方，也可以先放进我们的未来
            </span>
            <Star size={16} className="text-gold-300" />
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-sky-200/30 to-transparent" />
          </div>
        </div>

        {futureMemories.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-sky-100/60 flex items-center justify-center mx-auto mb-4">
              <Star size={24} className="text-sky-400" />
            </div>
            <p className="text-deep-400 font-[family-name:var(--font-body)] mb-2">还没有未来的计划</p>
            <p className="text-xs text-deep-300 font-[family-name:var(--font-body)] mb-6">
              在地球上选择一个坐标，把想去的地方先放进来
            </p>
            <Button variant="glass" size="md" onClick={() => router.push('/globe')}>
              去地球看看
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {futureMemories.map((memory) => (
              <div
                key={memory.id}
                className="bg-white/50 backdrop-blur-sm rounded-xl border border-sky-200/20 p-5 hover:bg-white/70 hover:border-sky-200/40 transition-all duration-300"
              >
                <div className="flex gap-4">
                  {/* Future icon */}
                  <div className="w-12 h-12 rounded-full border-2 border-sky-300/40 flex items-center justify-center shrink-0">
                    <Star size={16} className="text-sky-400" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-deep-700 mb-1">{memory.title}</h3>

                    <div className="flex items-center gap-3 text-xs text-deep-400 mb-2 flex-wrap">
                      <span className="flex items-center gap-1">
                        <MapPin size={10} />
                        {memory.locationName}
                      </span>
                      {memory.city && (
                        <span>{memory.city}</span>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar size={10} />
                        {formatDate(memory.date)}
                      </span>
                    </div>

                    {memory.summary && (
                      <p className="text-xs text-deep-400/80 leading-relaxed mb-3 font-[family-name:var(--font-body)]">
                        {memory.summary}
                      </p>
                    )}

                    {/* Action */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleConvertToVisited(memory.id)}
                        className="text-xs px-3 py-1.5 rounded-lg bg-gold-100/40 border border-gold-200/30 text-deep-600 hover:bg-gold-100/60 transition-all flex items-center gap-1"
                      >
                        <Heart size={11} />
                        标记为已到达
                      </button>
                      <button
                        onClick={() => router.push(`/edit/${memory.id}`)}
                        className="text-xs px-3 py-1.5 rounded-lg border border-sky-200/20 text-deep-400 hover:text-deep-700 hover:bg-white/50 transition-all"
                      >
                        编辑
                      </button>
                    </div>
                  </div>
                </div>

                {/* Tags */}
                {memory.tags.length > 0 && (
                  <div className="flex gap-1.5 mt-3 flex-wrap">
                    {memory.tags.map((tag) => (
                      <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-sky-100/30 text-deep-400">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-[10px] text-deep-300 font-[family-name:var(--font-body)]">
            愿所有的愿望都能抵达
          </p>
        </div>
      </div>
    </div>
  );
}
