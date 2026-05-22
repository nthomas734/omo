'use client';

import { scoreColor } from '@/lib/theme';

interface ScoreBarProps {
  label: string;
  value: number;
  weight?: number;
  showWeight?: boolean;
}

export function ScoreBar({ label, value, weight, showWeight = false }: ScoreBarProps) {
  const color = scoreColor(value);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
      <span style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        letterSpacing: '0.04em',
        color: '#8A8680',
        width: showWeight ? 110 : 90,
        flexShrink: 0,
        textTransform: 'uppercase',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}>
        {label}{showWeight && weight !== undefined ? ` ${weight}%` : ''}
      </span>
      <div style={{
        flex: 1,
        height: 4,
        background: '#EDE8DF',
        borderRadius: 2,
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          width: `${value * 10}%`,
          background: color,
          borderRadius: 2,
          transition: 'width 0.3s ease',
        }} />
      </div>
      <span style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        fontWeight: 700,
        color: value < 5 ? '#E24B4A' : '#3A3730',
        width: 24,
        textAlign: 'right',
        flexShrink: 0,
      }}>
        {value.toFixed(1)}
      </span>
    </div>
  );
}
