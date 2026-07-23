'use client';

import { Compass } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}

export function EmptyState({ icon, title, description, actionText, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-16 h-16 rounded-full bg-sky-100/60 flex items-center justify-center mb-5">
        {icon || <Compass size={28} className="text-sky-400" />}
      </div>
      <h3 className="text-lg font-[family-name:var(--font-title)] text-deep-700 mb-2">{title}</h3>
      <p className="text-sm text-deep-400 max-w-xs leading-relaxed mb-6 font-[family-name:var(--font-body)]">
        {description}
      </p>
      {actionText && onAction && (
        <Button variant="glass" size="md" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
}
