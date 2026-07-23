'use client';

import { forwardRef, ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'glass' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

const variants = {
  primary: 'bg-sky-400/80 text-white hover:bg-sky-500/90 shadow-sm hover:shadow-md active:bg-sky-600/80',
  secondary: 'bg-white/60 text-deep-700 border border-sky-200/50 hover:bg-white/80 hover:border-sky-300/60',
  ghost: 'text-deep-400 hover:text-deep-700 hover:bg-white/40',
  glass: 'bg-white/30 backdrop-blur-sm text-deep-700 border border-white/40 hover:bg-white/50 hover:border-white/60 shadow-sm',
  danger: 'bg-red-400/80 text-white hover:bg-red-500/90 shadow-sm',
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs rounded-lg',
  md: 'px-4 py-2 text-sm rounded-xl',
  lg: 'px-6 py-3 text-base rounded-xl',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', isLoading, className = '', children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`
          inline-flex items-center justify-center gap-2
          font-[family-name:var(--font-ui)] font-medium
          transition-all duration-300 ease-out
          disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none
          active:scale-[0.97]
          ${variants[variant]}
          ${sizes[size]}
          ${className}
        `}
        {...props}
      >
        {isLoading ? (
          <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white/80 rounded-full animate-spin" />
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
