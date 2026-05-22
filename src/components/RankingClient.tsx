'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  OmoRanking, OmoCriterion, OmoOption, OmoScore, OmoVersion,
  computeScore, categoryColor,
} from '@/lib/supabase';
import { FlipCard } from './FlipCard';
import { WeightEditor } from './WeightEditor';
import { theme } from '@/lib/theme';

type Tab = 'cards' | 'map' | 'weights';

interface RankingClientProps {
  ranking: OmoRanking;
  criteria: OmoCriterion[];
  options: OmoOption[];
  scores: OmoScore[];
  versions: OmoVersion[];
}

export function RankingClient({
  ranking,
  criteria: initialCriteria,
  options,
  scores,
  versions,
}: RankingClientProps) {
  const [tab, setTab] = useState<Tab>('cards');
  const [criteria, setCriteria] = useState(initialCriteria);
  const [showWeightEditor, setShowWeightEditor] = useState(false);

  const hasLocations = options.some(o => o.maps_url);

  // Sort options by score, disqualified go to bottom
  const sortedOptions = [...options].sort((a, b) => {
    if (a.is_disqualified && !b.is_disqualified) return 1;
    if (!a.is_disqualified && b.is_disqualified) return -1;
    return computeScore(b, criteria, scores) - computeScore(a, criteria, scores);
  });

  const catColor = categoryColor(ranking.category);

  // Top 4 criteria by weight for the pill strip
  const topCriteria = [...criteria].sort((a, b) => b.weight - a.weight).slice(0, 6);

  return (
    <div style={{
      maxWidth: 480,
      margin: '0 auto',
      minHeight: '100vh',
      background: theme.light.bg,
      color: theme.light.ink,
    }}>

      {/* Dark header */}
      <div style={{
        background: theme.bg,
        backgroundImage: `radial-gradient(circle at 80% 20%, rgba(200,169,126,0.07), transparent 50%)`,
        padding: '36px 20px 20px',
      }}>
        {/* Back link */}
        <Link href="/" style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 8,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: 'rgba(200,169,126,0.5)',
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          marginBottom: 14,
        }}>
          ‹ omo
        </Link>

        {/* Eyebrow */}
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 8,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: theme.brass,
          opacity: 0.65,
          marginBottom: 7,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}>
          <div style={{
            width: 6, height: 6, borderRadius: '50%', background: catColor,
          }} />
          omo · {ranking.category}
          {ranking.is_decided && (
            <span style={{ color: theme.brass, opacity: 0.7 }}>· ✓ decided</span>
          )}
        </div>

        {/* Title */}
        <div style={{
          fontFamily: 'var(--font-serif)',
          fontWeight: 300,
          fontSize: 22,
          color: theme.cream,
          lineHeight: 1.2,
          marginBottom: 6,
        }}>{ranking.title}</div>

        {/* Meta */}
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 8,
          letterSpacing: '0.08em',
          color: 'rgba(245,237,224,0.38)',
          textTransform: 'uppercase',
        }}>
          {options.length} options · {criteria.length} criteria ·{' '}
          {new Date(ranking.updated_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
          {versions.length > 0 && ` · v${versions.length + 1}`}
        </div>
      </div>

      {/* Criteria pills strip */}
      <div style={{
        background: theme.light.bg,
        padding: '10px 14px',
        borderBottom: `1px solid ${theme.light.border}`,
        display: 'flex',
        gap: 5,
        flexWrap: 'wrap',
        alignItems: 'center',
      }}>
        {topCriteria.map(c => (
          <span key={c.id} style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 7,
            letterSpacing: '0.07em',
            textTransform: 'uppercase',
            padding: '3px 8px',
            borderRadius: 20,
            background: c.weight >= 12 ? theme.light.brassLight : theme.light.bgSubtle,
            color: c.weight >= 12 ? '#7A5A1A' : theme.light.ink3,
            border: `1px solid ${c.weight >= 12 ? '#E0D0A8' : theme.light.border}`,
            whiteSpace: 'nowrap',
          }}>
            {c.label} {c.weight}%
          </span>
        ))}
        <button
          onClick={() => setShowWeightEditor(true)}
          style={{
            marginLeft: 'auto',
            fontFamily: 'var(--font-mono)',
            fontSize: 7,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: theme.light.brass,
            padding: '3px 9px',
            border: `1px solid ${theme.light.border}`,
            borderRadius: 20,
            cursor: 'pointer',
            background: 'transparent',
            whiteSpace: 'nowrap',
          }}
        >
          Edit ›
        </button>
      </div>

      {/* View tabs */}
      <div style={{
        display: 'flex',
        borderBottom: `1px solid ${theme.light.border}`,
        background: theme.light.bg,
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}>
        {(['cards', ...(hasLocations ? ['map'] : []), 'weights'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              flex: 1,
              padding: '10px 4px',
              fontFamily: 'var(--font-mono)',
              fontSize: 8,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: tab === t ? theme.light.brass : theme.light.ink4,
              borderBottom: tab === t
                ? `2px solid ${theme.light.brass}`
                : '2px solid transparent',
              background: 'transparent',
              cursor: 'pointer',
              transition: 'color 0.15s ease',
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* ── CARDS TAB ── */}
      {tab === 'cards' && (
        <div style={{ padding: '12px 14px 80px' }}>
          {sortedOptions.map((option, i) => {
            const rank = option.is_disqualified
              ? sortedOptions.filter(o => !o.is_disqualified).length + 1
              : i + 1;
            return (
              <FlipCard
                key={option.id}
                option={option}
                rank={rank}
                criteria={criteria}
                scores={scores}
              />
            );
          })}
        </div>
      )}

      {/* ── MAP TAB ── */}
      {tab === 'map' && hasLocations && (
        <div style={{ padding: '0 0 80px' }}>
          <MapView
            options={sortedOptions}
            criteria={criteria}
            scores={scores}
          />
        </div>
      )}

      {/* ── WEIGHTS TAB ── */}
      {tab === 'weights' && (
        <div style={{ padding: '14px 16px 80px' }}>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 9,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: theme.light.ink4,
            marginBottom: 12,
          }}>All criteria · ranked by weight</div>
          {[...criteria].sort((a, b) => b.weight - a.weight).map(c => (
            <div key={c.id} style={{
              background: theme.light.surface,
              border: `1px solid ${theme.light.border}`,
              borderRadius: 10,
              padding: '12px 14px',
              marginBottom: 8,
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: c.why ? 6 : 0,
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}>
                  <span style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: 14,
                    fontWeight: 500,
                    color: theme.light.ink,
                  }}>{c.label}</span>
                  {c.is_disqualifier && (
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 7,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      background: '#FDEEE8',
                      color: '#993C1D',
                      padding: '1px 5px',
                      borderRadius: 4,
                    }}>disqualifier</span>
                  )}
                </div>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 16,
                  fontWeight: 700,
                  color: theme.light.brass,
                }}>{c.weight}%</span>
              </div>
              {c.why && (
                <div style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 9,
                  letterSpacing: '0.06em',
                  color: theme.light.ink4,
                  textTransform: 'uppercase',
                }}>{c.why}</div>
              )}
              {/* Weight bar */}
              <div style={{
                marginTop: 8,
                height: 3,
                background: theme.light.bgSubtle,
                borderRadius: 2,
                overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%',
                  width: `${c.weight * 2}%`,
                  background: theme.bg,
                  borderRadius: 2,
                }} />
              </div>
            </div>
          ))}

          <button
            onClick={() => setShowWeightEditor(true)}
            style={{
              width: '100%',
              marginTop: 8,
              background: theme.bg,
              color: theme.cream,
              border: 'none',
              borderRadius: 10,
              padding: '13px 0',
              fontFamily: 'var(--font-mono)',
              fontSize: 9,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              cursor: 'pointer',
            }}
          >
            Edit weights ›
          </button>
        </div>
      )}

      {/* Weight editor modal */}
      {showWeightEditor && (
        <WeightEditor
          criteria={criteria}
          options={options}
          scores={scores}
          onClose={() => setShowWeightEditor(false)}
          onSave={updated => {
            setCriteria(updated);
            setTab('cards');
          }}
        />
      )}

    </div>
  );
}

// ── MAP VIEW ─────────────────────────────────────────────

function MapView({
  options,
  criteria,
  scores,
}: {
  options: OmoOption[];
  criteria: OmoCriterion[];
  scores: OmoScore[];
}) {
  const [selected, setSelected] = useState<OmoOption | null>(null);

  const withLocations = options.filter(o => o.maps_url);

  return (
    <div>
      {/* Google Maps embed placeholder — in production use maps_url to build embed */}
      <div style={{
        width: '100%',
        height: 320,
        background: '#1A2A30',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {/* Real map loads via iframe in production */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 9,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'rgba(200,169,126,0.4)',
            marginBottom: 8,
          }}>Map view</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {withLocations.map((o, i) => {
              const score = computeScore(o, criteria, scores);
              const isWinner = i === 0 && !o.is_disqualified;
              return (
                <a
                  key={o.id}
                  href={o.maps_url ?? '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '8px 14px',
                    background: 'rgba(10,28,36,0.7)',
                    borderRadius: 8,
                    border: `1px solid ${isWinner ? 'rgba(200,169,126,0.3)' : 'rgba(200,169,126,0.1)'}`,
                    textDecoration: 'none',
                  }}
                >
                  <div style={{
                    width: 24, height: 24, borderRadius: '50%',
                    background: isWinner ? '#B8944E' : o.is_disqualified ? '#C77B5C' : '#3A3730',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--font-mono)', fontSize: 8, fontWeight: 700,
                    color: '#fff', flexShrink: 0,
                  }}>
                    {o.is_disqualified ? '⚠' : `#${i + 1}`}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontFamily: 'var(--font-sans)', fontSize: 12,
                      fontWeight: 500, color: theme.cream,
                    }}>{o.title}</div>
                    {o.subtitle && (
                      <div style={{
                        fontFamily: 'var(--font-mono)', fontSize: 8,
                        color: 'rgba(200,169,126,0.45)',
                      }}>{o.subtitle}</div>
                    )}
                  </div>
                  <div style={{
                    fontFamily: 'var(--font-mono)', fontSize: 12,
                    fontWeight: 700, color: '#C8A97E',
                  }}>{score.toFixed(2)}</div>
                </a>
              );
            })}
          </div>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 8,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'rgba(200,169,126,0.3)',
            marginTop: 12,
          }}>Tap any option to open in Google Maps</div>
        </div>
      </div>
    </div>
  );
}
