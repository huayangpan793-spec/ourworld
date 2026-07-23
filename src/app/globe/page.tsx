'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { AnimatePresence, motion } from 'framer-motion';
import { MapPin, ArrowLeft } from 'lucide-react';

const Globe3D = dynamic(() => import('@/components/globe/Globe3D').then((m) => ({ default: m.Globe3D })), {
  ssr: false,
});

import { GlobeControls } from '@/components/globe/GlobeControls';
import { MemoryDetail } from '@/components/memory/MemoryDetail';
import { useMemoryStore } from '@/lib/store';
import { Button } from '@/components/ui/Button';

export default function GlobePage() {
  const router = useRouter();
  const memories = useMemoryStore((s) => s.memories);
  const selectedMemoryId = useMemoryStore((s) => s.selectedMemoryId);
  const selectMemory = useMemoryStore((s) => s.selectMemory);
  const isAddingMode = useMemoryStore((s) => s.isAddingMode);
  const startAddMode = useMemoryStore((s) => s.startAddMode);
  const cancelAddMode = useMemoryStore((s) => s.cancelAddMode);
  const setPendingLocation = useMemoryStore((s) => s.setPendingLocation);
  const showDetailPanel = useMemoryStore((s) => s.showDetailPanel);
  const closeDetailPanel = useMemoryStore((s) => s.closeDetailPanel);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const selectedMemory = selectedMemoryId
    ? memories.find((m) => m.id === selectedMemoryId)
    : null;

  const handleGlobeClick = useCallback(
    (lat: number, lng: number) => {
      if (isAddingMode) {
        setPendingLocation({ lat, lng });
        router.push(`/add?lat=${lat.toFixed(4)}&lng=${lng.toFixed(4)}`);
        cancelAddMode();
      }
    },
    [isAddingMode, setPendingLocation, router, cancelAddMode]
  );

  return (
    <div className="flex-1 flex flex-col relative min-h-screen">
      {/* Back button */}
      <button
        onClick={() => router.push('/')}
        className="absolute top-4 left-4 z-20 p-2 rounded-xl bg-white/30 backdrop-blur-sm border border-white/40 text-deep-400 hover:text-deep-700 hover:bg-white/50 transition-all duration-300"
        aria-label="返回首页"
      >
        <ArrowLeft size={18} />
      </button>

      {/* Title */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
        <p className="text-xs text-deep-400/60 font-[family-name:var(--font-body)] text-center">
          转动地球，寻找我们曾经到达的地方
        </p>
      </div>

      {/* Add mode indicator */}
      <AnimatePresence>
        {isAddingMode && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-14 left-1/2 -translate-x-1/2 z-20 bg-white/70 backdrop-blur-md rounded-full px-5 py-2 border border-sky-200/30 shadow-sm"
          >
            <p className="text-xs text-deep-600 font-[family-name:var(--font-body)] flex items-center gap-2">
              <MapPin size={14} className="text-gold-300" />
              请在地球上点击你想添加记忆的位置
              <button
                onClick={cancelAddMode}
                className="text-deep-400 hover:text-deep-700 underline ml-1"
              >
                取消
              </button>
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop layout: Globe + Detail side by side */}
      <div className="flex-1 flex relative">
        {/* Globe area */}
        <div className={`flex-1 relative ${showDetailPanel && selectedMemory ? 'hidden lg:block' : ''}`}>
          {mounted && (
            <Globe3D
              className="w-full h-full min-h-[60vh] lg:min-h-screen"
              onGlobeClick={handleGlobeClick}
              isInteractive={true}
            />
          )}

          {/* Empty state overlay */}
          {memories.filter((m) => !m.isHidden).length === 0 && !isAddingMode && mounted && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center bg-white/30 backdrop-blur-sm rounded-2xl px-6 py-4 max-w-xs">
                <p className="text-sm text-deep-400 font-[family-name:var(--font-body)]">
                  这里还没有被点亮。也许，我们的下一段故事会从这里开始。
                </p>
                <Button
                  variant="glass"
                  size="sm"
                  onClick={startAddMode}
                  className="mt-3 pointer-events-auto"
                >
                  点亮第一个坐标
                </Button>
              </div>
            </div>
          )}

          {/* Controls */}
          <GlobeControls />
        </div>

        {/* Detail panel (desktop right sidebar) */}
        <AnimatePresence>
          {showDetailPanel && selectedMemory && (
            <motion.div
              key={selectedMemory.id}
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 300 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="hidden lg:block w-[380px] xl:w-[420px] border-l border-sky-200/20 bg-white/30 backdrop-blur-sm overflow-y-auto"
            >
              <MemoryDetail
                memory={selectedMemory}
                onClose={closeDetailPanel}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile detail panel (bottom sheet) */}
        <AnimatePresence>
          {showDetailPanel && selectedMemory && (
            <motion.div
              key={selectedMemory.id}
              initial={{ opacity: 0, y: '100%' }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: '100%' }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="lg:hidden fixed inset-x-0 bottom-0 top-[30vh] z-30 rounded-t-2xl overflow-hidden bg-white/60 backdrop-blur-lg border-t border-sky-200/20 shadow-xl"
            >
              <MemoryDetail
                memory={selectedMemory}
                onClose={closeDetailPanel}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile add button */}
      <button
        onClick={startAddMode}
        className="lg:hidden fixed bottom-20 right-5 z-20 w-12 h-12 rounded-full bg-white/70 backdrop-blur-md border border-white/50 shadow-md flex items-center justify-center text-deep-400 hover:text-deep-700 transition-all active:scale-95"
        aria-label="添加记忆"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M10 4V16M4 10H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}
