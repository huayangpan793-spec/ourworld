'use client';

import { useMemo, useState, useEffect } from 'react';
import { useMemoryStore } from '@/lib/store';

interface Petal {
  id: number;
  left: number;
  size: number;
  duration: number;
  delay: number;
  drift: number;
  opacity: number;
}

export function FloatingPetals({ count = 4 }: { count?: number }) {
  const [mounted, setMounted] = useState(false);
  const particleCount = useMemoryStore((s) => s.settings.particleCount);

  useEffect(() => {
    setMounted(true);
  }, []);

  const petals = useMemo<Petal[]>(() => {
    if (particleCount === 'off') return [];
    const scaled = particleCount === 'reduced' ? Math.max(1, Math.floor(count / 2)) : count;
    return Array.from({ length: scaled }, (_, i) => ({
      id: i,
      left: 5 + Math.random() * 90,
      size: 6 + Math.random() * 8,
      duration: 10 + Math.random() * 15,
      delay: Math.random() * 20,
      drift: 30 + Math.random() * 60,
      opacity: 0.2 + Math.random() * 0.25,
    }));
  }, [count, particleCount]);

  if (!mounted || particleCount === 'off') return null;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
      {petals.map((p) => (
        <div
          key={p.id}
          className="absolute"
          style={{
            left: `${p.left}%`,
            top: '-20px',
            width: `${p.size}px`,
            height: `${p.size * 1.3}px`,
            opacity: p.opacity,
            animation: `petal-fall ${p.duration}s ease-in ${p.delay}s infinite`,
            willChange: 'transform, opacity',
          }}
        >
          {/* Simplified petal shape */}
          <svg viewBox="0 0 20 26" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <path
              d="M10 2 C12 8 18 12 18 18 C18 24 12 24 10 24 C8 24 2 24 2 18 C2 12 8 8 10 2Z"
              fill="#F0DFAE"
              opacity={0.6}
            />
          </svg>
        </div>
      ))}
    </div>
  );
}
