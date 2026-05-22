import { getRankings, OmoRanking } from '@/lib/supabase';
import { HomeClient } from '@/components/HomeClient';

export const revalidate = 60;

export default async function HomePage() {
  let rankings: OmoRanking[] = [];
  try {
    rankings = await getRankings();
  } catch (e) {
    console.error('Failed to load rankings:', e);
  }
  return <HomeClient rankings={rankings} />;
}
