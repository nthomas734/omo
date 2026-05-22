'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  OmoRanking, OmoCriterion, OmoOption, OmoScore, OmoVersion,
  computeScore,
} from '@/lib/supabase';
import { categoryColor } from '@/lib/theme';
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

function PinIcon({ color, size = 16 }: { color: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} style={{ flexShrink: 0 }}>
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
    </svg>
  );
}

function MapView({
  options,
  criteria,
  scores,
}: {
  options: OmoOption[];
  criteria: OmoCriterion[];
  scores: OmoScore[];
}) {
  const ranked = options.filter(o => !o.is_disqualified);
  const disqualified = options.filter(o => o.is_disqualified);

  function optionMapsUrl(o: OmoOption): string {
    return o.maps_url ?? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(o.title)}`;
  }

  const stripStyle = (isWinner: boolean): React.CSSProperties => ({
    width: 48,
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '12px 0',
    gap: 5,
    borderRight: `1px solid ${theme.light.bgSubtle}`,
    background: isWinner ? '#FDF8F0' : theme.light.surface,
  });

  // Center map on first ranked option's location
  const centerQuery = (() => {
    const top = ranked[0];
    if (!top) return 'San+Diego,CA';
    try {
      return new URL(top.maps_url ?? '').searchParams.get('query') ?? 'San+Diego,CA';
    } catch { return 'San+Diego,CA'; }
  })();

  const embedSrc = `https://maps.google.com/maps?q=${encodeURIComponent(centerQuery)}&output=embed&z=13`;

  return (
    <div style={{ paddingBottom: 80 }}>

      {/* Google Maps iframe — centered on top ranked option */}
      <div style={{ position: 'relative', width: '100%', height: 240 }}>
        <iframe
          src={embedSrc}
          width="100%"
          height="240"
          style={{ border: 'none', display: 'block' }}
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>

      <div style={{ padding: '14px 14px 0' }}>
      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 8,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        color: theme.light.ink4,
        marginBottom: 10,
      }}>Tap any option to open in Google Maps</div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>

        {ranked.map((o, i) => {
          const sc = computeScore(o, criteria, scores);
          const isWinner = i === 0;
          return (
            <a
              key={o.id}
              href={optionMapsUrl(o)}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'stretch',
                background: theme.light.surface,
                borderRadius: 12,
                border: isWinner
                  ? `1.5px solid ${theme.light.brass}`
                  : `1px solid ${theme.light.border}`,
                textDecoration: 'none',
                overflow: 'hidden',
              }}
            >
              {/* Pin + rank strip */}
              <div style={stripStyle(isWinner)}>
                <PinIcon color={isWinner ? theme.light.brass : theme.light.ink4} size={18} />
                <div style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  fontWeight: 700,
                  color: isWinner ? theme.light.brass : theme.light.ink3,
                }}>#{i + 1}</div>
              </div>

              {/* Name + subtitle + location hint */}
              <div style={{ flex: 1, padding: '11px 12px', minWidth: 0 }}>
                <div style={{
                  fontFamily: 'var(--font-serif)',
                  fontWeight: 300,
                  fontSize: 16,
                  color: theme.light.ink,
                  lineHeight: 1.2,
                  marginBottom: 2,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}>{o.title}</div>
                {o.subtitle && (
                  <div style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 8,
                    color: theme.light.ink4,
                    marginBottom: 4,
                    letterSpacing: '0.04em',
                  }}>{o.subtitle}</div>
                )}
                {o.lat && o.lng && (
                  <div style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 8,
                    color: isWinner ? theme.light.brass : 'rgba(184,148,78,0.55)',
                    letterSpacing: '0.04em',
                  }}>
                    {Math.abs(o.lat).toFixed(4)}° {o.lat >= 0 ? 'N' : 'S'}, {Math.abs(o.lng).toFixed(4)}° {o.lng >= 0 ? 'E' : 'W'}
                  </div>
                )}
              </div>

              {/* Score + maps link */}
              <div style={{
                flexShrink: 0,
                padding: '11px 12px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                justifyContent: 'space-between',
              }}>
                <div style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 18,
                  fontWeight: 700,
                  color: isWinner ? theme.light.brass : theme.light.ink3,
                  lineHeight: 1,
                }}>{sc.toFixed(2)}</div>
                <div style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 9,
                  color: theme.light.brass,
                  letterSpacing: '0.06em',
                }}>↗ maps</div>
              </div>
            </a>
          );
        })}

        {disqualified.length > 0 && (
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 8,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: theme.light.ink4,
            margin: '6px 0 2px',
          }}>Disqualified</div>
        )}

        {disqualified.map(o => (
          <a
            key={o.id}
            href={optionMapsUrl(o)}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'stretch',
              background: theme.light.surface,
              borderRadius: 12,
              border: '1px solid #E8D0C8',
              textDecoration: 'none',
              overflow: 'hidden',
              opacity: 0.6,
            }}
          >
            <div style={{
              width: 48, flexShrink: 0,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              padding: '12px 0', gap: 5,
              borderRight: '1px solid #EDE8DF',
            }}>
              <PinIcon color="#C77B5C" size={18} />
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                color: '#C77B5C',
              }}>⚠</div>
            </div>
            <div style={{ flex: 1, padding: '11px 12px', minWidth: 0 }}>
              <div style={{
                fontFamily: 'var(--font-serif)',
                fontWeight: 300,
                fontSize: 16,
                color: theme.light.ink3,
                textDecoration: 'line-through',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}>{o.title}</div>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 8,
                color: '#C77B5C',
                marginTop: 3,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}>Disqualified · tap to view</div>
            </div>
            <div style={{ padding: '11px 12px', flexShrink: 0, display: 'flex', alignItems: 'flex-end' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#C77B5C' }}>↗ maps</div>
            </div>
          </a>
        ))}

      </div>
      </div>
    </div>
  );
}
