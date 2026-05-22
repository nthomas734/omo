'use client';

import { useState } from 'react';
import {
  OmoOption, OmoCriterion, OmoReviewer,
  VibeTag, submitReview,
} from '@/lib/supabase';
import { setReviewerId } from '@/lib/identity';
import { theme } from '@/lib/theme';

interface ReviewWizardProps {
  option: OmoOption;
  criteria: OmoCriterion[];
  reviewers: OmoReviewer[];
  currentReviewerId: string | null;
  onClose: () => void;
  onSubmitted: () => void;
}

type Step = 'who' | 'vibe' | 'ratings' | 'note' | 'submit';

const VIBE_OPTIONS: { key: VibeTag; label: string; sub: string; bg: string; border: string; textColor: string; subColor: string }[] = [
  { key: 'loved', label: 'Loved it', sub: 'Could picture living here', bg: '#E1F5EE', border: '#1D9E75', textColor: '#085041', subColor: 'rgba(8,80,65,0.6)' },
  { key: 'liked', label: 'Liked it', sub: 'Solid, a few reservations', bg: '#FDF8F0', border: '#B8944E', textColor: '#7A5A1A', subColor: 'rgba(122,90,26,0.6)' },
  { key: 'nope',  label: 'Not for us', sub: "Didn't feel right", bg: '#FAECE7', border: '#D85A30', textColor: '#712B13', subColor: 'rgba(113,43,19,0.6)' },
];

export function ReviewWizard({
  option, criteria, reviewers, currentReviewerId, onClose, onSubmitted,
}: ReviewWizardProps) {
  const visitCriteria = criteria.filter(c => (c as any).is_visit_rated !== false);

  const [step, setStep] = useState<Step>(currentReviewerId ? 'vibe' : 'who');
  const [reviewerId, setReviewerIdState] = useState<string>(currentReviewerId ?? '');
  const [vibe, setVibe] = useState<VibeTag | null>(null);
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const STEPS: Step[] = ['who', 'vibe', 'ratings', 'note', 'submit'];
  const stepIndex = STEPS.indexOf(step);
  const effectiveSteps = currentReviewerId ? STEPS.filter(s => s !== 'who') : STEPS;
  const effectiveIndex = effectiveSteps.indexOf(step);
  const effectiveTotal = effectiveSteps.length;

  function selectReviewer(id: string) {
    setReviewerIdState(id);
    setReviewerId(id);
    setStep('vibe');
  }

  function setStars(criterionId: string, stars: number) {
    setRatings(prev => ({ ...prev, [criterionId]: stars }));
  }

  async function handleSubmit() {
    if (!vibe || !reviewerId) return;
    setSubmitting(true);
    setError('');
    try {
      await submitReview({
        optionId: option.id,
        reviewerId,
        vibe,
        note,
        ratings: Object.entries(ratings).map(([criterionId, stars]) => ({ criterionId, stars })),
      });
      onSubmitted();
    } catch (e: any) {
      setError(e.message ?? 'Something went wrong');
      setSubmitting(false);
    }
  }

  const reviewer = reviewers.find(r => r.id === reviewerId);

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0,
        background: 'rgba(10,28,36,0.5)',
        backdropFilter: 'blur(3px)',
        zIndex: 200,
      }} />

      {/* Sheet */}
      <div className="slide-up" style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: theme.light.surface,
        borderRadius: '18px 18px 0 0',
        borderTop: `1px solid ${theme.light.border}`,
        zIndex: 201,
        maxHeight: '92vh',
        overflowY: 'auto',
        paddingBottom: 32,
      }}>
        {/* Drag handle */}
        <div style={{ width: 36, height: 4, background: theme.light.borderMid, borderRadius: 2, margin: '12px auto 0' }} />

        {/* Header */}
        <div style={{ background: theme.bg, padding: '12px 18px 14px', margin: '10px 0 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <button onClick={onClose} style={{
              fontFamily: 'var(--font-mono)', fontSize: 8, letterSpacing: '0.1em',
              textTransform: 'uppercase', color: 'rgba(200,169,126,0.5)',
              background: 'none', border: 'none', cursor: 'pointer', padding: 0,
            }}>✕ Cancel</button>
            {reviewer && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{
                  width: 20, height: 20, borderRadius: '50%',
                  background: reviewer.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-mono)', fontSize: 8, fontWeight: 700, color: '#C8A97E',
                }}>{reviewer.name[0]}</div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'rgba(200,169,126,0.6)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{reviewer.name}</span>
              </div>
            )}
          </div>
          {/* Progress pips */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 10 }}>
            {effectiveSteps.map((s, i) => (
              <div key={s} style={{
                flex: 1, height: 2, borderRadius: 2,
                background: i <= effectiveIndex ? '#C8A97E' : 'rgba(200,169,126,0.2)',
                transition: 'background 0.2s ease',
              }} />
            ))}
          </div>
          <div style={{ fontFamily: 'var(--font-serif)', fontWeight: 300, fontSize: 16, color: theme.cream }}>{option.title}</div>
          {option.subtitle && (
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'rgba(200,169,126,0.45)', marginTop: 2, letterSpacing: '0.05em' }}>{option.subtitle}</div>
          )}
        </div>

        <div style={{ padding: '20px 18px 0' }}>

          {/* ── WHO ── */}
          {step === 'who' && (
            <>
              <div style={{ fontFamily: 'var(--font-serif)', fontWeight: 300, fontSize: 22, color: theme.light.ink, marginBottom: 18 }}>Who just walked out?</div>
              {reviewers.map(r => (
                <button key={r.id} onClick={() => selectReviewer(r.id)} style={{
                  display: 'flex', alignItems: 'center', gap: 12, width: '100%',
                  padding: '14px 16px', marginBottom: 10,
                  background: theme.light.surface, border: `1px solid ${theme.light.border}`,
                  borderRadius: 12, cursor: 'pointer', textAlign: 'left',
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%', background: r.color, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, color: '#C8A97E',
                  }}>{r.name[0]}</div>
                  <div>
                    <div style={{ fontFamily: 'var(--font-serif)', fontWeight: 300, fontSize: 18, color: theme.light.ink }}>{r.name}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: theme.light.ink4, marginTop: 2, letterSpacing: '0.05em' }}>
                      Locked until the other person submits
                    </div>
                  </div>
                </button>
              ))}
            </>
          )}

          {/* ── VIBE ── */}
          {step === 'vibe' && (
            <>
              <div style={{ fontFamily: 'var(--font-serif)', fontWeight: 300, fontSize: 22, color: theme.light.ink, marginBottom: 18 }}>Walking out, your gut says—</div>
              {VIBE_OPTIONS.map(v => (
                <button key={v.key} onClick={() => { setVibe(v.key); setStep('ratings'); }} style={{
                  display: 'block', width: '100%', padding: '14px 16px', marginBottom: 10,
                  background: v.bg, border: `1.5px solid ${v.border}`, borderRadius: 12, cursor: 'pointer', textAlign: 'left',
                }}>
                  <div style={{ fontFamily: 'var(--font-serif)', fontWeight: 300, fontSize: 18, color: v.textColor }}>{v.label}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, textTransform: 'uppercase', letterSpacing: '0.07em', color: v.subColor, marginTop: 3 }}>{v.sub}</div>
                </button>
              ))}
            </>
          )}

          {/* ── RATINGS ── */}
          {step === 'ratings' && (
            <>
              <div style={{ fontFamily: 'var(--font-serif)', fontWeight: 300, fontSize: 22, color: theme.light.ink, marginBottom: 6 }}>Rate each one.</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: theme.light.ink4, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 20 }}>Based on what you saw in person</div>
              {visitCriteria.map(c => (
                <div key={c.id} style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontFamily: 'var(--font-sans)', fontSize: 15, fontWeight: 500, color: theme.light.ink }}>{c.label}</span>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {[1,2,3,4,5].map(star => (
                        <button key={star} onClick={() => setStars(c.id, star)} style={{
                          fontSize: 24, background: 'none', border: 'none', cursor: 'pointer', padding: '0 1px',
                          color: (ratings[c.id] ?? 0) >= star ? '#B8944E' : '#DDD8CE',
                          transition: 'color 0.1s ease',
                        }}>★</button>
                      ))}
                    </div>
                  </div>
                  <div style={{ height: 1, background: theme.light.bgSubtle }} />
                </div>
              ))}
              <button onClick={() => setStep('note')} style={{
                width: '100%', padding: '13px', background: theme.bg, color: theme.cream,
                border: 'none', borderRadius: 10, cursor: 'pointer',
                fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase',
              }}>Next →</button>
            </>
          )}

          {/* ── NOTE ── */}
          {step === 'note' && (
            <>
              <div style={{ fontFamily: 'var(--font-serif)', fontWeight: 300, fontSize: 22, color: theme.light.ink, marginBottom: 6 }}>Anything else?</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: theme.light.ink4, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 16 }}>What stuck with you?</div>
              <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="The corner unit is special. Views are insane..."
                style={{
                  width: '100%', minHeight: 120, padding: '12px 14px',
                  background: theme.light.surface, border: `1px solid ${theme.light.border}`,
                  borderRadius: 10, fontSize: 14, fontFamily: 'var(--font-sans)', fontWeight: 300,
                  color: theme.light.ink, lineHeight: 1.6, resize: 'vertical',
                  boxSizing: 'border-box',
                }}
              />
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <button onClick={() => setStep('ratings')} style={{
                  flex: 1, padding: '12px', background: theme.light.bgSubtle, color: theme.light.ink3,
                  border: 'none', borderRadius: 10, cursor: 'pointer',
                  fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase',
                }}>← Back</button>
                <button onClick={() => setStep('submit')} style={{
                  flex: 2, padding: '12px', background: theme.bg, color: theme.cream,
                  border: 'none', borderRadius: 10, cursor: 'pointer',
                  fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase',
                }}>Next →</button>
              </div>
            </>
          )}

          {/* ── SUBMIT ── */}
          {step === 'submit' && (
            <>
              <div style={{ fontFamily: 'var(--font-serif)', fontWeight: 300, fontSize: 22, color: theme.light.ink, marginBottom: 6 }}>Ready to submit?</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: theme.light.ink4, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 20 }}>Locked until the other person submits theirs</div>

              {/* Summary */}
              <div style={{
                background: theme.light.bgSubtle, borderRadius: 12, padding: '14px 16px', marginBottom: 20,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  {vibe && (() => {
                    const v = VIBE_OPTIONS.find(x => x.key === vibe)!;
                    return (
                      <span style={{
                        fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.08em',
                        padding: '3px 10px', borderRadius: 20,
                        background: v.bg, border: `1px solid ${v.border}`, color: v.textColor,
                      }}>{v.label}</span>
                    );
                  })()}
                </div>
                {note && (
                  <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 300, color: theme.light.ink2, lineHeight: 1.55 }}>{note}</div>
                )}
                {Object.entries(ratings).length > 0 && (
                  <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {Object.entries(ratings).map(([cid, stars]) => {
                      const c = criteria.find(x => x.id === cid);
                      if (!c) return null;
                      return (
                        <span key={cid} style={{
                          fontFamily: 'var(--font-mono)', fontSize: 8, padding: '2px 8px',
                          background: theme.light.surface, border: `1px solid ${theme.light.border}`,
                          borderRadius: 20, color: theme.light.ink3,
                        }}>
                          {c.label} {'★'.repeat(stars)}{'☆'.repeat(5 - stars)}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>

              {error && (
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#E24B4A', marginBottom: 12, textAlign: 'center' }}>{error}</div>
              )}

              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => setStep('note')} style={{
                  flex: 1, padding: '13px', background: theme.light.bgSubtle, color: theme.light.ink3,
                  border: 'none', borderRadius: 10, cursor: 'pointer',
                  fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase',
                }}>← Back</button>
                <button onClick={handleSubmit} disabled={submitting || !vibe} style={{
                  flex: 2, padding: '13px', background: vibe ? theme.bg : theme.light.bgSubtle,
                  color: vibe ? theme.cream : theme.light.ink4,
                  border: 'none', borderRadius: 10, cursor: vibe ? 'pointer' : 'default',
                  fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase',
                }}>{submitting ? 'Submitting...' : 'Submit review →'}</button>
              </div>
            </>
          )}

        </div>
      </div>
    </>
  );
}
