'use client';

import { ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative ui-popup w-full max-w-md max-h-[85vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
        <div className="sticky top-0 rounded-t-lg border-b px-5 py-4 flex items-center justify-between" style={{ borderColor: 'var(--ui-outline)' }}>
          <h2 className="text-sm font-bold" style={{ fontFamily: "'Press Start 2P'", color: 'var(--ui-outline)' }}>{title}</h2>
          <button
            onClick={onClose}
            className="p-1 rounded pixel-btn transition-colors"
          >
            <X size={16} style={{ color: 'var(--ui-outline)' }} />
          </button>
        </div>
        <div className="p-5" style={{ fontFamily: "'Press Start 2P'", color: 'var(--text-dark)' }}>{children}</div>
      </div>
    </div>
  );
}
