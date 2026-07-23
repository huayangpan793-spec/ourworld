'use client';

import { useEffect, useState } from 'react';

export function CursorGlow() {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Only on desktop (pointer with fine accuracy)
    const isTouch = matchMedia('(pointer: coarse)').matches;
    if (isTouch) return;

    const handleMove = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY });
      if (!visible) setVisible(true);
    };

    const handleLeave = () => setVisible(false);
    const handleEnter = () => setVisible(true);

    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseleave', handleLeave);
    document.addEventListener('mouseenter', handleEnter);

    return () => {
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseleave', handleLeave);
      document.removeEventListener('mouseenter', handleEnter);
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 pointer-events-none z-[9999]"
      aria-hidden="true"
    >
      <div
        className="absolute rounded-full"
        style={{
          left: pos.x - 75,
          top: pos.y - 75,
          width: 150,
          height: 150,
          background:
            'radial-gradient(circle at center, rgba(232, 213, 154, 0.06) 0%, transparent 70%)',
          transform: 'translate(0, 0)',
          willChange: 'left, top',
        }}
      />
    </div>
  );
}
