'use client';

import { useEffect, useState } from 'react';
import { theme } from '@/lib/theme';

// Detects a new Vercel deploy by comparing the x-vercel-deployment-id
// header on a HEAD request. Installed iOS PWAs resume without reloading,
// so without this a deploy silently never appears. Checks on launch and
// on visibilitychange, throttled to once per 5 minutes. Never reloads on
// its own — the user taps Reload.
const CHECK_INTERVAL_MS = 5 * 60 * 1000;

export function UpdateBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    let deploymentId: string | null = null;
    let lastChecked = 0;

    async function check() {
      const now = Date.now();
      if (now - lastChecked < CHECK_INTERVAL_MS) return;
      lastChecked = now;
      try {
        const res = await fetch('/', { method: 'HEAD', cache: 'no-store' });
        const id = res.headers.get('x-vercel-deployment-id');
        if (!id) return;
        if (deploymentId === null) {
          deploymentId = id;
        } else if (id !== deploymentId) {
          setShow(true);
        }
      } catch {
        // Network error — silently ignore
      }
    }

    function onVisible() {
      if (document.visibilityState === 'visible') check();
    }

    check();
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, []);

  if (!show) return null;

  return (
    <div style={{
      // Sticky top — omo scrolls the document itself, so plain flow
      // would scroll the banner away. (Sticky is only cursed for the
      // bottom bar; a top banner is fine.)
      position: 'sticky',
      top: 0,
      zIndex: 60,
      background: theme.board,
      borderBottom: `1px solid ${theme.brass}`,
      borderLeft: `3px solid ${theme.brass}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '9px 14px 9px 11px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={theme.brass} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 19V5M5 12l7-7 7 7"/>
        </svg>
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: theme.brass,
          fontWeight: 600,
        }}>
          Update available
        </span>
      </div>
      <button
        onClick={() => window.location.reload()}
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 9,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          fontWeight: 700,
          background: theme.brass,
          color: theme.board,
          border: 'none',
          borderRadius: 5,
          padding: '5px 12px',
          cursor: 'pointer',
        }}
      >
        Reload
      </button>
    </div>
  );
}
