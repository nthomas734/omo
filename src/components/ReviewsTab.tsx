'use client';

import { useState } from 'react';
import {
  OmoOption, OmoCriterion, OmoScore, OmoReviewer,
  OmoReview, OmoReviewRating, OmoReviewPhoto,
  VibeTag, computeScore,
} from '@/lib/supabase';
import { ReviewWizard } from './ReviewWizard';
import { theme } from '@/lib/theme';

interface ReviewsTabProps {
  options: OmoOption[];
  criteria: OmoCriterion[];
  scores: OmoScore[];
  reviewers: OmoReviewer[];
  reviews: OmoReview[];
  ratings: OmoReviewRating[];
  photos: OmoReviewPhoto[];
  currentReviewerId: string | null;
  onReviewSubmitted: () => void;
}

const VIBE_LABELS: Record<VibeTag, { label: string; color: string; bg: string }> = {
  loved: { label: 'Loved it', color: '#085041', bg: '#E1F5EE' },
  liked: { label: 'Liked it', color: '#7A5A1A', bg: '#FDF8F0' },
  nope:  { label: 'Not for us', color: '#712B13', bg: '#FAECE7' },
};

export function ReviewsTab({
  options, criteria, scores, reviewers, reviews, ratings, photos,
  currentReviewerId, onReviewSubmitted,
}: ReviewsTabProps) {
  const [wizardOption, setWizardOption] = useState<OmoOption | null>(null);

  const ranked = [...options]
    .sort((a, b) => {
      if (a.is_disqualified && !b.is_disqualified) return 1;
      if (!a.is_disqualified && b.is_disqualified) return -1;
      return computeScore(b, criteria, scores) - computeScore(a, criteria, scores);
    });

  function getReview(optionId: string, reviewerId: string): OmoReview | undefined {
    return reviews.find(r => r.option_id === optionId && r.reviewer_id === reviewerId);
  }

  function bothReviewed(optionId: string): boolean {
    return reviewers.every(r => !!getReview(optionId, r.id));
  }

  function myReview(optionId: string): OmoReview | undefined {
    if (!currentReviewerId) return undefined;
    return getReview(optionId, currentReviewerId);
  }

  function getRatingsForReview(reviewId: string): OmoReviewRating[] {
    return ratings.filter(r => r.review_id === reviewId);
  }

  function getPhotosForReview(reviewId: string): OmoReviewPhoto[] {
    return photos.filter(p => p.review_id === reviewId);
  }

  return (
    <div style={{ padding: '14px 14px 80px' }}>

      {/* Legend */}
      <div style={{
        fontFamily: 'var(--font-mono)', fontSize: 8,
        letterSpacing: '0.14em', textTransform: 'uppercase',
        color: theme.light.ink4, marginBottom: 12,
      }}>
        {reviews.length === 0
          ? 'Tap "Review this" after visiting an option'
          : `${reviews.length} of ${options.length * reviewers.length} reviews in`}
      </div>

      {ranked.map((option, i) => {
        const sc = computeScore(option, criteria, scores);
        const isWinner = i === 0 && !option.is_disqualified;
        const both = bothReviewed(option.id);
        const mine = myReview(option.id);
        const hasMyReview = !!mine;

        return (
          <div key={option.id} style={{
            background: theme.light.surface,
            borderRadius: 14,
            border: isWinner
              ? `1.5px solid ${theme.light.brass}`
              : `1px solid ${theme.light.border}`,
            overflow: 'hidden',
            marginBottom: 12,
          }}>
            {/* Card header */}
            <div style={{
              padding: '11px 14px 10px',
              display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
              borderBottom: `1px solid ${theme.light.bgSubtle}`,
            }}>
              <div>
                <div style={{
                  fontFamily: 'var(--font-mono)', fontSize: 8, letterSpacing: '0.1em',
                  textTransform: 'uppercase', color: theme.light.ink4, marginBottom: 2,
                }}>#{i + 1}{isWinner ? ' · Top pick' : ''}</div>
                <div style={{ fontFamily: 'var(--font-serif)', fontWeight: 300, fontSize: 16, color: theme.light.ink }}>{option.title}</div>
                {option.subtitle && (
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: theme.light.ink4, marginTop: 1 }}>{option.subtitle}</div>
                )}
              </div>
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: 16, fontWeight: 700,
                color: isWinner ? theme.light.brass : theme.light.ink3,
              }}>{sc.toFixed(2)}</div>
            </div>

            {/* Reviews body */}
            {both ? (
              /* ── REVEALED — both reviewed ── */
              <div style={{ padding: '10px 14px' }}>
                {reviewers.map((reviewer, ri) => {
                  const rev = getReview(option.id, reviewer.id);
                  if (!rev) return null;
                  const vibe = VIBE_LABELS[rev.vibe];
                  const revRatings = getRatingsForReview(rev.id);
                  const revPhotos = getPhotosForReview(rev.id);
                  return (
                    <div key={reviewer.id}>
                      {ri > 0 && <div style={{ height: 1, background: theme.light.bgSubtle, margin: '10px 0' }} />}
                      <div style={{ display: 'flex', gap: 10 }}>
                        <div style={{
                          width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                          background: reviewer.color,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, color: '#C8A97E',
                        }}>{reviewer.name[0]}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                            <span style={{
                              fontFamily: 'var(--font-mono)', fontSize: 8, letterSpacing: '0.06em',
                              padding: '2px 8px', borderRadius: 20,
                              background: vibe.bg, color: vibe.color,
                            }}>{vibe.label}</span>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: theme.light.ink4 }}>{reviewer.name}</span>
                          </div>
                          {rev.note && (
                            <div style={{
                              fontFamily: 'var(--font-sans)', fontWeight: 300, fontSize: 12,
                              color: theme.light.ink2, lineHeight: 1.55, marginBottom: 6,
                            }}>{rev.note}</div>
                          )}
                          {revRatings.length > 0 && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 6 }}>
                              {revRatings.map(rr => {
                                const c = criteria.find(x => x.id === rr.criterion_id);
                                if (!c) return null;
                                return (
                                  <span key={rr.id} style={{
                                    fontFamily: 'var(--font-mono)', fontSize: 7, padding: '2px 7px',
                                    background: theme.light.bgSubtle, borderRadius: 20,
                                    color: theme.light.ink3,
                                  }}>
                                    {c.label} {'★'.repeat(rr.stars)}{'☆'.repeat(5 - rr.stars)}
                                  </span>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* ── LOCKED / PENDING ── */
              <div style={{ padding: '12px 14px' }}>
                {reviewers.map(reviewer => {
                  const rev = getReview(option.id, reviewer.id);
                  const isMe = reviewer.id === currentReviewerId;
                  return (
                    <div key={reviewer.id} style={{
                      display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8,
                    }}>
                      <div style={{
                        width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                        background: rev ? reviewer.color : theme.light.bgSubtle,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700,
                        color: rev ? '#C8A97E' : theme.light.ink4,
                      }}>{rev ? reviewer.name[0] : '?'}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: theme.light.ink3 }}>{reviewer.name}</div>
                        <div style={{
                          fontFamily: 'var(--font-mono)', fontSize: 8,
                          color: rev ? '#2D6B4A' : theme.light.ink4,
                          textTransform: 'uppercase', letterSpacing: '0.07em',
                        }}>
                          {rev ? '✓ Submitted · waiting for other' : 'Not reviewed yet'}
                        </div>
                      </div>
                      {!rev && isMe && (
                        <button
                          onClick={() => setWizardOption(option)}
                          style={{
                            fontFamily: 'var(--font-mono)', fontSize: 8, letterSpacing: '0.08em',
                            textTransform: 'uppercase', padding: '5px 12px',
                            background: theme.bg, color: theme.cream,
                            border: 'none', borderRadius: 8, cursor: 'pointer',
                            flexShrink: 0,
                          }}
                        >
                          Review this →
                        </button>
                      )}
                    </div>
                  );
                })}

                {/* If not identified yet, show a general button */}
                {!currentReviewerId && !hasMyReview && (
                  <button
                    onClick={() => setWizardOption(option)}
                    style={{
                      width: '100%', marginTop: 4, padding: '10px',
                      background: theme.bg, color: theme.cream,
                      border: 'none', borderRadius: 8, cursor: 'pointer',
                      fontFamily: 'var(--font-mono)', fontSize: 9,
                      letterSpacing: '0.12em', textTransform: 'uppercase',
                    }}
                  >
                    Review this →
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* Review wizard */}
      {wizardOption && (
        <ReviewWizard
          option={wizardOption}
          criteria={criteria}
          reviewers={reviewers}
          currentReviewerId={currentReviewerId}
          onClose={() => setWizardOption(null)}
          onSubmitted={() => {
            setWizardOption(null);
            onReviewSubmitted();
          }}
        />
      )}
    </div>
  );
}
