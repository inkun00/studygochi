'use client';

interface ProgressBarProps {
  value: number;
  max: number;
  color?: string;
  label?: string;
  showValue?: boolean;
}

export default function ProgressBar({
  value,
  max,
  color = '#a060e0',
  label,
  showValue = true,
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className="w-full" style={{ fontFamily: "'Press Start 2P', monospace" }}>
      {(label || showValue) && (
        <div className="flex justify-between text-[10px] mb-1">
          {label && <span className="font-semibold" style={{ color: 'var(--ui-outline)' }}>{label}</span>}
          {showValue && (
            <span style={{ color: 'var(--text-orange)' }}>
              {value}/{max}
            </span>
          )}
        </div>
      )}
      <div
        className="w-full h-1.5 rounded-sm overflow-hidden transition-all duration-500 ease-out"
        style={{ background: '#2a2035', border: '1px solid var(--ui-outline-dark)' }}
      >
        <div
          className="h-full rounded-sm transition-all duration-500 ease-out"
          style={{ width: `${percentage}%`, minWidth: percentage > 0 ? '4px' : 0, background: color }}
        />
      </div>
    </div>
  );
}
