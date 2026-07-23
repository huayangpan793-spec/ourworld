'use client';

import { use, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMemoryStore } from '@/lib/store';
import { MemoryDetail } from '@/components/memory/MemoryDetail';
import { ArrowLeft } from 'lucide-react';

export default function MemoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const memory = useMemoryStore((s) => s.memories.find((m) => m.id === id));
  const selectMemory = useMemoryStore((s) => s.selectMemory);

  useEffect(() => {
    selectMemory(id);
  }, [id, selectMemory]);

  if (!memory) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-gradient-to-b from-sky-100 via-sky-50 to-white">
        <div className="text-center">
          <p className="text-deep-400 mb-4 font-[family-name:var(--font-body)]">加载中...</p>
          <button onClick={() => router.push('/globe')} className="text-sm text-sky-500 hover:text-sky-600 underline">返回记忆星球</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-screen bg-gradient-to-b from-sky-100 via-sky-50 to-white">
      <div className="sticky top-0 z-20 bg-white/40 backdrop-blur-md border-b border-sky-200/20">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 rounded-lg text-deep-400 hover:text-deep-700 hover:bg-white/50 transition-colors" aria-label="返回">
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-base font-[family-name:var(--font-title)] text-deep-700">{memory.title}</h1>
        </div>
      </div>
      <div className="max-w-lg mx-auto px-4 py-6">
        <MemoryDetail memory={memory} onClose={() => router.push('/globe')} />
      </div>
    </div>
  );
}
