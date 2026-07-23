'use client';

interface LoadingSpinnerProps {
  text?: string;
  type?: 'sun' | 'flower' | 'dots';
}

export function LoadingSpinner({ text, type = 'sun' }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-6 py-12">
      {type === 'sun' && (
        <div className="relative w-12 h-12">
          {/* Sun glow */}
          <div className="absolute inset-0 rounded-full bg-gold-200/30 animate-ping" style={{ animationDuration: '2s' }} />
          {/* Sun core */}
          <div className="absolute inset-1 rounded-full bg-gradient-to-br from-gold-200 to-gold-300 animate-sun-rise shadow-lg" />
          {/* Rays */}
          <svg className="absolute inset-0 w-full h-full animate-spin" style={{ animationDuration: '8s' }} viewBox="0 0 48 48">
            {Array.from({ length: 8 }).map((_, i) => (
              <line
                key={i}
                x1="24"
                y1="4"
                x2="24"
                y2="8"
                stroke="#E8D59A"
                strokeWidth="1.5"
                strokeLinecap="round"
                opacity={0.4}
                transform={`rotate(${i * 45} 24 24)`}
              />
            ))}
          </svg>
        </div>
      )}

      {type === 'flower' && (
        <svg className="w-10 h-10 animate-spin" style={{ animationDuration: '3s' }} viewBox="0 0 40 40">
          {Array.from({ length: 5 }).map((_, i) => (
            <ellipse
              key={i}
              cx="20"
              cy="20"
              rx="4"
              ry="10"
              fill="none"
              stroke="#D4E8F2"
              strokeWidth="1.5"
              opacity={0.7}
              transform={`rotate(${i * 72} 20 20)`}
            />
          ))}
          <circle cx="20" cy="20" r="3" fill="#E8D59A" opacity={0.6} />
        </svg>
      )}

      {type === 'dots' && (
        <div className="flex gap-1.5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-sky-400/60 animate-bounce"
              style={{ animationDelay: `${i * 0.15}s`, animationDuration: '1s' }}
            />
          ))}
        </div>
      )}

      {text && (
        <p className="text-sm text-deep-400 font-[family-name:var(--font-body)]">{text}</p>
      )}
    </div>
  );
}
