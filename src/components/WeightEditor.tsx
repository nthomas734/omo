'use client';

import { useState } from 'react';
import { OmoCriterion, OmoOption, OmoScore, computeScore } from '@/lib/supabase';
import { theme } from '@/lib/theme';

interface WeightEditorProps {
  criteria: OmoCriterion[];
  options: OmoOption[];
  scores: OmoScore[];
  onClose: () => void;
  onSave: (updated: OmoCriterion[]) => void;
}

export function WeightEditor({ criteria, options, scores, onClose, onSave }: WeightEditorProps) {
  const [weights, setWeights] = useState<Record<string, number>>(
    Object.fromEntries(criteria.map(c => [c.id, c.weight]))
  );

  const total = Object.values(weights).reduce((sum, w) => sum + w, 0);
  const isValid = Math.abs(total - 100) < 0.5;

  // Build temp criteria with updated weights for live scoring
  const tempCriteria = criteria.map(c => ({ ...c, weight: weights[c.id] ?? c.weight }));

  // Find current top option for live display
  const scoredOptions = options
    .filter(o => !o.is_disqualified)
    .map(o => ({ option: o, score: computeScore(o, tempCriteria, scores) }))
    .sort((a, b) => b.score - a.score);

  const topOption = scoredOptions[0];

  function handleSlider(id: string, value: number) {
    setWeights(prev => ({ ...prev, [id]: value }));
  }

  function handleSave() {
    if (!isValid) return;
    const updated = criteria.map(c => ({ ...c, weight: weights[c.id] ?? c.weight }));
    onSave(updated);
    onClose();
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(10, 28, 36, 0.6)',
          backdropFilter: 'blur(3px)',
          zIndex: 100,
        }}
      />

      {/* Sheet */}
      <div
        className="slide-up"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: theme.light.surface,
          borderRadius: '18px 18px 0 0',
          borderTop: `1px solid ${theme.light.border}`,
          zIndex: 101,
          maxHeight: '85vh',
          overflowY: 'auto',
          paddingBottom: 32,
        }}
      >
        {/* Drag handle */}
        <div style={{
          width: 36,
          height: 4,
          background: theme.light.borderMid,
          borderRadius: 2,
          margin: '12px auto 0',
        }} />

        {/* Header with live score */}
        <div style={{
          padding: '12px 20px 10px',
          borderBottom: `1px solid ${theme.light.bgSubtle}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div>
            <div style={{
              fontFamily: 'var(--font-serif)',
              fontWeight: 300,
              fontSize: 18,
              color: theme.light.ink,
            }}>Edit weights</div>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 8,
              letterSpacing: '0.1em',
              color: theme.light.brass,
              textTransform: 'uppercase',
              marginTop: 2,
            }}>● live re-scoring</div>
          </div>
          {topOption && (
            <div style={{ textAlign: 'right' }}>
              <div style={{
                fontFamily: 'var(--font-serif)',
                fontWeight: 300,
                fontSize: 24,
                color: theme.light.ink,
                lineHeight: 1,
              }}>
                {topOption.score.toFixed(2)}
              </div>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 8,
                color: theme.light.ink4,
                marginTop: 1,
              }}>
                {topOption.option.title}
              </div>
            </div>
          )}
        </div>

        {/* Total indicator */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '8px 20px',
          background: theme.light.bgSubtle,
          borderBottom: `1px solid ${theme.light.border}`,
        }}>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 9,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: theme.light.ink3,
          }}>Total</span>
          <div style={{
            flex: 1,
            height: 4,
            background: theme.light.borderMid,
            borderRadius: 2,
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%',
              width: `${Math.min(total, 100)}%`,
              background: isValid ? '#2D6B4A' : '#E24B4A',
              borderRadius: 2,
              transition: 'width 0.15s ease, background 0.15s ease',
            }} />
          </div>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            fontWeight: 700,
            color: isValid ? '#2D6B4A' : '#E24B4A',
            minWidth: 36,
            textAlign: 'right',
          }}>{total}%</span>
        </div>

        {/* Sliders */}
        <div style={{ padding: '12px 20px 0' }}>
          {criteria.map((c, i) => (
            <div key={c.id} style={{ marginBottom: 18 }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                marginBottom: 6,
              }}>
                <div>
                  <span style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: 13,
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
                      marginLeft: 6,
                    }}>disqualifier</span>
                  )}
                </div>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 14,
                  fontWeight: 700,
                  color: theme.light.brass,
                }}>{weights[c.id] ?? c.weight}%</span>
              </div>

              <input
                type="range"
                min={0}
                max={50}
                step={1}
                value={weights[c.id] ?? c.weight}
                onChange={e => handleSlider(c.id, Number(e.target.value))}
                style={{
                  width: '100%',
                  height: 6,
                  accentColor: theme.bg,
                  cursor: 'pointer',
                }}
              />

              {c.why && (
                <div style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 8,
                  letterSpacing: '0.06em',
                  color: theme.light.ink4,
                  textTransform: 'uppercase',
                  marginTop: 4,
                }}>{c.why}</div>
              )}
            </div>
          ))}
        </div>

        {/* Save button */}
        <div style={{ padding: '4px 20px 0' }}>
          <button
            onClick={handleSave}
            disabled={!isValid}
            style={{
              width: '100%',
              background: isValid ? theme.bg : theme.light.bgSubtle,
              color: isValid ? theme.cream : theme.light.ink4,
              border: 'none',
              borderRadius: 10,
              padding: '14px 0',
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              cursor: isValid ? 'pointer' : 'not-allowed',
              transition: 'background 0.2s ease',
            }}
          >
            {isValid ? 'Apply weights & re-rank' : `Adjust to reach 100% (${total}%)`}
          </button>
        </div>
      </div>
    </>
  );
}
