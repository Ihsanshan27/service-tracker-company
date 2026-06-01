import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/api';
import { Shield, Lock, Mail, User, Phone, AlertTriangle, CheckCircle2 } from 'lucide-react';

const Register: React.FC = () => {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  
  const [isAllowed, setIsAllowed] = useState<boolean | null>(null);
  const [checkingSetting, setCheckingSetting] = useState(true);
  
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkRegistrationStatus = async () => {
      try {
        const response = await api.get('/settings/registration');
        setIsAllowed(response.data.data.registrationEnabled);
      } catch (err) {
        // Fallback to true if request fails
        setIsAllowed(true);
      } finally {
        setCheckingSetting(false);
      }
    };
    checkRegistrationStatus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await api.post('/auth/register', { name, email, password, phone: phone || undefined });
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
        'Terjadi kesalahan saat mendaftar. Silakan coba kembali beberapa saat lagi.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (checkingSetting) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-900">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

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
            <p className="mt-1 text-sm text-slate-400">Pendaftaran Akun Baru</p>
          </div>

          {!isAllowed ? (
            <div className="text-center py-6">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/10 text-amber-500">
                <AlertTriangle className="h-8 w-8" />
              </div>
              <h2 className="mt-4 text-lg font-bold text-white">Registrasi Dinonaktifkan</h2>
              <p className="mt-2 text-sm text-slate-400 px-4">
                Maaf, pendaftaran akun secara mandiri saat ini sedang dinonaktifkan oleh Administrator. Silakan hubungi admin perusahaan Anda untuk mendaftarkan akun baru.
              </p>
              <Link
                to="/login"
                className="mt-6 inline-block rounded-xl border border-slate-700 bg-slate-800/50 px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-slate-800"
              >
                Kembali ke Login
              </Link>
            </div>
          ) : success ? (
            <div className="text-center py-6 space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-500/10 text-green-500 animate-bounce">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h2 className="text-lg font-bold text-white">Pendaftaran Berhasil!</h2>
              <p className="text-sm text-slate-400 px-2">
                Akun Anda berhasil didaftarkan sebagai **Driver**. Anda akan dialihkan ke halaman login dalam beberapa detik...
              </p>
              <div className="pt-4">
                <div className="mx-auto h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-slate-800">
                  <div className="h-full w-full bg-green-500 animate-[loading_3s_ease-in-out_infinite]" />
                </div>
              </div>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-6 flex items-start gap-3 rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
                  <AlertTriangle className="h-5 w-5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Nama Lengkap
                  </label>
                  <div className="relative mt-2">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                      <User className="h-5 w-5" />
                    </span>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-xl border border-slate-700 bg-slate-800/50 py-3 pl-10 pr-4 text-sm text-white placeholder-slate-500 outline-none transition-all focus:border-primary-500 focus:bg-slate-800"
                      placeholder="Nama Lengkap Anda"
                    />
                  </div>
                </div>

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
                      placeholder="Minimal 6 Karakter"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Nomor Telepon <span className="text-slate-500">(Opsional)</span>
                  </label>
                  <div className="relative mt-2">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                      <Phone className="h-5 w-5" />
                    </span>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full rounded-xl border border-slate-700 bg-slate-800/50 py-3 pl-10 pr-4 text-sm text-white placeholder-slate-500 outline-none transition-all focus:border-primary-500 focus:bg-slate-800"
                      placeholder="08xxxxxxxxxx"
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
                    'Daftar Sekarang'
                  )}
                </button>
              </form>

              <div className="mt-6 text-center text-sm text-slate-400">
                Sudah memiliki akun?{' '}
                <Link to="/login" className="font-semibold text-primary-400 hover:underline">
                  Masuk di sini
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Register;
