'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { Memory, PLANET_COLORS, PlanetColor } from '@/lib/types';
import { useMemoryStore } from '@/lib/store';
import { PlanetIcon } from '@/components/ui/PlanetIcon';

interface MemoryNodeProps {
  position: [number, number, number];
  memory: Memory;
  isFuture: boolean;
  isAnniversary: boolean;
  hasPhotos: boolean;
}

export function MemoryNode({ position, memory, isFuture, isAnniversary }: MemoryNodeProps) {
  const groupRef = useRef<THREE.Group>(null);
  const selectMemory = useMemoryStore((s) => s.selectMemory);
  const selectedMemoryId = useMemoryStore((s) => s.selectedMemoryId);
  const isSelected = selectedMemoryId === memory.id;

  const planetKey = (memory.color || 'venus') as PlanetColor;
  const planet = PLANET_COLORS[planetKey] || PLANET_COLORS.venus;
  const rgb = planet.css;

  useFrame(({ camera }) => {
    if (!groupRef.current) return;
    groupRef.current.quaternion.copy(camera.quaternion);
    const breathe = Math.sin(Date.now() * 0.002) * 0.05 + 1;
    const s = (isSelected ? 0.42 : 0.28) * breathe * (isFuture ? 0.85 : 1);
    groupRef.current.scale.setScalar(s);
    groupRef.current.position.set(position[0], position[1], position[2]);
  });

  const handleClick = () => {
    selectMemory(memory.id);
  };

  const nodeSize = isSelected ? 52 : 36;
  const labelOffset = isSelected ? 58 : 42;

  return (
    <group ref={groupRef} position={position}>
      <Html center occlude={false} style={{ pointerEvents: 'auto', transform: 'translate(-50%, -50%)' }}>
        <button
          onClick={handleClick}
          style={{
            all: 'unset', display: 'block', cursor: 'pointer',
            width: `${nodeSize}px`, height: `${nodeSize}px`,
            position: 'relative',
          }}
          aria-label={memory.locationName}
        >
          {/* 选中光晕 */}
          {isSelected && (
            <div style={{
              position: 'absolute', inset: '-6px', borderRadius: '50%',
              background: `radial-gradient(circle, rgba(${rgb},0.3) 0%, transparent 70%)`,
              animation: 'none',
            }} />
          )}

          {/* 天体外壳 SVG */}
          <PlanetIcon planet={planetKey} size={nodeSize} glow={false} node />

          {/* 纪念日光环 */}
          {isAnniversary && (
            <div style={{
              position: 'absolute', inset: '-3px', borderRadius: '50%',
              border: '1.5px solid rgba(232,213,154,0.5)',
              pointerEvents: 'none',
            }} />
          )}
        </button>

        {/* 地点标签 */}
        <div style={{
          position: 'absolute', top: `${labelOffset}px`, left: '50%',
          transform: 'translateX(-50%)',
          background: `rgba(0,0,0,0.4)`,
          backdropFilter: 'blur(4px)',
          padding: '2px 10px', borderRadius: '12px',
          whiteSpace: 'nowrap', fontSize: '11px',
          color: '#FFFFFF', fontWeight: 500,
          pointerEvents: 'none',
          fontFamily: '"PingFang SC","Microsoft YaHei",sans-serif',
          border: '1px solid rgba(255,255,255,0.1)',
        }}>
          {memory.locationName}
        </div>
      </Html>
    </group>
  );
}
