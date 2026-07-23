'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';

const Globe3D = dynamic(() => import('@/components/globe/Globe3D').then((m) => ({ default: m.Globe3D })), {
  ssr: false,
});

import { Button } from '@/components/ui/Button';

export default function HomePage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-screen px-6 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-sky-100 via-sky-50 to-white pointer-events-none" />

      {/* Globe background */}
      {mounted && (
        <div className="absolute inset-0 pointer-events-none opacity-30">
          <Globe3D className="w-full h-full" isInteractive={false} />
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-md">
        {/* Animated title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
          className="mb-3"
        >
          <h1 className="text-3xl sm:text-4xl font-[family-name:var(--font-title)] text-deep-800 tracking-wide">
            花与灵的记忆星球
          </h1>
        </motion.div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8, ease: 'easeOut' }}
          className="text-sm text-deep-400 leading-relaxed mb-8 font-[family-name:var(--font-body)] italic"
        >
          &ldquo;我们走过的每一处地方，都在世界上留下了一点光。&rdquo;
        </motion.p>

        {/* Enter button */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.3, ease: 'easeOut' }}
        >
          <Button
            variant="glass"
            size="lg"
            onClick={() => router.push('/globe')}
            className="text-base px-8"
          >
            进入我们的星球
          </Button>
        </motion.div>

        {/* Subtle footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 2 }}
          className="text-[10px] text-deep-300 mt-12 tracking-wider font-[family-name:var(--font-body)]"
        >
          Somewhere Only We Know
        </motion.p>
      </div>
    </div>
  );
}
