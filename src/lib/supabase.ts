import { createClient } from '@supabase/supabase-js';

const url  = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Browser-safe — public reads (RLS enforced)
export const supabase = createClient(url, anon);

// Server-only — bypasses RLS for admin writes
export function supabaseAdmin() {
  return createClient(url, process.env.SUPABASE_SERVICE_KEY!, {
    auth: { persistSession: false },
  });
}

// ── TYPES ────────────────────────────────────────────────

export type Category = 'life' | 'apartments' | 'travel' | 'gear' | 'other';

export interface OmoRanking {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  category: Category;
  is_decided: boolean;
  decided_at: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface OmoCriterion {
  id: string;
  ranking_id: string;
  label: string;
  weight: number;       // 0–100, all criteria for a ranking must sum to 100
  why: string | null;   // optional note explaining the weighting
  is_disqualifier: boolean;
  sort_order: number;
}

export interface OmoOption {
  id: string;
  ranking_id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  vibes: string[] | null;       // array of tag strings shown on card back
  pros: string[] | null;
  cons: string[] | null;
  maps_url: string | null;      // Google Maps URL if location-based
  lat: number | null;           // latitude for coordinate display
  lng: number | null;           // longitude for coordinate display
  is_disqualified: boolean;
  disqualify_reason: string | null;
  sort_order: number;
}

export interface OmoScore {
  id: string;
  option_id: string;
  criterion_id: string;
  value: number;        // 0–10
}

export interface OmoVersion {
  id: string;
  ranking_id: string;
  label: string;
  snapshot_json: VersionSnapshot;
  created_at: string;
}

export interface VersionSnapshot {
  criteria: OmoCriterion[];
  options: OmoOption[];
  scores: OmoScore[];
  computed_scores: Record<string, number>; // option_id → weighted score
}

// ── COMPUTED SCORE HELPER ────────────────────────────────

export function computeScore(
  option: OmoOption,
  criteria: OmoCriterion[],
  scores: OmoScore[]
): number {
  if (option.is_disqualified) return 0;

  let total = 0;
  let weightSum = 0;

  for (const criterion of criteria) {
    const score = scores.find(
      s => s.option_id === option.id && s.criterion_id === criterion.id
    );
    if (score) {
      total += (score.value / 10) * criterion.weight;
      weightSum += criterion.weight;
    }
  }

  if (weightSum === 0) return 0;
  return Math.round((total / weightSum) * 100) / 10;
}

// ── DATA FETCHING ────────────────────────────────────────

export async function getRankings(): Promise<OmoRanking[]> {
  const { data, error } = await supabase
    .from('omo_rankings')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getRankingBySlug(slug: string): Promise<{
  ranking: OmoRanking;
  criteria: OmoCriterion[];
  options: OmoOption[];
  scores: OmoScore[];
  versions: OmoVersion[];
} | null> {
  const { data: ranking } = await supabase
    .from('omo_rankings')
    .select('*')
    .eq('slug', slug)
    .single();

  if (!ranking) return null;

  const [{ data: criteria }, { data: options }, { data: scores }, { data: versions }] =
    await Promise.all([
      supabase.from('omo_criteria').select('*').eq('ranking_id', ranking.id).order('sort_order'),
      supabase.from('omo_options').select('*').eq('ranking_id', ranking.id).order('sort_order'),
      supabase.from('omo_scores').select('*').in(
        'option_id',
        (await supabase.from('omo_options').select('id').eq('ranking_id', ranking.id)).data?.map(o => o.id) ?? []
      ),
      supabase.from('omo_versions').select('*').eq('ranking_id', ranking.id).order('created_at', { ascending: false }),
    ]);

  return {
    ranking,
    criteria: criteria ?? [],
    options: options ?? [],
    scores: scores ?? [],
    versions: versions ?? [],
  };
}
