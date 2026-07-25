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
  const syncToSupabase = useMemoryStore((s) => s.syncToSupabase);
  const loadFromSupabase = useMemoryStore((s) => s.loadFromSupabase);
  const reducedMotion = useMemoryStore((s) => s.settings.reducedMotion);
  const memories = useMemoryStore((s) => s.memories);

  // Load demo data on first visit
  useEffect(() => {
    loadDemoData();
  }, [loadDemoData]);

  // Sync data to Supabase, then load from Supabase to get other devices' data
  useEffect(() => {
    if (memories.length > 0) {
      const timer = setTimeout(async () => {
        await syncToSupabase();
        await loadFromSupabase();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [memories.length, syncToSupabase, loadFromSupabase]);

  // Periodic sync every 30 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      await syncToSupabase();
      await loadFromSupabase();
    }, 30000);
    return () => clearInterval(interval);
  }, [syncToSupabase, loadFromSupabase]);

  // Also try loading from Supabase on mount
  useEffect(() => {
    loadFromSupabase();
  }, [loadFromSupabase]);

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
