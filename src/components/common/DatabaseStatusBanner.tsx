import React, { useState } from 'react';
import { isSupabaseConfigured } from '../../lib/supabase';

export const DatabaseStatusBanner: React.FC = () => {
  const [dismissed, setDismissed] = useState(false);
  const isConfigured = isSupabaseConfigured();

  if (dismissed) return null;

  return (
    <div
      className={`w-full py-2 px-4 text-xs font-medium flex items-center justify-between border-b ${
        isConfigured
          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
          : 'bg-amber-50 text-amber-900 border-amber-200'
      }`}
    >
      <div className="max-w-7xl mx-auto flex-1 flex items-center gap-2 flex-wrap">
        <span className="material-symbols-outlined text-sm">
          {isConfigured ? 'database' : 'info'}
        </span>
        <span>
          {isConfigured ? (
            <strong>Supabase Connected:</strong>
          ) : (
            <strong>Supabase Setup Required:</strong>
          )}
          {' '}
          {isConfigured
            ? 'Live PostgreSQL database queries, RPC order calculations, and auth listeners are active.'
            : 'Currently running with Greater Noida preview dataset. To connect your live Supabase database, set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.'}
        </span>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="text-on-surface-variant hover:text-on-surface p-1 rounded transition-colors"
        title="Dismiss notice"
      >
        <span className="material-symbols-outlined text-xs">close</span>
      </button>
    </div>
  );
};
