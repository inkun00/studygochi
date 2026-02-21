'use client';

import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
}

export default function Card({ children, className = '' }: CardProps) {
  return (
    <div
      className={`ui-panel p-5 ${className}`}
      style={{ fontFamily: "'Press Start 2P', monospace" }}
    >
      {children}
    </div>
  );
}
