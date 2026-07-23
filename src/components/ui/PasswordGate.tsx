'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Globe, Lock, LogIn } from 'lucide-react';
import { useMemoryStore } from '@/lib/store';

export function PasswordGate({ children }: { children: React.ReactNode }) {
  const [input, setInput] = useState('');
  const [error, setError] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const settings = useMemoryStore((s) => s.settings);
  const updateSettings = useMemoryStore((s) => s.updateSettings);

  // Wait for localStorage hydration
  useEffect(() => {
    setHydrated(true);
  }, []);

  const password = settings.sitePassword || 'ourworld';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input === password) {
      updateSettings({ isUnlocked: true });
      setError(false);
    } else {
      setError(true);
      setInput('');
    }
  };

  // Wait for hydration
  if (!hydrated) return null;

  // If unlocked, show children
  if (settings.isUnlocked) {
    return <>{children}</>;
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center min-h-screen bg-gradient-to-b from-sky-100 via-sky-50 to-white">
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        {Array.from({ length: 30 }).map((_, i) => (
          <div key={i} className="absolute rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${2 + Math.random() * 3}px`,
              height: `${2 + Math.random() * 3}px`,
              backgroundColor: '#E8D59A',
              opacity: 0.2 + Math.random() * 0.2,
              animation: `sparkle ${3 + Math.random() * 4}s ease-in-out ${Math.random() * 5}s infinite`,
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="relative z-10 flex flex-col items-center text-center px-6 max-w-sm"
      >
        {/* Globe icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
          className="w-16 h-16 rounded-full bg-sky-100/60 flex items-center justify-center mb-6"
        >
          <Globe size={30} className="text-sky-400" />
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-2xl font-[family-name:var(--font-title)] text-deep-800 tracking-wide mb-2"
        >
          花与灵的记忆星球
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="text-xs text-deep-400 mb-8 font-[family-name:var(--font-body)]"
        >
          输入密码进入我们的世界
        </motion.p>

        {/* Password form */}
        <motion.form
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.9 }}
          onSubmit={handleSubmit}
          className="w-full"
        >
          <div className="relative mb-4">
            <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-deep-400" />
            <input
              type="password"
              value={input}
              onChange={(e) => { setInput(e.target.value); setError(false); }}
              placeholder="请输入密码"
              autoFocus
              className={`w-full bg-white/60 backdrop-blur-sm border rounded-xl pl-9 pr-4 py-2.5 text-sm text-deep-700 placeholder-deep-300 outline-none transition-all font-[family-name:var(--font-body)] ${
                error ? 'border-red-300/50 focus:border-red-400/50' : 'border-sky-200/30 focus:border-sky-400/50'
              }`}
            />
            {error && (
              <p className="text-[11px] text-red-400 mt-1.5 text-left pl-1 font-[family-name:var(--font-body)]">
                密码不正确，请重试
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white/40 backdrop-blur-sm border border-white/50 text-deep-700 hover:bg-white/60 hover:border-white/70 transition-all duration-300 text-sm font-medium active:scale-[0.98]"
          >
            <LogIn size={15} />
            进入
          </button>
        </motion.form>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="text-[10px] text-deep-300 mt-10 tracking-wider font-[family-name:var(--font-body)]"
        >
          Somewhere Only We Know
        </motion.p>
      </motion.div>
    </div>
  );
}
