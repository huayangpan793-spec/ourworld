'use client';

import { PLANET_COLORS, PlanetColor } from '@/lib/types';

interface PlanetIconProps {
  planet: PlanetColor;
  size?: number;
  glow?: boolean;
  /** node 模式：用于地球上的标记，更紧凑 */
  node?: boolean;
}

const SVG_MAP: Record<string, (c: string, s: number, rgb: string) => React.ReactNode> = {

  mercury: (c, s, rgb) => (
    <g>
      {Array.from({ length: 14 }).map((_, i) => {
        const a = (i / 14) * Math.PI * 2;
        const r = s * 0.42;
        const sz = 0.8 + (i % 3) * 0.4;
        return <circle key={i} cx={s / 2 + Math.cos(a) * r} cy={s / 2 + Math.sin(a) * r} r={sz} fill={`rgba(${rgb},0.5)`} opacity={0.3 + (i % 3) * 0.2} />;
      })}
      <radialGradient id={`m-g-${planetId}`} cx="40%" cy="35%"><stop offset="0%" stopColor="#E8E8E8" /><stop offset="60%" stopColor={c} /><stop offset="100%" stopColor="#808080" /></radialGradient>
      <circle cx={s / 2} cy={s / 2} r={s * 0.28} fill={`url(#m-g-${planetId})`} />
      <ellipse cx={s * 0.44} cy={s * 0.42} rx={s * 0.1} ry={s * 0.06} fill="white" opacity={0.25} />
    </g>
  ),

  venus: (c, s, rgb) => (
    <g>
      <radialGradient id={`v-g-${planetId}`} cx="50%" cy="50%"><stop offset="55%" stopColor={`rgba(${rgb},0.35)`} /><stop offset="80%" stopColor={`rgba(${rgb},0.1)`} /><stop offset="100%" stopColor="transparent" /></radialGradient>
      <circle cx={s / 2} cy={s / 2} r={s * 0.55} fill={`url(#v-g-${planetId})`} />
      <radialGradient id={`v-b-${planetId}`} cx="40%" cy="35%"><stop offset="0%" stopColor="#FFF5E0" /><stop offset="60%" stopColor={c} /><stop offset="100%" stopColor="#C4A86A" /></radialGradient>
      <circle cx={s / 2} cy={s / 2} r={s * 0.32} fill={`url(#v-b-${planetId})`} />
      <ellipse cx={s * 0.44} cy={s * 0.42} rx={s * 0.12} ry={s * 0.08} fill="white" opacity={0.2} />
      <ellipse cx={s / 2} cy={s * 0.38} rx={s * 0.26} ry={s * 0.03} fill={c} opacity={0.15} />
    </g>
  ),

  moon: (c, s, rgb) => (
    <g>
      <radialGradient id={`mo-g-${planetId}`} cx="40%" cy="35%">
        <stop offset="0%" stopColor="#E8E0D0" /><stop offset="50%" stopColor={c} /><stop offset="100%" stopColor="#908878" />
      </radialGradient>
      <circle cx={s / 2} cy={s / 2} r={s * 0.3} fill={`url(#mo-g-${planetId})`} />
      {/* 陨石坑 */}
      <circle cx={s * 0.45} cy={s * 0.45} r={s * 0.06} fill="#A09888" opacity={0.3} />
      <circle cx={s * 0.48} cy={s * 0.47} r={s * 0.025} fill="#908878" opacity={0.2} />
      <circle cx={s * 0.56} cy={s * 0.42} r={s * 0.04} fill="#A09888" opacity={0.25} />
      <circle cx={s * 0.4} cy={s * 0.55} r={s * 0.03} fill="#A09888" opacity={0.2} />
      <circle cx={s * 0.52} cy={s * 0.56} r={s * 0.02} fill="#A09888" opacity={0.15} />
      <ellipse cx={s * 0.44} cy={s * 0.42} rx={s * 0.08} ry={s * 0.05} fill="white" opacity={0.15} />
    </g>
  ),

  sun: (c, s, rgb) => (
    <g>
      {/* 日冕 */}
      {Array.from({ length: 20 }).map((_, i) => {
        const a = (i / 20) * Math.PI * 2;
        const r1 = s * 0.38;
        const r2 = s * 0.45 + (i % 3) * s * 0.04;
        const x1 = s / 2 + Math.cos(a) * r1, y1 = s / 2 + Math.sin(a) * r1;
        const x2 = s / 2 + Math.cos(a) * r2, y2 = s / 2 + Math.sin(a) * r2;
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={`rgba(${rgb},0.4)`} strokeWidth={1 + (i % 3) * 0.5} strokeLinecap="round" opacity={0.3 + (i % 4) * 0.15} />;
      })}
      <radialGradient id={`su-g-${planetId}`} cx="50%" cy="50%">
        <stop offset="60%" stopColor={`rgba(${rgb},0.3)`} /><stop offset="100%" stopColor="transparent" />
      </radialGradient>
      <circle cx={s / 2} cy={s / 2} r={s * 0.5} fill={`url(#su-g-${planetId})`} />
      <radialGradient id={`su-b-${planetId}`} cx="40%" cy="35%">
        <stop offset="0%" stopColor="#FFF8E0" /><stop offset="50%" stopColor={c} /><stop offset="100%" stopColor="#D4A020" />
      </radialGradient>
      <circle cx={s / 2} cy={s / 2} r={s * 0.32} fill={`url(#su-b-${planetId})`} />
      <circle cx={s * 0.44} cy={s * 0.42} rx={s * 0.1} ry={s * 0.06} fill="white" opacity={0.3} />
    </g>
  ),

  stars: (c, s, rgb) => (
    <g>
      {/* 星尘背景 */}
      {Array.from({ length: 18 }).map((_, i) => {
        const a = Math.random() * Math.PI * 2;
        const r = s * 0.1 + Math.random() * s * 0.35;
        return <circle key={i} cx={s / 2 + Math.cos(a) * r} cy={s / 2 + Math.sin(a) * r} r={0.5 + Math.random() * 1.5} fill={`rgba(${rgb},0.6)`} opacity={0.2 + Math.random() * 0.4} />;
      })}
      {/* 主星 */}
      <radialGradient id={`st-g-${planetId}`} cx="50%" cy="50%">
        <stop offset="0%" stopColor="#FFFFFF" /><stop offset="40%" stopColor={c} /><stop offset="100%" stopColor={`rgba(${rgb},0.3)`} />
      </radialGradient>
      <circle cx={s / 2} cy={s / 2} r={s * 0.2} fill={`url(#st-g-${planetId})`} />
      {/* 星芒 */}
      {[0, 45, 90, 135].map((angle, i) => (
        <line key={i} x1={s / 2} y1={s / 2 - s * 0.28} x2={s / 2} y2={s / 2 + s * 0.28}
          stroke={`rgba(${rgb},0.3)`} strokeWidth={0.8} opacity={0.4}
          transform={`rotate(${angle} ${s / 2} ${s / 2})`} />
      ))}
      <circle cx={s * 0.44} cy={s * 0.42} r={s * 0.06} fill="white" opacity={0.3} />
    </g>
  ),

  mars: (c, s, rgb) => (
    <g>
      <circle cx={s / 2} cy={s / 2} r={s * 0.48} fill="none" stroke={`rgba(${rgb},0.25)`} strokeWidth="0.4" />
      <circle cx={s / 2} cy={s / 2} r={s * 0.54} fill="none" stroke={`rgba(${rgb},0.15)`} strokeWidth="0.3" />
      <circle cx={s / 2 + s * 0.48} cy={s / 2} r={s * 0.022} fill="#B0A090" opacity={0.6} />
      <circle cx={s / 2 - s * 0.54} cy={s / 2 + s * 0.06} r={s * 0.018} fill="#A09080" opacity={0.4} />
      <radialGradient id={`ma-g-${planetId}`} cx="40%" cy="35%"><stop offset="0%" stopColor="#F0A080" /><stop offset="50%" stopColor={c} /><stop offset="100%" stopColor="#8A3A2A" /></radialGradient>
      <circle cx={s / 2} cy={s / 2} r={s * 0.3} fill={`url(#ma-g-${planetId})`} />
      <ellipse cx={s * 0.48} cy={s * 0.55} rx={s * 0.08} ry={s * 0.03} fill="#8A3A2A" opacity={0.2} />
      <ellipse cx={s * 0.55} cy={s * 0.4} rx={s * 0.05} ry={s * 0.025} fill="#8A3A2A" opacity={0.15} />
      <ellipse cx={s * 0.44} cy={s * 0.42} rx={s * 0.08} ry={s * 0.05} fill="white" opacity={0.2} />
    </g>
  ),

  jupiter: (c, s, rgb) => (
    <g>
      <circle cx={s / 2} cy={s / 2} r={s * 0.52} fill="none" stroke={`rgba(${rgb},0.25)`} strokeWidth="0.5" />
      <circle cx={s / 2} cy={s / 2} r={s * 0.6} fill="none" stroke={`rgba(${rgb},0.15)`} strokeWidth="0.3" />
      <circle cx={s / 2 + s * 0.52} cy={s / 2} r={s * 0.03} fill="#E8D8C0" opacity={0.7} />
      <circle cx={s / 2 - s * 0.52} cy={s / 2 + s * 0.04} r={s * 0.026} fill="#D8C8B0" opacity={0.6} />
      <circle cx={s / 2 + s * 0.6} cy={s / 2 - s * 0.03} r={s * 0.024} fill="#C8B8A0" opacity={0.5} />
      <circle cx={s / 2 - s * 0.6} cy={s / 2 + s * 0.015} r={s * 0.022} fill="#B8A890" opacity={0.4} />
      <radialGradient id={`ju-g-${planetId}`} cx="40%" cy="35%"><stop offset="0%" stopColor="#F0D8A0" /><stop offset="50%" stopColor={c} /><stop offset="100%" stopColor="#A08040" /></radialGradient>
      <circle cx={s / 2} cy={s / 2} r={s * 0.35} fill={`url(#ju-g-${planetId})`} />
      <ellipse cx={s / 2} cy={s * 0.38} rx={s * 0.32} ry={s * 0.025} fill="#C8A060" opacity={0.3} />
      <ellipse cx={s / 2} cy={s * 0.48} rx={s * 0.28} ry={s * 0.02} fill="#D8B870" opacity={0.2} />
      <ellipse cx={s / 2} cy={s * 0.56} rx={s * 0.24} ry={s * 0.018} fill="#C8A060" opacity={0.25} />
      <ellipse cx={s * 0.56} cy={s * 0.5} rx={s * 0.04} ry={s * 0.025} fill="#D47050" opacity={0.35} />
      <ellipse cx={s * 0.44} cy={s * 0.42} rx={s * 0.08} ry={s * 0.05} fill="white" opacity={0.15} />
    </g>
  ),

  saturn: (c, s, rgb) => (
    <g>
      <g transform={`rotate(-22 ${s / 2} ${s / 2})`}>
        <ellipse cx={s / 2} cy={s / 2} rx={s * 0.5} ry={s * 0.1} fill="none" stroke={c} strokeWidth="2.5" opacity={0.45} />
        <ellipse cx={s / 2} cy={s / 2} rx={s * 0.4} ry={s * 0.075} fill="none" stroke="#F0DFAE" strokeWidth="1.5" opacity={0.3} />
        <ellipse cx={s / 2} cy={s / 2} rx={s * 0.34} ry={s * 0.065} fill="none" stroke={c} strokeWidth="0.4" opacity={0.12} />
      </g>
      <radialGradient id={`sa-g-${planetId}`} cx="40%" cy="35%"><stop offset="0%" stopColor="#F0E8C0" /><stop offset="50%" stopColor={c} /><stop offset="100%" stopColor="#B09860" /></radialGradient>
      <circle cx={s / 2} cy={s / 2} r={s * 0.28} fill={`url(#sa-g-${planetId})`} />
      <ellipse cx={s / 2} cy={s * 0.38} rx={s * 0.25} ry={s * 0.018} fill="#D8C890" opacity={0.2} />
      <ellipse cx={s / 2} cy={s * 0.52} rx={s * 0.22} ry={s * 0.012} fill="#D8C890" opacity={0.15} />
      <ellipse cx={s * 0.44} cy={s * 0.42} rx={s * 0.08} ry={s * 0.05} fill="white" opacity={0.2} />
    </g>
  ),

  uranus: (c, s, rgb) => (
    <g>
      <g transform={`rotate(80 ${s / 2} ${s / 2})`}>
        <ellipse cx={s / 2} cy={s / 2} rx={s * 0.46} ry={s * 0.05} fill="none" stroke={c} strokeWidth="1.2" opacity={0.4} />
        <ellipse cx={s / 2} cy={s / 2} rx={s * 0.38} ry={s * 0.04} fill="none" stroke={c} strokeWidth="0.6" opacity={0.25} />
      </g>
      <radialGradient id={`ur-g-${planetId}`} cx="40%" cy="35%"><stop offset="0%" stopColor="#C0F0E8" /><stop offset="50%" stopColor={c} /><stop offset="100%" stopColor="#5A90A0" /></radialGradient>
      <circle cx={s / 2} cy={s / 2} r={s * 0.32} fill={`url(#ur-g-${planetId})`} />
      <ellipse cx={s / 2} cy={s * 0.4} rx={s * 0.28} ry={s * 0.015} fill="#80C0C0" opacity={0.2} />
      <ellipse cx={s / 2} cy={s * 0.54} rx={s * 0.22} ry={s * 0.01} fill="#80C0C0" opacity={0.15} />
      <ellipse cx={s * 0.44} cy={s * 0.42} rx={s * 0.08} ry={s * 0.05} fill="white" opacity={0.2} />
    </g>
  ),

  neptune: (c, s, rgb) => (
    <g>
      {[0, 1, 2].map((i) => {
        const a1 = (i / 3) * Math.PI * 2 + 0.3 + i * 0.2;
        const a2 = a1 + 0.3 + i * 0.1;
        const r = s * 0.44 + i * 0.04;
        const x1 = s / 2 + r * Math.cos(a1), y1 = s / 2 + r * Math.sin(a1);
        const x2 = s / 2 + r * Math.cos(a2), y2 = s / 2 + r * Math.sin(a2);
        return <path key={i} d={`M${x1} ${y1} A${r} ${r} 0 0 1 ${x2} ${y2}`} fill="none" stroke={c} strokeWidth="1.2" opacity={0.35 + i * 0.15} />;
      })}
      {Array.from({ length: 6 }).map((_, i) => {
        const a = Math.random() * Math.PI * 2;
        const r = s * 0.4 + Math.random() * s * 0.16;
        return <circle key={i} cx={s / 2 + Math.cos(a) * r} cy={s / 2 + Math.sin(a) * r} r={0.5 + Math.random()} fill={c} opacity={0.2 + Math.random() * 0.2} />;
      })}
      <radialGradient id={`ne-g-${planetId}`} cx="40%" cy="35%"><stop offset="0%" stopColor="#80B8E8" /><stop offset="50%" stopColor={c} /><stop offset="100%" stopColor="#305080" /></radialGradient>
      <circle cx={s / 2} cy={s / 2} r={s * 0.3} fill={`url(#ne-g-${planetId})`} />
      <ellipse cx={s / 2} cy={s * 0.42} rx={s * 0.24} ry={s * 0.015} fill="#5080B0" opacity={0.2} />
      <ellipse cx={s / 2} cy={s * 0.54} rx={s * 0.18} ry={s * 0.01} fill="#5080B0" opacity={0.15} />
      <ellipse cx={s * 0.55} cy={s * 0.48} rx={s * 0.035} ry={s * 0.02} fill="#204070" opacity={0.25} />
      <ellipse cx={s * 0.44} cy={s * 0.42} rx={s * 0.08} ry={s * 0.05} fill="white" opacity={0.2} />
    </g>
  ),
};

let planetId = 0;

export function PlanetIcon({ planet, size = 64, glow = true, node = false }: PlanetIconProps) {
  const p = PLANET_COLORS[planet];
  if (!p) return null;
  const c = p.hex;
  const rgb = p.css;
  const svg = SVG_MAP[planet];
  if (!svg) return null;

  // use a unique id per instance for gradient references
  const uid = planetId++;

  if (node) {
    // 节点模式：更紧凑，无额外光晕
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: 'block' }}>
        {svg(c, size, rgb)}
      </svg>
    );
  }

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: 'block' }}>
      <defs>
        <radialGradient id={`eg-${uid}`} cx="50%" cy="50%" r="50%">
          <stop offset="85%" stopColor="transparent" />
          <stop offset="95%" stopColor={c} stopOpacity="0.25" />
          <stop offset="100%" stopColor={c} stopOpacity="0.5" />
        </radialGradient>
      </defs>
      {glow && <circle cx={size / 2} cy={size / 2} r={size * 0.4} fill={c} opacity={0.06} filter="blur(3px)" />}
      {svg(c, size, rgb)}
      <circle cx={size / 2} cy={size / 2} r={size * 0.44} fill={`url(#eg-${uid})`} />
    </svg>
  );
}
