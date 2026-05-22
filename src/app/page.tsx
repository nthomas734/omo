import { getRankings } from '@/lib/supabase';
import { HomeClient } from '@/components/HomeClient';

export const revalidate = 60;

export default async function HomePage() {
  const rankings = await getRankings();
  return <HomeClient rankings={rankings} />;
}
