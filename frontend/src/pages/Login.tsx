import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import { Shield, Lock, Mail, AlertTriangle } from 'lucide-react';

const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await api.post('/auth/login', { email, password });
      const { accessToken, user } = response.data.data;
      login(accessToken, user);
      navigate('/');
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
        'Terjadi kesalahan saat masuk. Silakan periksa kembali email dan password Anda.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-900 px-4">
      {/* Decorative dynamic neon background blur spots */}
      <div className="absolute -left-12 -top-12 h-96 w-96 rounded-full bg-primary-500/20 blur-[100px]" />
      <div className="absolute -right-12 -bottom-12 h-96 w-96 rounded-full bg-indigo-500/20 blur-[100px]" />

      <div className="w-full max-w-md">
        <div className="dark-glass relative rounded-2xl p-8 shadow-2xl transition-all duration-300 hover:shadow-primary-500/5">
          <div className="mb-8 flex flex-col items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-500 text-white shadow-lg shadow-primary-500/30">
              <Shield className="h-6 w-6" />
            </div>
            <h1 className="mt-4 text-2xl font-bold tracking-tight text-white">Vehicle Tracker</h1>
            <p className="mt-1 text-sm text-slate-400">Sistem Pemantauan Pemeliharaan Armada</p>
          </div>

          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
              <AlertTriangle className="h-5 w-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Email Address
              </label>
              <div className="relative mt-2">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Mail className="h-5 w-5" />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800/50 py-3 pl-10 pr-4 text-sm text-white placeholder-slate-500 outline-none transition-all focus:border-primary-500 focus:bg-slate-800"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Password
              </label>
              <div className="relative mt-2">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Lock className="h-5 w-5" />
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800/50 py-3 pl-10 pr-4 text-sm text-white placeholder-slate-500 outline-none transition-all focus:border-primary-500 focus:bg-slate-800"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center rounded-xl bg-primary-500 py-3 font-semibold text-white shadow-lg shadow-primary-500/20 outline-none transition-all hover:bg-primary-600 hover:shadow-primary-500/35 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50"
            >
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                'Masuk ke Akun'
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-400">
            Belum memiliki akun?{' '}
            <Link to="/register" className="font-semibold text-primary-400 hover:underline">
              Daftar di sini
            </Link>
          </div>

          <div className="mt-6 text-center text-xs text-slate-500 border-t border-slate-800 pt-4">
            Default login: admin@example.com / password123
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
