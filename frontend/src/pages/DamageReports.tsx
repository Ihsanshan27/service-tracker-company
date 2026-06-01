import React, { useState, useEffect } from 'react';
import api from '../api/api';
import type { Vehicle } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  AlertTriangle,
  Search,
  Plus,
  X,
  Car,
  Clock,
  User as UserIcon,
  Briefcase,
  CheckCircle,
  XCircle,
  Play
} from 'lucide-react';

interface DamageReport {
  id: string;
  vehicleId: string;
  reportedBy: string;
  assignedMechanic?: string;
  title: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'REPORTED' | 'APPROVED' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED';
  reportDate: string;
  completedDate?: string;
  notes?: string;
  reporterName?: string;
  mechanicName?: string;
}

const DamageReports: React.FC = () => {
  const { user, hasRole } = useAuth();
  const [reports, setReports] = useState<DamageReport[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const [form, setForm] = useState({
    vehicleId: '',
    title: '',
    description: '',
    priority: 'MEDIUM' as 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT',
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

      // Load damage reports from localStorage to simulate persistent backend data
      const stored = localStorage.getItem('damage_reports');
      let loadedReports: DamageReport[] = [];
      let needsSeed = true;
      if (stored) {
        try {
          loadedReports = JSON.parse(stored);
          needsSeed = false;
        } catch {
          localStorage.removeItem('damage_reports');
        }
      }

      if (needsSeed) {
        // Prepopulate with realistic seed damage reports
        const seeds: DamageReport[] = vehData.slice(0, 2).map((v: Vehicle, i: number) => ({
          id: `seed-dmg-${i}`,
          vehicleId: v.id,
          reportedBy: 'driver-id',
          title: i === 0 ? 'AC Tidak Dingin' : 'Bunyi Berdecit Saat Mengerem',
          description: i === 0 
            ? 'Saat dikendarai di siang hari, hembusan AC hanya keluar angin biasa dan tidak mendinginkan kabin.'
            : 'Ketika pedal rem ditekan pada kecepatan sedang, terdengar bunyi besi bergesekan kencang dari roda depan kanan.',
          priority: i === 0 ? 'MEDIUM' : 'HIGH',
          status: 'REPORTED',
          reportDate: new Date(Date.now() - i * 2 * 24 * 60 * 60 * 1000).toISOString(),
          reporterName: 'Driver Budi',
        }));
        loadedReports = seeds;
        localStorage.setItem('damage_reports', JSON.stringify(seeds));
      }
      setReports(loadedReports);
    } catch (err: any) {
      setError('Gagal memuat daftar kendaraan operasional.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setModalLoading(true);
    setModalError(null);

    if (!form.title || !form.description) {
      setModalError('Harap isi judul dan deskripsi laporan kerusakan.');
      setModalLoading(false);
      return;
    }

    const newReport: DamageReport = {
      id: `dmg-${Date.now()}`,
      vehicleId: form.vehicleId,
      reportedBy: user?.id || 'anonymous',
      title: form.title,
      description: form.description,
      priority: form.priority,
      status: 'REPORTED',
      reportDate: new Date().toISOString(),
      reporterName: user?.name || 'Driver',
    };

    const updated = [newReport, ...reports];
    setReports(updated);
    localStorage.setItem('damage_reports', JSON.stringify(updated));

    // Reset Form
    setForm({
      vehicleId: vehicles[0]?.id || '',
      title: '',
      description: '',
      priority: 'MEDIUM',
    });

    setModalOpen(false);
    setModalLoading(false);
  };

  // Status Flow Updates
  const handleUpdateStatus = (id: string, newStatus: DamageReport['status']) => {
    const updated = reports.map((rep) => {
      if (rep.id === id) {
        const payload: Partial<DamageReport> = {
          status: newStatus,
          notes: newStatus === 'REJECTED' ? 'Ditolak oleh Manager.' : undefined,
          completedDate: newStatus === 'COMPLETED' ? new Date().toISOString() : undefined,
        };

        if (newStatus === 'IN_PROGRESS' && user) {
          payload.assignedMechanic = user.id;
          payload.mechanicName = user.name;
        }

        return { ...rep, ...payload };
      }
      return rep;
    });

    setReports(updated);
    localStorage.setItem('damage_reports', JSON.stringify(updated));
  };

  // Filter Logic
  const filteredReports = reports.filter((rep) => {
    const veh = vehicles.find(v => v.id === rep.vehicleId);
    const matchesSearch = 
      rep.title.toLowerCase().includes(search.toLowerCase()) ||
      rep.description.toLowerCase().includes(search.toLowerCase()) ||
      veh?.plateNumber.toLowerCase().includes(search.toLowerCase()) ||
      veh?.brand.toLowerCase().includes(search.toLowerCase()) ||
      veh?.model.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === '' || rep.status === statusFilter;
    const matchesPriority = priorityFilter === '' || rep.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const priorityBadges: Record<string, string> = {
    LOW: 'bg-green-500/10 text-green-600 border-green-500/20',
    MEDIUM: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    HIGH: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
    URGENT: 'bg-red-500/10 text-red-600 border-red-500/20',
  };

  const statusBadges: Record<string, string> = {
    REPORTED: 'bg-slate-500/10 text-slate-600 border-slate-500/20',
    APPROVED: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    IN_PROGRESS: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
    COMPLETED: 'bg-green-500/10 text-green-600 border-green-500/20',
    REJECTED: 'bg-red-500/10 text-red-600 border-red-500/20',
  };

  const canReport = hasRole(['SUPER_ADMIN', 'FLEET_MANAGER', 'DRIVER']);
  const isManager = hasRole(['SUPER_ADMIN', 'FLEET_MANAGER']);
  const isMechanic = hasRole(['SUPER_ADMIN', 'MECHANIC']);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">Laporan Kerusakan</h1>
          <p className="mt-1 text-sm text-slate-500">Alur pelaporan kerusakan armada oleh pengemudi, persetujuan manager, hingga perbaikan mekanik.</p>
        </div>
        {canReport && (
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-primary-500 px-4 py-2.5 font-semibold text-white shadow-lg shadow-primary-500/25 transition-all hover:bg-primary-600 hover:shadow-primary-500/35"
          >
            <Plus className="h-5 w-5" />
            <span>Laporkan Kerusakan</span>
          </button>
        )}
      </div>

      {/* Filter panel */}
      <div className="glass rounded-2xl p-5 shadow-sm flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Cari kerusakan, detail, merk atau nomor polisi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-11 pr-4 py-2.5 text-sm text-slate-800 outline-none focus:border-primary-500 focus:bg-white"
          />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 outline-none focus:border-primary-500"
          >
            <option value="">Semua Prioritas</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 outline-none focus:border-primary-500"
          >
            <option value="">Semua Status</option>
            <option value="REPORTED">Reported</option>
            <option value="APPROVED">Approved</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {/* Damage Cards Grid */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center max-w-lg mx-auto space-y-4">
          <AlertTriangle className="h-12 w-12 text-slate-300 mx-auto" />
          <h2 className="text-lg font-bold text-slate-800">Laporan Tidak Ditemukan</h2>
          <p className="text-sm text-slate-500">Belum ada laporan kerusakan yang terekam atau sesuai dengan filter saat ini.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {filteredReports.map((rep) => {
            const veh = vehicles.find(v => v.id === rep.vehicleId);
            return (
              <div key={rep.id} className="glass rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col justify-between space-y-4 hover:shadow-md transition-all">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <span className={`inline-block rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${priorityBadges[rep.priority]}`}>
                      {rep.priority} PRIORITY
                    </span>
                    <span className={`inline-block rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${statusBadges[rep.status]}`}>
                      {rep.status}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-800">{rep.title}</h3>
                    <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-slate-400" />
                      dilaporkan pada {new Date(rep.reportDate).toLocaleDateString('id-ID', { dateStyle: 'long' })}
                    </p>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 rounded-xl p-3 border border-slate-100 min-h-16">
                    {rep.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                    <div className="flex items-center gap-1.5 font-semibold text-slate-600 bg-slate-100 rounded-lg px-2.5 py-1">
                      <Car className="h-3.5 w-3.5 text-slate-400" />
                      <span>{veh?.brand} {veh?.model} ({veh?.plateNumber})</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <UserIcon className="h-3.5 w-3.5 text-slate-400" />
                      <span>Oleh: {rep.reporterName}</span>
                    </div>
                    {rep.mechanicName && (
                      <div className="flex items-center gap-1 text-primary-600">
                        <Briefcase className="h-3.5 w-3.5" />
                        <span>Mekanik: {rep.mechanicName}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Role Specific Actions Flow */}
                <div className="border-t border-slate-100 pt-4 flex flex-wrap gap-2 justify-end">
                  {rep.status === 'REPORTED' && isManager && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(rep.id, 'APPROVED')}
                        className="flex items-center gap-1.5 rounded-lg bg-green-500 px-3.5 py-1.5 text-xs font-bold text-white shadow-md shadow-green-500/20 hover:bg-green-600"
                      >
                        <CheckCircle className="h-3.5 w-3.5" /> Setujui
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(rep.id, 'REJECTED')}
                        className="flex items-center gap-1.5 rounded-lg bg-red-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-md shadow-red-600/20 hover:bg-red-700"
                      >
                        <XCircle className="h-3.5 w-3.5" /> Tolak
                      </button>
                    </>
                  )}

                  {rep.status === 'APPROVED' && isMechanic && (
                    <button
                      onClick={() => handleUpdateStatus(rep.id, 'IN_PROGRESS')}
                      className="flex items-center gap-1.5 rounded-lg bg-primary-500 px-4 py-2 text-xs font-bold text-white shadow-md shadow-primary-500/20 hover:bg-primary-600"
                    >
                      <Play className="h-3.5 w-3.5 animate-pulse" /> Kerjakan Perbaikan
                    </button>
                  )}

                  {rep.status === 'IN_PROGRESS' && isMechanic && (
                    <button
                      onClick={() => handleUpdateStatus(rep.id, 'COMPLETED')}
                      className="flex items-center gap-1.5 rounded-lg bg-green-500 px-4 py-2 text-xs font-bold text-white shadow-md shadow-green-500/20 hover:bg-green-600"
                    >
                      <CheckCircle className="h-3.5 w-3.5" /> Tandai Selesai
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Creation Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          <div className="relative w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl space-y-6 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Laporkan Kerusakan Fisik</h3>
                <p className="text-xs text-slate-500 mt-1">Daftarkan laporan kerusakan armada agar dapat diperiksa manager dan mekanik.</p>
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
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Pilih Kendaraan bermasalah</label>
                  <select
                    name="vehicleId"
                    value={form.vehicleId}
                    onChange={handleChange}
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 outline-none focus:border-primary-500"
                  >
                    {vehicles.map((v) => (
                      <option key={v.id} value={v.id}>{v.brand} {v.model} ({v.plateNumber})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Tingkat Prioritas</label>
                  <select
                    name="priority"
                    value={form.priority}
                    onChange={handleChange}
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 outline-none focus:border-primary-500 font-bold text-slate-700"
                  >
                    <option value="LOW">Low (Bisa jalan biasa)</option>
                    <option value="MEDIUM">Medium (Segera diperiksa)</option>
                    <option value="HIGH">High (Sangat mengganggu)</option>
                    <option value="URGENT">Urgent (Bahaya / Mogok)</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Masalah / Gejala Utama</label>
                  <input
                    type="text"
                    required
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="Contoh: Rem belakang seret, bunyi mencicit..."
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 outline-none focus:border-primary-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Deskripsi Detail Kerusakan</label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Sebutkan detail kronologis atau bagian fisik yang rusak..."
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
                  {modalLoading ? 'Mengirim...' : 'Kirim Laporan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DamageReports;
