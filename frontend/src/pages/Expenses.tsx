import React, { useState, useEffect } from 'react';
import api from '../api/api';
import type { Vehicle } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  DollarSign,
  Search,
  Plus,
  Trash2,
  Calendar,
  Gauge,
  AlertTriangle,
  X,
  CreditCard,
  Fuel,
  Wrench,
  Shield,
  FileText,
  TrendingUp
} from 'lucide-react';

interface Expense {
  id: string;
  vehicleId: string;
  expenseType: 'FUEL' | 'SERVICE' | 'SPAREPART' | 'TAX' | 'INSURANCE' | 'PARKING' | 'TOLL' | 'OTHER';
  title: string;
  description?: string;
  amount: number;
  expenseDate: string;
  odometer?: number;
}

const Expenses: React.FC = () => {
  const { hasRole } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filters
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [vehicleFilter, setVehicleFilter] = useState('');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  const [form, setForm] = useState({
    vehicleId: '',
    expenseType: 'FUEL' as const,
    title: '',
    description: '',
    amount: 0,
    expenseDate: new Date().toISOString().split('T')[0],
    odometer: 0,
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const vehRes = await api.get('/vehicles');
      const vehData = vehRes.data?.data || vehRes.data || [];
      setVehicles(vehData);

      if (vehData.length > 0) {
        setForm((prev) => ({ ...prev, vehicleId: vehData[0].id }));
      }

      // Load expenses from localStorage to simulate persistent backend data
      const stored = localStorage.getItem('vehicle_expenses');
      let loadedExpenses: Expense[] = [];
      let needsSeed = true;
      if (stored) {
        try {
          loadedExpenses = JSON.parse(stored);
          needsSeed = false;
        } catch {
          localStorage.removeItem('vehicle_expenses');
        }
      }

      if (needsSeed) {
        // Pre-populate with realistic seed expenses if empty or corrupted
        const seedExpenses: Expense[] = vehData.slice(0, 3).map((v: Vehicle, i: number) => ({
          id: `seed-exp-${i}`,
          vehicleId: v.id,
          expenseType: i === 0 ? 'FUEL' : i === 1 ? 'TOLL' : 'PARKING',
          title: i === 0 ? 'Pengisian BBM Pertamax' : i === 1 ? 'Biaya Tol Dalam Kota' : 'Parkir Bulanan',
          description: 'Rutinitas operasional mingguan.',
          amount: i === 0 ? 350000 : i === 1 ? 45000 : 150000,
          expenseDate: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          odometer: v.currentOdometer - 100
        }));
        loadedExpenses = seedExpenses;
        localStorage.setItem('vehicle_expenses', JSON.stringify(seedExpenses));
      }
      setExpenses(loadedExpenses);
    } catch (err: any) {
      setError('Gagal memuat data aset kendaraan untuk relasi pengeluaran.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === 'amount' || name === 'odometer' ? Number(value) : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setModalLoading(true);
    setModalError(null);

    if (form.amount <= 0) {
      setModalError('Jumlah pengeluaran harus lebih besar dari Rp 0.');
      setModalLoading(false);
      return;
    }

    const newExpense: Expense = {
      id: `exp-${Date.now()}`,
      vehicleId: form.vehicleId,
      expenseType: form.expenseType,
      title: form.title,
      description: form.description || undefined,
      amount: form.amount,
      expenseDate: form.expenseDate,
      odometer: form.odometer || undefined,
    };

    const updated = [newExpense, ...expenses];
    setExpenses(updated);
    localStorage.setItem('vehicle_expenses', JSON.stringify(updated));

    // Reset Form
    setForm({
      vehicleId: vehicles[0]?.id || '',
      expenseType: 'FUEL',
      title: '',
      description: '',
      amount: 0,
      expenseDate: new Date().toISOString().split('T')[0],
      odometer: vehicles[0]?.currentOdometer || 0,
    });

    setModalLoading(false);
    setModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (!window.confirm('Hapus pencatatan biaya ini?')) return;
    const updated = expenses.filter(e => e.id !== id);
    setExpenses(updated);
    localStorage.setItem('vehicle_expenses', JSON.stringify(updated));
  };

  // Filtered lists
  const filteredExpenses = expenses.filter((exp) => {
    const veh = vehicles.find(v => v.id === exp.vehicleId);
    const matchesSearch = 
      exp.title.toLowerCase().includes(search.toLowerCase()) ||
      veh?.plateNumber.toLowerCase().includes(search.toLowerCase()) ||
      veh?.brand.toLowerCase().includes(search.toLowerCase()) ||
      veh?.model.toLowerCase().includes(search.toLowerCase());

    const matchesType = typeFilter === '' || exp.expenseType === typeFilter;
    const matchesVeh = vehicleFilter === '' || exp.vehicleId === vehicleFilter;

    return matchesSearch && matchesType && matchesVeh;
  });

  // Analytics
  const totalCostSum = filteredExpenses.reduce((acc, exp) => acc + exp.amount, 0);

  const typeLabels: Record<string, { label: string; icon: any; color: string }> = {
    FUEL: { label: 'Bahan Bakar', icon: Fuel, color: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
    SERVICE: { label: 'Servis', icon: Wrench, color: 'bg-blue-500/10 text-blue-600 border-blue-500/20' },
    SPAREPART: { label: 'Sparepart', icon: Wrench, color: 'bg-orange-500/10 text-orange-600 border-orange-500/20' },
    TAX: { label: 'Pajak Kendaraan', icon: FileText, color: 'bg-red-500/10 text-red-600 border-red-500/20' },
    INSURANCE: { label: 'Asuransi', icon: Shield, color: 'bg-purple-500/10 text-purple-600 border-purple-500/20' },
    PARKING: { label: 'Parkir', icon: DollarSign, color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
    TOLL: { label: 'Biaya Tol', icon: TrendingUp, color: 'bg-teal-500/10 text-teal-600 border-teal-500/20' },
    OTHER: { label: 'Lainnya', icon: FileText, color: 'bg-slate-500/10 text-slate-600 border-slate-500/20' },
  };

  const isFinanceOrAdmin = hasRole(['SUPER_ADMIN', 'FLEET_MANAGER', 'FINANCE']);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">Biaya & Pengeluaran</h1>
          <p className="mt-1 text-sm text-slate-500">Pantau dan kelola pengeluaran operasional armada seperti bahan bakar, tol, parkir, dan lainnya.</p>
        </div>
        {isFinanceOrAdmin && (
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-primary-500 px-4 py-2.5 font-semibold text-white shadow-lg shadow-primary-500/25 transition-all hover:bg-primary-600 hover:shadow-primary-500/35"
          >
            <Plus className="h-5 w-5" />
            <span>Catat Pengeluaran</span>
          </button>
        )}
      </div>

      {/* Analytics Summary */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="glass rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="rounded-xl bg-primary-500/10 p-3 text-primary-600">
            <DollarSign className="h-6 w-6" />
          </div>
          <div>
            <span className="block text-xs font-bold uppercase tracking-wider text-slate-400">Total Pengeluaran Terfilter</span>
            <span className="text-xl font-extrabold text-slate-800">Rp {totalCostSum.toLocaleString('id-ID')}</span>
          </div>
        </div>
        <div className="glass rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="rounded-xl bg-emerald-500/10 p-3 text-emerald-600">
            <CreditCard className="h-6 w-6" />
          </div>
          <div>
            <span className="block text-xs font-bold uppercase tracking-wider text-slate-400">Jumlah Transaksi</span>
            <span className="text-lg font-extrabold text-slate-800">{filteredExpenses.length} Pencatatan</span>
          </div>
        </div>
        <div className="glass rounded-2xl p-5 shadow-sm flex items-center gap-4 sm:col-span-2 lg:col-span-1">
          <div className="rounded-xl bg-amber-500/10 p-3 text-amber-600">
            <Fuel className="h-6 w-6" />
          </div>
          <div>
            <span className="block text-xs font-bold uppercase tracking-wider text-slate-400">Pengeluaran BBM Terfilter</span>
            <span className="text-lg font-extrabold text-slate-800">
              Rp {filteredExpenses.filter(e => e.expenseType === 'FUEL').reduce((sum, e) => sum + e.amount, 0).toLocaleString('id-ID')}
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Panel */}
      <div className="glass rounded-2xl p-5 shadow-sm flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Cari berdasarkan kegiatan pengeluaran, merk atau nomor polisi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-11 pr-4 py-2.5 text-sm text-slate-800 outline-none focus:border-primary-500 focus:bg-white"
          />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 outline-none focus:border-primary-500"
          >
            <option value="">Semua Kategori</option>
            <option value="FUEL">Bahan Bakar</option>
            <option value="SERVICE">Servis</option>
            <option value="SPAREPART">Sparepart</option>
            <option value="TAX">Pajak</option>
            <option value="INSURANCE">Asuransi</option>
            <option value="PARKING">Parkir</option>
            <option value="TOLL">Biaya Tol</option>
            <option value="OTHER">Lainnya</option>
          </select>
          <select
            value={vehicleFilter}
            onChange={(e) => setVehicleFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 outline-none focus:border-primary-500"
          >
            <option value="">Semua Kendaraan</option>
            {vehicles.map(v => (
              <option key={v.id} value={v.id}>{v.brand} {v.model} ({v.plateNumber})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Table */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
        </div>
      ) : error ? (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          <AlertTriangle className="h-5 w-5 shrink-0 text-red-500" />
          <span>{error}</span>
        </div>
      ) : filteredExpenses.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center max-w-lg mx-auto space-y-4">
          <DollarSign className="h-12 w-12 text-slate-300 mx-auto" />
          <h2 className="text-lg font-bold text-slate-800">Biaya Kosong</h2>
          <p className="text-sm text-slate-500">Tidak ada pengeluaran operasional kendaraan yang terekam.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full border-collapse text-left text-sm text-slate-500">
            <thead className="bg-slate-50/75 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Keterangan Biaya</th>
                <th className="px-6 py-4">Kendaraan</th>
                <th className="px-6 py-4">Kategori</th>
                <th className="px-6 py-4">Odometer Log</th>
                <th className="px-6 py-4">Jumlah Biaya</th>
                <th className="px-6 py-4">Tanggal Biaya</th>
                {isFinanceOrAdmin && <th className="px-6 py-4 text-center">Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredExpenses.map((exp) => {
                const veh = vehicles.find(v => v.id === exp.vehicleId);
                const typeConfig = typeLabels[exp.expenseType] || typeLabels.OTHER;
                const IconComponent = typeConfig.icon;
                return (
                  <tr key={exp.id} className="hover:bg-slate-50/50 transition-all text-slate-700">
                    <td className="px-6 py-4">
                      <div>
                        <span className="block font-bold text-slate-800">{exp.title}</span>
                        {exp.description && <span className="block text-xs text-slate-400 mt-0.5">"{exp.description}"</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {veh && (
                        <div className="space-y-1">
                          <span className="block font-bold text-slate-800">{veh.brand} {veh.model}</span>
                          <span className="inline-block rounded bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600">{veh.plateNumber}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-bold ${typeConfig.color}`}>
                        <IconComponent className="h-3.5 w-3.5" />
                        {typeConfig.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-bold">
                      {exp.odometer ? (
                        <span className="flex items-center gap-1"><Gauge className="h-4 w-4 text-slate-400" /> {exp.odometer.toLocaleString('id-ID')} KM</span>
                      ) : '-'}
                    </td>
                    <td className="px-6 py-4 font-extrabold text-primary-600">
                      Rp {exp.amount.toLocaleString('id-ID')}
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-slate-400" />
                        {new Date(exp.expenseDate).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
                      </span>
                    </td>
                    {isFinanceOrAdmin && (
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleDelete(exp.id)}
                          className="rounded-xl border border-red-100 p-2 text-red-500 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Creation Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          <div className="relative w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl space-y-6 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Catat Biaya Operasional</h3>
                <p className="text-xs text-slate-500 mt-1">Daftarkan rincian biaya tak terduga maupun operasional armada rutin.</p>
              </div>
              <button onClick={() => setModalOpen(false)} className="rounded-lg border p-1 text-slate-400 hover:bg-slate-50">
                <X className="h-5 w-5" />
              </button>
            </div>

            {modalError && (
              <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-600">
                <AlertTriangle className="h-4 w-4 shrink-0 text-red-500" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Pilih Kendaraan</label>
                  <select
                    name="vehicleId"
                    value={form.vehicleId}
                    onChange={(e) => {
                      const selVeh = vehicles.find(v => v.id === e.target.value);
                      setForm(prev => ({
                        ...prev,
                        vehicleId: e.target.value,
                        odometer: selVeh ? selVeh.currentOdometer : 0
                      }));
                    }}
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 outline-none focus:border-primary-500"
                  >
                    {vehicles.map((v) => (
                      <option key={v.id} value={v.id}>{v.brand} {v.model} ({v.plateNumber})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Kategori Biaya</label>
                  <select
                    name="expenseType"
                    value={form.expenseType}
                    onChange={handleChange}
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 outline-none focus:border-primary-500"
                  >
                    <option value="FUEL">Bahan Bakar</option>
                    <option value="SERVICE">Servis</option>
                    <option value="SPAREPART">Sparepart</option>
                    <option value="TAX">Pajak Kendaraan</option>
                    <option value="INSURANCE">Asuransi</option>
                    <option value="PARKING">Parkir</option>
                    <option value="TOLL">Biaya Tol</option>
                    <option value="OTHER">Lainnya</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Judul Kegiatan</label>
                  <input
                    type="text"
                    required
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="Contoh: Pembelian Bensin Pertamax"
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 outline-none focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Jumlah Biaya (Rupiah)</label>
                  <input
                    type="number"
                    required
                    name="amount"
                    value={form.amount}
                    onChange={handleChange}
                    placeholder="Contoh: 150000"
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 outline-none focus:border-primary-500 font-extrabold text-primary-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Odometer Saat Pengeluaran (KM)</label>
                  <input
                    type="number"
                    name="odometer"
                    value={form.odometer}
                    onChange={handleChange}
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 outline-none focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Tanggal Pengeluaran</label>
                  <input
                    type="date"
                    required
                    name="expenseDate"
                    value={form.expenseDate}
                    onChange={handleChange}
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 outline-none focus:border-primary-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Keterangan Tambahan / Deskripsi</label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Misal: Pembelian solar di SPBU Pasti Pas, struk terlampir..."
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 outline-none focus:border-primary-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-500 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="rounded-xl bg-primary-500 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-primary-500/20 hover:bg-primary-600 disabled:opacity-50"
                >
                  {modalLoading ? 'Menyimpan...' : 'Simpan Biaya'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Expenses;
