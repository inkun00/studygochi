'use client';

import { ReactNode } from 'react';

interface SpeechBubbleProps {
  children: ReactNode;
  isThinking?: boolean;
}

export default function SpeechBubble({ children, isThinking }: SpeechBubbleProps) {
  return (
    <div className="relative inline-block max-w-xs" style={{ fontFamily: "'Press Start 2P', monospace" }}>
      <div className="ui-popup px-4 py-3 rounded-bl-md">
        {isThinking ? (
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-sm animate-bounce" style={{ background: 'var(--ui-outline)', animationDelay: '0ms' }} />
            <span className="w-2 h-2 rounded-sm animate-bounce" style={{ background: 'var(--ui-outline)', animationDelay: '150ms' }} />
            <span className="w-2 h-2 rounded-sm animate-bounce" style={{ background: 'var(--ui-outline)', animationDelay: '300ms' }} />
          </div>
        ) : (
          <p className="text-[10px] leading-relaxed" style={{ color: 'var(--text-dark)' }}>{children}</p>
        )}
      </div>
    </div>
  );
}
