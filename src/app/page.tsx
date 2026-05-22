import { notFound } from 'next/navigation';
import { getRankingBySlug, getReviewers, getReviewsForRanking } from '@/lib/supabase';
import { RankingClient } from '@/components/RankingClient';

export const revalidate = 0;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function RankingPage({ params }: PageProps) {
  const { slug } = await params;
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
