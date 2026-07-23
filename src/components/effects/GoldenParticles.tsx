'use client';

import { useEffect, useRef, useMemo } from 'react';
import { useMemoryStore } from '@/lib/store';

interface Particle {
  x: number;
  y: number;
  size: number;
  opacity: number;
  duration: number;
  delay: number;
  driftX: number;
  driftY: number;
}

export function GoldenParticles({ count = 15, className = '' }: { count?: number; className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const particleCount = useMemoryStore((s) => s.settings.particleCount);

  const particles = useMemo<Particle[]>(() => {
    if (particleCount === 'off') return [];
    const scaled = particleCount === 'reduced' ? Math.max(3, Math.floor(count / 3)) : count;
    return Array.from({ length: scaled }, (_, i) => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 1.5 + Math.random() * 2.5,
      opacity: 0.15 + Math.random() * 0.3,
      duration: 3 + Math.random() * 4,
      delay: Math.random() * 5,
      driftX: (Math.random() - 0.5) * 20,
      driftY: (Math.random() - 0.5) * 10,
    }));
  }, [count, particleCount]);

  if (particleCount === 'off') return null;

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 pointer-events-none overflow-hidden z-0 ${className}`}
      aria-hidden="true"
    >
      {particles.map((p, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: '#E8D59A',
            opacity: 0,
            boxShadow: '0 0 3px rgba(232, 213, 154, 0.4)',
            animation: `sparkle ${p.duration}s ease-in-out ${p.delay}s infinite`,
            willChange: 'opacity, transform',
          }}
        />
      ))}
    </div>
  );
}
