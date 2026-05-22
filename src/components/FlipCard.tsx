'use client';

import { useState } from 'react';
import { OmoOption, OmoCriterion, OmoScore, computeScore } from '@/lib/supabase';
import { ScoreBar } from './ScoreBar';
import { theme } from '@/lib/theme';

interface FlipCardProps {
  option: OmoOption;
  rank: number;
  criteria: OmoCriterion[];
  scores: OmoScore[];
}

export function FlipCard({ option, rank, criteria, scores }: FlipCardProps) {
  const [flipped, setFlipped] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const score = computeScore(option, criteria, scores);
  const isWinner = rank === 1 && !option.is_disqualified;
  const isDisq = option.is_disqualified;

  const sortedCriteria = [...criteria].sort((a, b) => b.weight - a.weight);
  const topCriteria = sortedCriteria.slice(0, 5);
  const restCriteria = sortedCriteria.slice(5);
  const hasMore = restCriteria.length > 0;

  const frontBorder = isWinner
    ? `1.5px solid ${theme.light.brass}`
    : isDisq
    ? '1px solid #C77B5C'
    : `1px solid ${theme.light.border}`;

  const cardHeight = expanded
    ? 230 + restCriteria.length * 22
    : 230;

  return (
    <div style={{
      width: '100%',
      height: cardHeight,
      perspective: 900,
      marginBottom: 10,
      transition: 'height 0.25s ease',
    }}>
      <div style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        transformStyle: 'preserve-3d',
        transition: 'transform 0.44s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
      }}>

        {/* ── FRONT ── */}
        <div
          onClick={() => setFlipped(true)}
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 12,
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            overflow: 'hidden',
            background: theme.light.surface,
            border: frontBorder,
            opacity: isDisq ? 0.72 : 1,
            display: 'flex',
            flexDirection: 'column',
            cursor: 'pointer',
          }}
        >
          {/* Header */}
          <div style={{
            padding: '10px 14px 8px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            borderBottom: `1px solid ${theme.light.bgSubtle}`,
            flexShrink: 0,
          }}>
            <div>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 9,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: theme.light.ink4,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                marginBottom: 2,
              }}>
                #{rank}
                {isWinner && (
                  <span style={{
                    background: theme.light.brassLight,
                    color: '#7A5A1A',
                    fontSize: 7,
                    padding: '1px 6px',
                    borderRadius: 20,
                    letterSpacing: '0.08em',
                  }}>Top pick</span>
                )}
                {isDisq && (
                  <span style={{
                    background: '#FDEEE8',
                    color: '#993C1D',
                    fontSize: 7,
                    padding: '1px 6px',
                    borderRadius: 20,
                    letterSpacing: '0.08em',
                  }}>⚠ Disqualified</span>
                )}
              </div>
              <div style={{
                fontFamily: 'var(--font-serif)',
                fontWeight: 300,
                fontSize: 16,
                color: isDisq ? theme.light.ink4 : theme.light.ink,
                textDecoration: isDisq ? 'line-through' : 'none',
              }}>
                {option.title}
              </div>
              {option.subtitle && (
                <div style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 8,
                  color: theme.light.ink4,
                  marginTop: 1,
                  letterSpacing: '0.06em',
                }}>
                  {option.subtitle}
                </div>
              )}
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{
                fontFamily: 'var(--font-serif)',
                fontWeight: 300,
                fontSize: 30,
                color: isDisq ? theme.light.ink4 : theme.light.ink,
                lineHeight: 1,
              }}>
                {isDisq ? score.toFixed(1) : score.toFixed(2)}
              </div>

            </div>
          </div>

          {/* Bars — clicking here flips (inherited from parent) */}
          <div style={{ padding: '8px 14px 4px', flex: 1 }}>
            {topCriteria.map(criterion => {
              const s = scores.find(
                sc => sc.option_id === option.id && sc.criterion_id === criterion.id
              );
              return (
                <ScoreBar key={criterion.id} label={criterion.label} value={s?.value ?? 0} />
              );
            })}
            {expanded && restCriteria.map(criterion => {
              const s = scores.find(
                sc => sc.option_id === option.id && sc.criterion_id === criterion.id
              );
              return (
                <ScoreBar key={criterion.id} label={criterion.label} value={s?.value ?? 0} />
              );
            })}
          </div>

          {/* Expand button — stops propagation so it doesn't flip */}
          {hasMore && (
            <button
              onClick={e => { e.stopPropagation(); setExpanded(x => !x); }}
              style={{
                width: '100%',
                padding: '8px 14px',
                fontFamily: 'var(--font-mono)',
                fontSize: 9,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'rgba(184,148,78,0.7)',
                background: 'rgba(184,148,78,0.06)',
                borderTop: '1px solid rgba(184,148,78,0.12)',
                borderBottom: 'none',
                borderLeft: 'none',
                borderRight: 'none',
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              {expanded ? '↑ show less' : `↓ show ${restCriteria.length} more criteria`}
            </button>
          )}
        </div>

        {/* ── BACK ── */}
        <div
          onClick={() => setFlipped(false)}
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 12,
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            overflow: 'hidden',
            transform: 'rotateY(180deg)',
            background: isDisq ? '#2A1010' : theme.bg,
            border: isDisq
              ? '1px solid rgba(199,123,92,0.2)'
              : `1px solid ${theme.brassLower}`,
            padding: '14px 16px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            cursor: 'pointer',
          }}
        >
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <div style={{
              fontFamily: 'var(--font-serif)',
              fontWeight: 300,
              fontSize: 16,
              color: isDisq ? '#F5C4B3' : theme.cream,
              marginBottom: 8,
            }}>
              {option.title}
            </div>
            <div style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 13,
              fontWeight: 300,
              lineHeight: 1.6,
              color: isDisq
                ? 'rgba(245,196,179,0.85)'
                : 'rgba(245,237,224,0.85)',
            }}>
              {isDisq
                ? option.disqualify_reason ?? 'Disqualified — see notes.'
                : option.description ?? 'No description added yet.'}
            </div>
          </div>

          <div>
            {option.vibes && option.vibes.length > 0 && (
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 10, marginBottom: 6 }}>
                {option.vibes.map((tag, i) => (
                  <span key={i} style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 7,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    padding: '2px 6px',
                    borderRadius: 4,
                    background: isDisq
                      ? 'rgba(199,123,92,0.2)'
                      : 'rgba(200,169,126,0.18)',
                    color: isDisq
                      ? 'rgba(245,196,179,0.9)'
                      : 'rgba(245,237,224,0.85)',
                  }}>
                    {tag}
                  </span>
                ))}
              </div>
            )}
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 7,
              letterSpacing: '0.1em',
              color: isDisq ? 'rgba(199,123,92,0.4)' : 'rgba(200,169,126,0.4)',
              textTransform: 'uppercase',
              textAlign: 'right',
            }}>
              tap to flip ‹
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
