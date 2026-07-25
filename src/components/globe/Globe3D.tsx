'use client';

import { useRef, useMemo, useCallback, Suspense, useEffect, useState } from 'react';
import { Canvas, useFrame, ThreeEvent } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { MemoryNode } from './MemoryNode';
import { useMemoryStore } from '@/lib/store';

const EARTH_RADIUS = 2;

// ─── High Quality Procedural Texture ───
function createProceduralTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  // Ocean — vibrant blue gradient with variation
  const grad = ctx.createLinearGradient(0, 0, 0, 1024);
  grad.addColorStop(0, '#7CB8D8');
  grad.addColorStop(0.15, '#5DA0C4');
  grad.addColorStop(0.35, '#4A90B8');
  grad.addColorStop(0.5, '#3E84B0');
  grad.addColorStop(0.65, '#4A90B8');
  grad.addColorStop(0.85, '#5DA0C4');
  grad.addColorStop(1, '#7CB8D8');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 2048, 1024);

  // Ocean depth variation — subtle wave patterns
  for (let i = 0; i < 200; i++) {
    const x = Math.random() * 2048, y = Math.random() * 1024;
    const r = 30 + Math.random() * 100;
    const alpha = 0.02 + Math.random() * 0.04;
    ctx.fillStyle = `rgba(${Math.random() > 0.5 ? '60,140,180' : '100,170,200'},${alpha})`;
    ctx.beginPath(); ctx.ellipse(x, y, r, r * 0.3, Math.random() * Math.PI, 0, Math.PI * 2); ctx.fill();
  }

  // Detailed continents with varied terrain colors
  const continentData = [
    // North America
    { x: 320, y: 340, shapes: [{ x: 0, y: 0, w: 220, h: 160 }, { x: 40, y: 20, w: 150, h: 100 }, { x: -20, y: 40, w: 100, h: 80 }], land: '#6AAA7A', sand: '#C8B878', mountain: '#8A9A7A' },
    // South America
    { x: 490, y: 560, shapes: [{ x: 0, y: 0, w: 70, h: 220 }, { x: -10, y: 30, w: 55, h: 180 }], land: '#5AAA6A', sand: '#B8A868', mountain: '#7A8A6A' },
    // Europe
    { x: 970, y: 330, shapes: [{ x: 0, y: 0, w: 110, h: 70 }, { x: 20, y: 10, w: 70, h: 50 }], land: '#7ABA7A', sand: '#C8B870', mountain: '#9AAA7A' },
    // Africa
    { x: 980, y: 450, shapes: [{ x: 0, y: 0, w: 110, h: 220 }, { x: 10, y: 20, w: 90, h: 180 }], land: '#8ABA6A', sand: '#D4C060', mountain: '#9A9A6A' },
    // Asia (large)
    { x: 1140, y: 320, shapes: [{ x: 0, y: 0, w: 380, h: 180 }, { x: 40, y: 20, w: 300, h: 140 }, { x: -20, y: 40, w: 200, h: 100 }], land: '#6ABA7A', sand: '#C8B060', mountain: '#8A9A7A' },
    // India
    { x: 1260, y: 440, shapes: [{ x: 0, y: 0, w: 50, h: 80 }], land: '#5AAA6A', sand: '#C0A860', mountain: '#7A9A7A' },
    // Southeast Asia
    { x: 1440, y: 430, shapes: [{ x: 0, y: 0, w: 80, h: 60 }, { x: 20, y: 10, w: 50, h: 40 }], land: '#6AAA7A', sand: '#B8A868', mountain: '#8A9A7A' },
    // Australia
    { x: 1580, y: 660, shapes: [{ x: 0, y: 0, w: 90, h: 70 }, { x: 10, y: 10, w: 70, h: 50 }], land: '#C8A868', sand: '#D4B870', mountain: '#9A8A6A' },
    // Greenland
    { x: 660, y: 230, shapes: [{ x: 0, y: 0, w: 70, h: 90 }], land: '#B8C8D0', sand: '#C8D0D8', mountain: '#A8B8C0' },
  ];

  continentData.forEach((c) => {
    c.shapes.forEach((s) => {
      const cx = c.x + s.x, cy = c.y + s.y;

      // Base land color
      ctx.fillStyle = c.land;
      ctx.beginPath(); ctx.ellipse(cx, cy, s.w / 2, s.h / 2, 0, 0, Math.PI * 2); ctx.fill();

      // Sand/desert variation (south side)
      ctx.fillStyle = c.sand;
      ctx.globalAlpha = 0.3;
      ctx.beginPath(); ctx.ellipse(cx + s.w * 0.1, cy + s.h * 0.2, s.w * 0.35, s.h * 0.2, 0.2, 0, Math.PI * 2); ctx.fill();

      // Mountain/forest (north side)
      ctx.fillStyle = c.mountain;
      ctx.globalAlpha = 0.25;
      ctx.beginPath(); ctx.ellipse(cx - s.w * 0.05, cy - s.h * 0.15, s.w * 0.3, s.h * 0.15, -0.1, 0, Math.PI * 2); ctx.fill();

      // Lighter highlight
      ctx.fillStyle = c.land;
      ctx.globalAlpha = 0.15;
      ctx.beginPath(); ctx.ellipse(cx - s.w * 0.1, cy - s.h * 0.1, s.w * 0.4, s.h * 0.2, -0.2, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1;
    });
  });

  // Ice caps
  const iceGrad = ctx.createRadialGradient(1024, 0, 0, 1024, 0, 200);
  iceGrad.addColorStop(0, 'rgba(220,235,245,0.4)');
  iceGrad.addColorStop(1, 'rgba(220,235,245,0)');
  ctx.fillStyle = iceGrad;
  ctx.fillRect(0, 0, 2048, 200);

  const iceGrad2 = ctx.createRadialGradient(1024, 1024, 0, 1024, 1024, 200);
  iceGrad2.addColorStop(0, 'rgba(220,235,245,0.35)');
  iceGrad2.addColorStop(1, 'rgba(220,235,245,0)');
  ctx.fillStyle = iceGrad2;
  ctx.fillRect(0, 824, 2048, 200);

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  return tex;
}

// ─── Texture Loader (multi-source fallback) ───
const TEX_URLS = [
  'https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg',
  'https://unpkg.com/three-globe@2.31.0/example/img/earth-blue-marble.jpg',
];

function EarthTexture({ onReady }: { onReady: (tex: THREE.Texture, bump?: THREE.Texture, spec?: THREE.Texture) => void }) {
  useEffect(() => {
    const loader = new THREE.TextureLoader();
    let attempts = 0;

    function tryLoad() {
      if (attempts >= TEX_URLS.length) return;
      loader.load(TEX_URLS[attempts],
        (t) => onReady(t, undefined, undefined),
        undefined,
        () => { attempts++; tryLoad(); }
      );
    }
    tryLoad();
  }, [onReady]);
  return null;
}

// ─── Starfield ───
function Starfield() {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const arr = new Float32Array(3000 * 3);
    for (let i = 0; i < 3000; i++) {
      const r = 15 + Math.random() * 30;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.cos(phi);
      arr[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    return arr;
  }, []);

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute args={[positions, 3]} attach="attributes-position" count={3000} />
      </bufferGeometry>
      <pointsMaterial size={0.06} color="#A8C8E0" transparent opacity={0.7} sizeAttenuation depthWrite={false} />
    </points>
  );
}

// ─── Shooting Star ───
function ShootingStars() {
  const groupRef = useRef<THREE.Group>(null);
  const lines = useMemo(() => {
    const arr: { start: number[]; end: number[]; speed: number; delay: number }[] = [];
    for (let i = 0; i < 5; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 10 + Math.random() * 15;
      const start = [r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta)];
      const dir = [Math.cos(theta + 0.5) * 2, -Math.abs(Math.sin(phi)) * 2, Math.sin(theta + 0.5) * 2];
      const end = [start[0] + dir[0], start[1] + dir[1], start[2] + dir[2]];
      arr.push({ start, end, speed: 0.5 + Math.random() * 0.8, delay: 3 + Math.random() * 10 });
    }
    return arr;
  }, []);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    groupRef.current.children.forEach((child, i) => {
      const m = lines[i];
      if (!m) return;
      const cycle = (t + m.delay) % (5 / m.speed);
      const norm = Math.min(cycle / 0.3, 1) * Math.max(0, 1 - ((cycle - 0.3) / (5 / m.speed - 0.3)));
      child.scale.setScalar(norm);
      child.visible = cycle < 0.5;
    });
  });

  return (
    <group ref={groupRef}>
      {lines.map((m, i) => (
        <line key={i}>
          <bufferGeometry>
            <bufferAttribute
              args={[new Float32Array([...m.start, ...m.end]), 3]}
              attach="attributes-position"
              count={2}
            />
          </bufferGeometry>
          <lineBasicMaterial color="#C8E0F0" transparent opacity={0.6} linewidth={1} />
        </line>
      ))}
    </group>
  );
}

// ─── Atmosphere Glow (brighter, wider) ───
function Atmosphere() {
  return (
    <>
      {/* Outer soft glow */}
      <mesh scale={[1.08, 1.08, 1.08]}>
        <sphereGeometry args={[EARTH_RADIUS, 48, 48]} />
        <meshBasicMaterial color="#7AB3CF" transparent opacity={0.06} side={THREE.BackSide} />
      </mesh>
      {/* Mid glow */}
      <mesh scale={[1.04, 1.04, 1.04]}>
        <sphereGeometry args={[EARTH_RADIUS, 48, 48]} />
        <meshBasicMaterial color="#9ECBE3" transparent opacity={0.08} side={THREE.BackSide} />
      </mesh>
      {/* Inner rim light */}
      <mesh scale={[1.015, 1.015, 1.015]}>
        <sphereGeometry args={[EARTH_RADIUS, 48, 48]} />
        <meshBasicMaterial color="#B8D8EA" transparent opacity={0.12} side={THREE.BackSide} />
      </mesh>
    </>
  );
}

// ─── Earth Sphere ───
function Earth({ onGlobeClick }: { onGlobeClick?: (lat: number, lng: number) => void }) {
  const pivotRef = useRef<THREE.Group>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);
  const autoRotate = useMemoryStore((s) => s.settings.autoRotate);
  const isInteracting = useRef(false);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [loadedTex, setLoadedTex] = useState<THREE.Texture | null>(null);
  const [loadedBump, setLoadedBump] = useState<THREE.Texture | undefined>();
  const [loadedSpec, setLoadedSpec] = useState<THREE.Texture | undefined>();

  const proceduralTex = useMemo(() => createProceduralTexture(), []);
  const finalTexture = loadedTex || proceduralTex;

  const handleTexturesReady = useCallback((tex: THREE.Texture, bump?: THREE.Texture, spec?: THREE.Texture) => {
    setLoadedTex(tex);
    setLoadedBump(bump);
    setLoadedSpec(spec);
  }, []);

  const cloudTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * 1024, y = Math.random() * 512;
      const r = 20 + Math.random() * 70;
      ctx.fillStyle = `rgba(255,255,255,${0.06 + Math.random() * 0.12})`;
      ctx.beginPath();
      ctx.ellipse(x, y, r, r * 0.5, Math.random() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    return tex;
  }, []);

  // Rotate the pivot group so earth + clouds + nodes rotate together
  useFrame((_, delta) => {
    if (pivotRef.current && autoRotate && !isInteracting.current) {
      pivotRef.current.rotation.y += delta * 0.06;
    }
    // Clouds rotate slightly faster for parallax effect
    if (cloudsRef.current && autoRotate && !isInteracting.current) {
      cloudsRef.current.rotation.y += delta * 0.015;
    }
  });

  const handlePointerDown = useCallback(() => {
    isInteracting.current = true;
    if (idleTimer.current) clearTimeout(idleTimer.current);
  }, []);

  const handlePointerUp = useCallback(() => {
    idleTimer.current = setTimeout(() => { isInteracting.current = false; }, 4000);
  }, []);

  const handleClick = useCallback((e: ThreeEvent<MouseEvent>) => {
    if (!onGlobeClick) return;
    e.stopPropagation();
    const p = e.point.clone().normalize();
    const lat = Math.asin(p.y) * (180 / Math.PI);
    const lng = Math.atan2(-p.x, -p.z) * (180 / Math.PI);
    onGlobeClick(lat, lng);
  }, [onGlobeClick]);

  const memories = useMemoryStore((s) => s.memories);

  return (
    <group>
      <EarthTexture onReady={handleTexturesReady} />

      {/* Static atmosphere (doesn't rotate) */}
      <Atmosphere />

      {/* Pivot group — rotates earth + clouds + nodes together */}
      <group ref={pivotRef}>
        {/* Earth — bright & vibrant */}
        <mesh onClick={handleClick} onPointerDown={handlePointerDown} onPointerUp={handlePointerUp}>
          <sphereGeometry args={[EARTH_RADIUS, 64, 64]} />
          <meshPhongMaterial
            map={finalTexture}
            bumpMap={loadedBump}
            bumpScale={0.01}
            specularMap={loadedSpec}
            specular={new THREE.Color('#CCCCCC')}
            shininess={15}
            emissive="#C0E0F0"
            emissiveIntensity={0.2}
          />
        </mesh>

        {/* Clouds (separate ref for extra rotation) */}
        <mesh ref={cloudsRef} scale={[1.008, 1.008, 1.008]}>
          <sphereGeometry args={[EARTH_RADIUS, 32, 32]} />
          <meshBasicMaterial map={cloudTexture} transparent depthWrite={false} opacity={0.3} />
        </mesh>

        {/* Memory nodes — now rotating with the earth! */}
        {memories.filter((m) => !m.isHidden).map((memory) => {
          const phi = (90 - memory.latitude) * (Math.PI / 180);
          const theta = (memory.longitude + 180) * (Math.PI / 180);
          const r = EARTH_RADIUS + 0.03;
          const x = -r * Math.sin(phi) * Math.cos(theta);
          const y = r * Math.cos(phi);
          const z = r * Math.sin(phi) * Math.cos(theta);
          return (
            <MemoryNode key={memory.id} position={[x, y, z]} memory={memory}
              isFuture={memory.visitedStatus === 'future'}
              isAnniversary={memory.anniversary}
              hasPhotos={memory.photos.length > 0}
            />
          );
        })}
      </group>

      {/* Lighting — bright & warm */}
      <ambientLight intensity={0.8} color="#E8F4FA" />
      <directionalLight position={[8, 5, 6]} intensity={1.5} color="#FFF8E8" />
      <directionalLight position={[-4, -2, -6]} intensity={0.4} color="#C0D8E8" />
      <hemisphereLight args={['#C0E0F0', '#406080', 0.5]} />
    </group>
  );
}

// ─── Scene ───
function Scene({ onGlobeClick }: { onGlobeClick?: (lat: number, lng: number) => void }) {
  return (
    <>
      <Starfield />
      <ShootingStars />
      <Earth onGlobeClick={onGlobeClick} />
      <OrbitControls
        enablePan={false} enableZoom={true}
        minDistance={2.8} maxDistance={12}
        rotateSpeed={0.4} zoomSpeed={0.6}
        dampingFactor={0.06} autoRotate={false}
      />
    </>
  );
}

// ─── Globe Wrapper ───
interface Globe3DProps {
  className?: string;
  onGlobeClick?: (lat: number, lng: number) => void;
  isInteractive?: boolean;
}

export function Globe3D({ className = '', onGlobeClick, isInteractive = true }: Globe3DProps) {
  return (
    // Dark container background for the starfield
    <div className={`relative ${className}`} style={{ background: 'radial-gradient(ellipse at center, #0A1628 0%, #050810 100%)' }}>
      <Canvas
        camera={{ position: [0, 0, 5.5], fov: 40, near: 0.1, far: 50 }}
        gl={{ alpha: true, antialias: true }}
        style={{ background: 'transparent' }}
        dpr={[1, 1.5]}
      >
        <Suspense fallback={null}>
          <Scene onGlobeClick={isInteractive ? onGlobeClick : undefined} />
        </Suspense>
      </Canvas>
    </div>
  );
}
