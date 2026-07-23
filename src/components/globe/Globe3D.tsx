'use client';

import { useRef, useMemo, useCallback, Suspense, useEffect, useState } from 'react';
import { Canvas, useFrame, ThreeEvent } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { MemoryNode } from './MemoryNode';
import { useMemoryStore } from '@/lib/store';

const EARTH_RADIUS = 2;

// ─── Procedural Fallback Texture ───
function createProceduralTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;
  const grad = ctx.createLinearGradient(0, 0, 0, 512);
  grad.addColorStop(0, '#C8E0EC');
  grad.addColorStop(0.25, '#A8D0E4');
  grad.addColorStop(0.5, '#98C8DC');
  grad.addColorStop(0.75, '#A8D0E4');
  grad.addColorStop(1, '#C0D8E6');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 512);
  const continents = [
    { x: 150, y: 170, w: 110, h: 85 }, { x: 170, y: 180, w: 75, h: 55 },
    { x: 240, y: 280, w: 38, h: 115 }, { x: 245, y: 270, w: 28, h: 95 },
    { x: 480, y: 160, w: 55, h: 38 }, { x: 490, y: 165, w: 38, h: 28 },
    { x: 490, y: 220, w: 55, h: 115 }, { x: 495, y: 230, w: 45, h: 95 },
    { x: 560, y: 150, w: 190, h: 95 }, { x: 580, y: 160, w: 150, h: 75 },
    { x: 620, y: 170, w: 110, h: 55 }, { x: 780, y: 330, w: 45, h: 38 },
    { x: 320, y: 110, w: 38, h: 48 },
  ];
  continents.forEach((c) => {
    ctx.fillStyle = 'rgba(230, 242, 250, 0.6)';
    ctx.beginPath(); ctx.ellipse(c.x, c.y, c.w / 2, c.h / 2, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(216, 236, 248, 0.4)';
    ctx.beginPath(); ctx.ellipse(c.x + 5, c.y - 5, c.w / 2.5, c.h / 2.5, 0.2, 0, Math.PI * 2); ctx.fill();
  });
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  return tex;
}

// ─── Texture Loader ───
function EarthTexture({ onReady }: { onReady: (tex: THREE.Texture, bump?: THREE.Texture, spec?: THREE.Texture) => void }) {
  useEffect(() => {
    const loader = new THREE.TextureLoader();
    let loaded = 0;
    let earthTex: THREE.Texture | undefined;
    let bumpTex: THREE.Texture | undefined;
    let specTex: THREE.Texture | undefined;
    const checkDone = () => {
      loaded++;
      if (loaded >= 3 && earthTex) onReady(earthTex, bumpTex, specTex);
    };
    loader.load('https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg', (t) => { earthTex = t; checkDone(); }, undefined, () => checkDone());
    loader.load('https://threejs.org/examples/textures/planets/earth_normal_2048.jpg', (t) => { bumpTex = t; checkDone(); }, undefined, () => checkDone());
    loader.load('https://threejs.org/examples/textures/planets/earth_specular_2048.jpg', (t) => { specTex = t; checkDone(); }, undefined, () => checkDone());
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
        {/* Earth */}
        <mesh onClick={handleClick} onPointerDown={handlePointerDown} onPointerUp={handlePointerUp}>
          <sphereGeometry args={[EARTH_RADIUS, 64, 64]} />
          <meshPhongMaterial
            map={finalTexture}
            bumpMap={loadedBump}
            bumpScale={0.015}
            specularMap={loadedSpec}
            specular={new THREE.Color('#555555')}
            shininess={8}
            emissive="#B0D4E8"
            emissiveIntensity={0.15}
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

      {/* Lighting (static) */}
      <ambientLight intensity={0.7} color="#E8F4FA" />
      <directionalLight position={[5, 3, 5]} intensity={1.2} color="#FFF8F0" />
      <directionalLight position={[-3, -1, -5]} intensity={0.3} color="#A8D0E4" />
      <hemisphereLight args={['#B0D4E8', '#203050', 0.4]} />
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
