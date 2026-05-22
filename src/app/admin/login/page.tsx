'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { theme } from '@/lib/theme';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await fetch('/api/admin/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      router.push('/admin');
    } else {
      setError('Wrong password');
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    }}>
      <div style={{
        background: theme.board,
        border: `1px solid ${theme.border}`,
        borderRadius: 16,
        padding: '32px 28px',
        width: '100%',
        maxWidth: 320,
      }}>
        <div style={{
          textAlign: 'center',
          marginBottom: 28,
        }}>
          <div style={{
            fontFamily: 'var(--font-serif)',
            fontWeight: 300,
            fontSize: 22,
            color: theme.cream,
          }}>omo</div>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 8,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: theme.brassLow,
            marginTop: 4,
          }}>Admin</div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={{
              background: theme.surface,
              border: `1px solid ${theme.border}`,
              borderRadius: 8,
              padding: '12px 14px',
              fontSize: 14,
              color: theme.cream,
              outline: 'none',
              fontFamily: 'var(--font-sans)',
            }}
          />
          {error && (
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 9,
              color: '#E24B4A',
              textAlign: 'center',
              letterSpacing: '0.08em',
            }}>{error}</div>
          )}
          <button
            type="submit"
            disabled={loading}
            style={{
              background: theme.brass,
              color: '#1C1A16',
              border: 'none',
              borderRadius: 8,
              padding: '12px 0',
              fontFamily: 'var(--font-mono)',
              fontSize: 9,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              cursor: loading ? 'wait' : 'pointer',
              fontWeight: 700,
            }}
          >
            {loading ? '...' : 'Enter'}
          </button>
        </form>
      </div>
    </div>
  );
}
