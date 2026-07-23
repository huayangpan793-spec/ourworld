'use client';

import { RotateCw, Plus, List, MapPin } from 'lucide-react';
import { useMemoryStore } from '@/lib/store';
import { useRouter } from 'next/navigation';

export function GlobeControls() {
  const router = useRouter();
  const settings = useMemoryStore((s) => s.settings);
  const updateSettings = useMemoryStore((s) => s.updateSettings);
  const startAddMode = useMemoryStore((s) => s.startAddMode);
  const memories = useMemoryStore((s) => s.memories);

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10">
      <div className="flex items-center gap-2 bg-white/40 backdrop-blur-md rounded-2xl px-3 py-2 border border-white/50 shadow-sm">
        {/* Add memory */}
        <button
          onClick={startAddMode}
          className="p-2.5 rounded-xl text-deep-400 hover:text-deep-700 hover:bg-white/50 transition-all duration-300"
          title="添加记忆"
          aria-label="添加记忆"
        >
          <Plus size={18} />
        </button>

        {/* Separator */}
        <div className="w-px h-5 bg-sky-200/40" />

        {/* Auto-rotate toggle */}
        <button
          onClick={() => updateSettings({ autoRotate: !settings.autoRotate })}
          className={`p-2.5 rounded-xl transition-all duration-300 ${
            settings.autoRotate
              ? 'text-gold-300 bg-white/40'
              : 'text-deep-400 hover:text-deep-700 hover:bg-white/50'
          }`}
          title={settings.autoRotate ? '暂停自动旋转' : '开启自动旋转'}
          aria-label={settings.autoRotate ? '暂停自动旋转' : '开启自动旋转'}
        >
          <RotateCw size={18} className={settings.autoRotate ? 'animate-spin' : ''} style={settings.autoRotate ? { animationDuration: '8s' } : undefined} />
        </button>

        {/* Separator */}
        <div className="w-px h-5 bg-sky-200/40" />

        {/* View all memories */}
        <button
          onClick={() => router.push('/memories')}
          className="p-2.5 rounded-xl text-deep-400 hover:text-deep-700 hover:bg-white/50 transition-all duration-300"
          title="全部记忆"
          aria-label="全部记忆"
        >
          <List size={18} />
        </button>

        {/* Separator */}
        <div className="w-px h-5 bg-sky-200/40" />

        {/* Memory count */}
        <div className="px-2 text-xs text-deep-400 font-[family-name:var(--font-body)] whitespace-nowrap">
          {memories.filter((m) => !m.isHidden && m.visitedStatus === 'visited').length} 个记忆
        </div>
      </div>
    </div>
  );
}
