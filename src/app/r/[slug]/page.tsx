export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import { RankingClient } from '@/components/RankingClient';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function RankingPage({ params }: PageProps) {
  const { slug } = await params;

  const { getRankingBySlug, getReviewers, getReviewsForRanking } = await import('@/lib/supabase');

  const data = await getRankingBySlug(slug);

  if (!data || !data.ranking.is_published) {
    notFound();
  }

  const [reviewers, reviewData] = await Promise.all([
    getReviewers(),
    getReviewsForRanking(data.ranking.id),
  ]);

  return (
    <RankingClient
      {...data}
      reviewers={reviewers}
      reviews={reviewData.reviews}
      reviewRatings={reviewData.ratings}
      reviewPhotos={reviewData.photos}
    />
  );
}
