export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { redirect } from 'next/navigation';
import Link from 'next/link';
import { isAuthenticated } from '@/lib/auth';
import { theme } from '@/lib/theme';

export default async function AdminPage() {
  if (!(await isAuthenticated())) redirect('/admin/login');

  // Import supabaseAdmin dynamically so it doesn't run at build time
  const { supabaseAdmin } = await import('@/lib/supabase');

  let rankings: any[] = [];
  try {
    const { data } = await supabaseAdmin()
      .from('omo_rankings')
      .select('*')
      .order('created_at', { ascending: false });
    rankings = data ?? [];
  } catch (e) {
    console.error('Failed to load rankings:', e);
  }

  return (
    <div style={{
      maxWidth: 640,
      margin: '0 auto',
      padding: '48px 20px 80px',
      fontFamily: 'var(--font-sans)',
    }}>
      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 9,
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
        color: theme.brassLow,
        marginBottom: 6,
      }}>omo · admin</div>
      <h1 style={{
        fontFamily: 'var(--font-serif)',
        fontWeight: 300,
        fontSize: 26,
        color: theme.cream,
        marginBottom: 32,
      }}>Rankings</h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {rankings.map((r: any) => (
          <div key={r.id} style={{
            background: theme.board,
            border: `1px solid ${theme.border}`,
            borderRadius: 12,
            padding: '14px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
          }}>
            <div>
              <div style={{
                fontFamily: 'var(--font-serif)',
                fontWeight: 300,
                fontSize: 15,
                color: theme.cream,
                marginBottom: 3,
              }}>{r.title}</div>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 8,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: theme.brassLow,
              }}>
                {r.category} · {r.is_decided ? '✓ decided' : 'active'} · {r.is_published ? 'published' : 'draft'}
              </div>
            </div>
            <Link href={`/r/${r.slug}`} style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 8,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: theme.brassLow,
              padding: '5px 10px',
              border: `1px solid ${theme.border}`,
              borderRadius: 6,
            }}>View</Link>
          </div>
        ))}
      </div>

      <div style={{
        marginTop: 24,
        fontFamily: 'var(--font-mono)',
        fontSize: 9,
        letterSpacing: '0.08em',
        color: 'rgba(200,169,126,0.3)',
        textTransform: 'uppercase',
        lineHeight: 1.8,
      }}>
        Rankings are seeded via SQL in the Kura Supabase editor.
      </div>
    </div>
  );
}
