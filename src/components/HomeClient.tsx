'use client';

import { useState } from 'react';
import Link from 'next/link';
import { OmoRanking } from '@/lib/supabase';
import { categoryColor } from '@/lib/theme';
import { Logo } from './Logo';
import { theme } from '@/lib/theme';

type Filter = 'all' | 'life' | 'apartments' | 'travel' | 'gear' | 'coffee' | 'restaurants' | 'other';

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all',         label: 'All' },
  { key: 'life',        label: 'Life' },
  { key: 'apartments',  label: 'Apartments' },
  { key: 'travel',      label: 'Travel' },
  { key: 'gear',        label: 'Gear' },
  { key: 'coffee',      label: 'Coffee' },
  { key: 'restaurants', label: 'Restaurants' },
];

interface HomeClientProps {
  rankings: OmoRanking[];
}

export function HomeClient({ rankings }: HomeClientProps) {
  const [filter, setFilter] = useState<Filter>('all');

  const filtered = rankings.filter(r =>
    filter === 'all' ? true : r.category === filter
  );

  const decided   = filtered.filter(r => r.is_decided);
  const active    = filtered.filter(r => !r.is_decided);

  return (
    <div style={{
      maxWidth: 480,
      margin: '0 auto',
      minHeight: '100vh',
      paddingBottom: 80,
    }}>

      {/* Header */}
      <div style={{ padding: '44px 20px 24px', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
          <Logo size={44} />
        </div>
        <div style={{
          fontFamily: 'var(--font-serif)',
          fontWeight: 300,
          fontSize: 28,
          letterSpacing: '-0.01em',
          color: theme.cream,
          lineHeight: 1,
        }}>omo</div>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          color: theme.brass,
          opacity: 0.35,
          marginTop: 2,
        }}>重</div>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 8,
          letterSpacing: '0.18em',
          color: theme.brass,
          opacity: 0.48,
          marginTop: 6,
          textTransform: 'uppercase',
        }}>— nothing decided lightly —</div>
      </div>

      {/* Category filter */}
      <div style={{
        display: 'flex',
        gap: 6,
        padding: '0 16px 16px',
        overflowX: 'auto',
        scrollbarWidth: 'none',
      }}>
        {FILTERS.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 8,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              padding: '5px 12px',
              borderRadius: 20,
              whiteSpace: 'nowrap',
              flexShrink: 0,
              border: filter === f.key
                ? `1px solid rgba(200,169,126,0.4)`
                : `1px solid ${theme.border}`,
              background: filter === f.key
                ? 'rgba(200,169,126,0.1)'
                : 'transparent',
              color: filter === f.key
                ? theme.brass
                : 'rgba(200,169,126,0.45)',
              transition: 'all 0.15s ease',
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Rankings */}
      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>

        {/* Active */}
        {active.map((r, i) => (
          <RankingCard key={r.id} ranking={r} index={i} />
        ))}

        {/* Divider if both sections have items */}
        {active.length > 0 && decided.length > 0 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            margin: '4px 0',
          }}>
            <div style={{ flex: 1, height: 1, background: theme.border }} />
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 7,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'rgba(200,169,126,0.3)',
            }}>Decided</span>
            <div style={{ flex: 1, height: 1, background: theme.border }} />
          </div>
        )}

        {/* Decided */}
        {decided.map((r, i) => (
          <RankingCard key={r.id} ranking={r} index={i} decided />
        ))}

        {/* Empty state */}
        {filtered.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 16,
          }}>
            <Logo size={36} color="rgba(200,169,126,0.3)" />
            <div style={{
              fontFamily: 'var(--font-serif)',
              fontWeight: 300,
              fontSize: 18,
              color: 'rgba(245,237,224,0.3)',
            }}>Nothing here yet</div>
          </div>
        )}

      </div>

      {/* Tab bar */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: 480,
        height: 68,
        background: 'rgba(8, 20, 26, 0.92)',
        backdropFilter: 'blur(12px)',
        borderTop: `1px solid ${theme.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        paddingBottom: 10,
        zIndex: 50,
      }}>
        <TabItem icon={<GridIcon />} label="Rankings" active />
        <TabItem icon={<ClockIcon />} label="History" active={false} />
      </div>

    </div>
  );
}

function RankingCard({ ranking, index, decided = false }: {
  ranking: OmoRanking;
  index: number;
  decided?: boolean;
}) {
  const dotColor = categoryColor(ranking.category);
  const delay = index * 0.05;

  return (
    <Link href={`/r/${ranking.slug}`} style={{ textDecoration: 'none' }}>
      <div
        className="fade-in"
        style={{
          background: theme.board,
          border: decided
            ? `1px solid rgba(200,169,126,0.22)`
            : `1px solid ${theme.border}`,
          borderRadius: 14,
          padding: '14px 14px 11px',
          cursor: 'pointer',
          animationDelay: `${delay}s`,
          transition: 'border-color 0.2s ease',
          opacity: ranking.category === 'other' && !decided ? 0.6 : 1,
        }}
      >
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 9,
        }}>
          <div>
            <div style={{
              fontFamily: 'var(--font-serif)',
              fontWeight: 300,
              fontSize: 15,
              color: theme.cream,
              lineHeight: 1.2,
            }}>{ranking.title}</div>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 8,
              letterSpacing: '0.08em',
              color: 'rgba(200,169,126,0.4)',
              marginTop: 3,
              textTransform: 'uppercase',
            }}>
              {new Date(ranking.updated_at).toLocaleDateString('en-US', {
                month: 'short', year: 'numeric'
              })}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {decided && (
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                color: theme.brass,
                opacity: 0.7,
              }}>✓</span>
            )}
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 8,
              color: 'rgba(245,237,224,0.22)',
              textTransform: 'uppercase',
            }}>
              {decided ? 'decided' : 'active'}
            </span>
          </div>
        </div>

        {/* Winner row */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 7,
          paddingTop: 9,
          borderTop: `1px solid rgba(200,169,126,0.07)`,
        }}>
          <div style={{
            width: 6, height: 6,
            borderRadius: '50%',
            background: dotColor,
            flexShrink: 0,
          }} />
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 7,
            letterSpacing: '0.12em',
            color: 'rgba(200,169,126,0.4)',
            textTransform: 'uppercase',
          }}>
            {ranking.category} · {decided ? 'decided' : 'active'}
          </span>
        </div>
      </div>
    </Link>
  );
}

function TabItem({ icon, label, active }: { icon: React.ReactNode; label: string; active: boolean }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
      opacity: active ? 1 : 0.3,
    }}>
      {icon}
      <span style={{
        fontFamily: 'var(--font-mono)', fontSize: 7,
        letterSpacing: '0.1em', textTransform: 'uppercase', color: theme.brass,
      }}>{label}</span>
      {active && (
        <div style={{ width: 3, height: 3, borderRadius: '50%', background: theme.brass }} />
      )}
    </div>
  );
}

function GridIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="#C8A97E" strokeWidth="1.5" strokeLinecap="round">
      <rect x="3" y="3" width="6" height="6" rx="1.5" />
      <rect x="11" y="3" width="6" height="6" rx="1.5" />
      <rect x="3" y="11" width="6" height="6" rx="1.5" />
      <rect x="11" y="11" width="6" height="6" rx="1.5" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="rgba(245,237,224,0.35)" strokeWidth="1.5" strokeLinecap="round">
      <circle cx="10" cy="10" r="7" />
      <line x1="10" y1="6" x2="10" y2="10" />
      <line x1="10" y1="10" x2="13" y2="13" />
    </svg>
  );
}
