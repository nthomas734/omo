import { notFound } from 'next/navigation';
import { getRankingBySlug } from '@/lib/supabase';
import { RankingClient } from '@/components/RankingClient';

export const revalidate = 60;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function RankingPage({ params }: PageProps) {
  const { slug } = await params;
  const data = await getRankingBySlug(slug);

  if (!data || !data.ranking.is_published) {
    notFound();
  }

  return <RankingClient {...data} />;
}
