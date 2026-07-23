'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { useMemoryStore } from '@/lib/store';
import { Toast } from '@/components/ui/Toast';
import { PasswordGate } from '@/components/ui/PasswordGate';
import { GoldenParticles } from '@/components/effects/GoldenParticles';
import { FloatingPetals } from '@/components/effects/FloatingPetals';
import { CursorGlow } from '@/components/effects/CursorGlow';

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const loadDemoData = useMemoryStore((s) => s.loadDemoData);
  const reducedMotion = useMemoryStore((s) => s.settings.reducedMotion);

  // Load demo data on first visit
  useEffect(() => {
    loadDemoData();
  }, [loadDemoData]);

  // Listen for reduced motion preference
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.matches && !reducedMotion) {
      useMemoryStore.getState().updateSettings({ reducedMotion: true });
    }
  }, [reducedMotion]);

  return (
    <>
      {/* Background effects */}
      <GoldenParticles count={12} />
      <FloatingPetals count={3} />
      <CursorGlow />

      {/* Password protection gate */}
      <PasswordGate>
        {/* Page content with transitions */}
        <AnimatePresence mode="wait">
          <motion.main
            key={pathname}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            className="flex-1 flex flex-col"
          >
            {children}
          </motion.main>
        </AnimatePresence>
      </PasswordGate>

      {/* Toast notifications */}
      <Toast />
    </>
  );
}
