'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useMemoryStore } from '@/lib/store';

export function Toast() {
  const toast = useMemoryStore((s) => s.toast);

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 20, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: 10, x: '-50%' }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="fixed bottom-8 left-1/2 z-[60] pointer-events-none"
        >
          <div className="bg-white/70 backdrop-blur-md border border-sky-200/40 rounded-full px-6 py-3 shadow-md">
            <p className="text-sm text-deep-700 whitespace-nowrap font-[family-name:var(--font-body)]">
              {toast.message}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
