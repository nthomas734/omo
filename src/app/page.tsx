export const dynamic = 'force-dynamic';

import { HomeClient } from '@/components/HomeClient';
import { OmoRanking } from '@/lib/supabase';

export default async function HomePage() {
  let rankings: OmoRanking[] = [];
  try {
    const { getRankings } = await import('@/lib/supabase');
    rankings = await getRankings();
  } catch (e) {
    console.error('Failed to load rankings:', e);
  }
  return <HomeClient rankings={rankings} />;
}
