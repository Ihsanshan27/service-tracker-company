import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Car, FileText, Wrench, Users, X, ArrowRight, Loader2, Command } from 'lucide-react';
import api from '../api/api';

interface SearchResults {
  vehicles: any[];
  documents: any[];
  histories: any[];
  users: any[];
}

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

const GlobalSearch: React.FC<GlobalSearchProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResults>({ vehicles: [], documents: [], histories: [], users: [] });
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const totalResults = results.vehicles.length + results.documents.length + results.histories.length + results.users.length;

  const performSearch = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setResults({ vehicles: [], documents: [], histories: [], users: [] });
      setHasSearched(false);
      return;
    }
    setLoading(true);
    try {
      const res = await api.get(`/search?q=${encodeURIComponent(q)}`);
      setResults(res.data.data);
      setHasSearched(true);
    } catch {
      setResults({ vehicles: [], documents: [], histories: [], users: [] });
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounce search
  useEffect(() => {
    const timeout = setTimeout(() => performSearch(query), 350);
    return () => clearTimeout(timeout);
  }, [query, performSearch]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setResults({ vehicles: [], documents: [], histories: [], users: [] });
      setHasSearched(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  const goTo = (path: string) => {
    navigate(path);
    onClose();
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('id-ID', { dateStyle: 'medium' });

  const statusColors: Record<string, string> = {
    ACTIVE: 'bg-green-100 text-green-700',
    INACTIVE: 'bg-slate-100 text-slate-600',
    MAINTENANCE: 'bg-yellow-100 text-yellow-700',
    SOLD: 'bg-red-100 text-red-700',
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-2xl mx-4 rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
        {/* Search Input */}
        <div className="flex items-center gap-3 border-b border-slate-200 px-4 py-3 dark:border-slate-700">
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin text-primary-500 shrink-0" />
          ) : (
            <Search className="h-5 w-5 text-slate-400 shrink-0" />
          )}
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari kendaraan, dokumen, servis, pengguna..."
            className="flex-1 bg-transparent text-base text-slate-800 outline-none placeholder:text-slate-400 dark:text-slate-100"
          />
          {query && (
            <button onClick={() => setQuery('')} className="shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
              <X className="h-4 w-4" />
            </button>
          )}
          <kbd className="hidden shrink-0 rounded-lg border border-slate-200 bg-slate-100 px-2 py-1 text-xs text-slate-500 sm:inline dark:border-slate-600 dark:bg-slate-800 dark:text-slate-400">
            Esc
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto p-3">
          {!hasSearched && !loading && (
            <div className="flex flex-col items-center gap-3 py-12 text-slate-400">
              <div className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs dark:bg-slate-800">
                <Command className="h-3 w-3" />
                <span>K</span>
              </div>
              <p className="text-sm">Ketik minimal 2 karakter untuk mencari</p>
            </div>
          )}

          {hasSearched && totalResults === 0 && !loading && (
            <div className="py-12 text-center text-sm text-slate-400">
              Tidak ada hasil untuk <span className="font-semibold text-slate-600 dark:text-slate-300">"{query}"</span>
            </div>
          )}

          {/* Vehicles */}
          {results.vehicles.length > 0 && (
            <div className="mb-3">
              <p className="mb-1.5 px-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Kendaraan</p>
              <div className="space-y-1">
                {results.vehicles.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => goTo(`/vehicles/${v.id}`)}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400">
                      <Car className="h-4.5 w-4.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
                        {v.brand} {v.model} <span className="text-slate-400">({v.year})</span>
                      </p>
                      <p className="text-xs text-slate-500">{v.plateNumber} · {v.vehicleType}</p>
                    </div>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusColors[v.status] || 'bg-slate-100 text-slate-500'}`}>
                      {v.status}
                    </span>
                    <ArrowRight className="h-4 w-4 shrink-0 text-slate-300" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Documents */}
          {results.documents.length > 0 && (
            <div className="mb-3">
              <p className="mb-1.5 px-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Dokumen</p>
              <div className="space-y-1">
                {results.documents.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => goTo('/documents')}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400">
                      <FileText className="h-4.5 w-4.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">{d.documentType} — {d.documentNumber}</p>
                      <p className="text-xs text-slate-500">{d.vehicle?.plateNumber} · Exp: {formatDate(d.expiryDate)}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 shrink-0 text-slate-300" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Histories */}
          {results.histories.length > 0 && (
            <div className="mb-3">
              <p className="mb-1.5 px-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Riwayat Servis</p>
              <div className="space-y-1">
                {results.histories.map((h) => (
                  <button
                    key={h.id}
                    onClick={() => goTo('/histories')}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400">
                      <Wrench className="h-4.5 w-4.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">{h.title}</p>
                      <p className="text-xs text-slate-500">{h.vehicle?.plateNumber} · {h.workshopName} · {formatDate(h.serviceDate)}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 shrink-0 text-slate-300" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Users */}
          {results.users.length > 0 && (
            <div className="mb-3">
              <p className="mb-1.5 px-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Pengguna</p>
              <div className="space-y-1">
                {results.users.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => goTo('/users')}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400">
                      <Users className="h-4.5 w-4.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">{u.name}</p>
                      <p className="text-xs text-slate-500">{u.email} · {u.role}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 shrink-0 text-slate-300" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-4 border-t border-slate-200 px-4 py-2.5 text-xs text-slate-400 dark:border-slate-700">
          <span><kbd className="rounded border border-slate-200 bg-slate-100 px-1.5 py-0.5 font-mono dark:border-slate-600 dark:bg-slate-800">↑↓</kbd> navigasi</span>
          <span><kbd className="rounded border border-slate-200 bg-slate-100 px-1.5 py-0.5 font-mono dark:border-slate-600 dark:bg-slate-800">Enter</kbd> pilih</span>
          <span><kbd className="rounded border border-slate-200 bg-slate-100 px-1.5 py-0.5 font-mono dark:border-slate-600 dark:bg-slate-800">Esc</kbd> tutup</span>
          {hasSearched && <span className="ml-auto">{totalResults} hasil</span>}
        </div>
      </div>
    </div>
  );
};

export default GlobalSearch;
