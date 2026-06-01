import React, { useState, useEffect } from 'react';
import api from '../api/api';
import type { MaintenanceSchedule as ScheduleType, Vehicle, MaintenanceType } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  Calendar,
  Gauge,
  Plus,
  Search,
  Filter,
  Trash2,
  AlertTriangle,
  Car,
  X
} from 'lucide-react';

const MaintenanceSchedule: React.FC = () => {
  const { hasRole } = useAuth();
  const [schedules, setSchedules] = useState<ScheduleType[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter States
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const [form, setForm] = useState({
    vehicleId: '',
    title: '',
    description: '',
    maintenanceType: 'SERVICE' as MaintenanceType,
    intervalKm: 5000,
    intervalMonth: 6,
    lastServiceDate: '',
    lastServiceOdometer: 0,
    nextServiceDate: '',
    nextServiceOdometer: 0,
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [schRes, vehRes] = await Promise.all([
        api.get('/maintenance-schedules'),
        api.get('/vehicles')
      ]);

      const schData = schRes.data?.data || schRes.data || [];
      const vehData = vehRes.data?.data || vehRes.data || [];

      setSchedules(schData);
      setVehicles(vehData);

      if (vehData.length > 0) {
        setForm((prev) => ({ ...prev, vehicleId: vehData[0].id }));
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal mengambil data jadwal pemeliharaan.');
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
      [name]: name === 'intervalKm' || name === 'intervalMonth' || name === 'lastServiceOdometer' || name === 'nextServiceOdometer'
        ? value === '' ? '' : Number(value)
        : value
    }));
  };

  const handleVehicleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedVehId = e.target.value;
    const selectedVeh = vehicles.find(v => v.id === selectedVehId);
    setForm((prev) => ({
      ...prev,
      vehicleId: selectedVehId,
      lastServiceOdometer: selectedVeh ? selectedVeh.currentOdometer : 0
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);
    setModalLoading(true);

    try {
      const payload = {
        vehicleId: form.vehicleId,
        title: form.title,
        description: form.description || undefined,
        maintenanceType: form.maintenanceType,
        intervalKm: form.intervalKm || undefined,
        intervalMonth: form.intervalMonth || undefined,
        lastServiceDate: form.lastServiceDate ? new Date(form.lastServiceDate).toISOString() : undefined,
        lastServiceOdometer: form.lastServiceOdometer || undefined,
      };

      await api.post('/maintenance-schedules', payload);
      setModalOpen(false);
      
      // Reset Form (keep vehicleId if possible)
      setForm({
        vehicleId: vehicles[0]?.id || '',
        title: '',
        description: '',
        maintenanceType: 'SERVICE',
        intervalKm: 5000,
        intervalMonth: 6,
        lastServiceDate: '',
        lastServiceOdometer: vehicles[0]?.currentOdometer || 0,
        nextServiceDate: '',
        nextServiceOdometer: 0,
      });

      fetchData();
    } catch (err: any) {
      setModalError(err.response?.data?.message || 'Gagal menjadwalkan servis baru.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus jadwal pemeliharaan ini?')) return;
    try {
      await api.delete(`/maintenance-schedules/${id}`);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menghapus jadwal.');
    }
  };

  // Filter Logic
  const filteredSchedules = schedules.filter((sch) => {
    const matchesSearch = 
      sch.title.toLowerCase().includes(search.toLowerCase()) ||
      sch.vehicle?.plateNumber?.toLowerCase().includes(search.toLowerCase()) ||
      sch.vehicle?.brand?.toLowerCase().includes(search.toLowerCase()) ||
      sch.vehicle?.model?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === '' || sch.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const statusBadges: Record<string, string> = {
    UPCOMING: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    DUE_SOON: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    OVERDUE: 'bg-red-500/10 text-red-600 border-red-500/20',
    COMPLETED: 'bg-green-500/10 text-green-600 border-green-500/20',
  };

  const typeLabels: Record<string, string> = {
    OIL_CHANGE: 'Ganti Oli',
    SERVICE: 'Servis Berkala',
    TIRE_CHANGE: 'Ganti Ban',
    BRAKE_CHECK: 'Cek Rem',
    BATTERY_CHECK: 'Cek Aki',
    GENERAL_CHECK: 'General Checkup',
    OTHER: 'Lainnya',
  };

  const canManage = hasRole(['SUPER_ADMIN', 'FLEET_MANAGER']);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">Jadwal Pemeliharaan</h1>
          <p className="mt-1 text-sm text-slate-500">Pantau dan kelola jadwal servis rutin armada untuk mencegah kerusakan fatal.</p>
        </div>
        {canManage && (
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-primary-500 px-4 py-2.5 font-semibold text-white shadow-lg shadow-primary-500/25 transition-all hover:bg-primary-600 hover:shadow-primary-500/35"
          >
            <Plus className="h-5 w-5" />
            <span>Jadwalkan Baru</span>
          </button>
        )}
      </div>

      {/* Filter and Search Panel */}
      <div className="glass rounded-2xl p-5 shadow-sm flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Cari jadwal, merk, tipe atau nomor polisi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-11 pr-4 py-2.5 text-sm text-slate-800 outline-none focus:border-primary-500 focus:bg-white"
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-500">
            <Filter className="h-4 w-4" />
            <span>Status</span>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 outline-none focus:border-primary-500"
          >
            <option value="">Semua Status</option>
            <option value="UPCOMING">Upcoming</option>
            <option value="DUE_SOON">Due Soon</option>
            <option value="OVERDUE">Overdue</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>
      </div>

      {/* Table Content */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
        </div>
      ) : error ? (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          <AlertTriangle className="h-5 w-5 shrink-0 text-red-500" />
          <span>{error}</span>
        </div>
      ) : filteredSchedules.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center max-w-lg mx-auto space-y-4">
          <Calendar className="h-12 w-12 text-slate-300 mx-auto" />
          <h2 className="text-lg font-bold text-slate-800">Jadwal Tidak Ditemukan</h2>
          <p className="text-sm text-slate-500">Tidak ada jadwal pemeliharaan yang cocok dengan pencarian Anda saat ini.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full border-collapse text-left text-sm text-slate-500">
            <thead className="bg-slate-50/75 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Detail Jadwal & Armada</th>
                <th className="px-6 py-4">Tipe Pemeliharaan</th>
                <th className="px-6 py-4">Interval Target</th>
                <th className="px-6 py-4">Jadwal Berikutnya</th>
                <th className="px-6 py-4">Status</th>
                {canManage && <th className="px-6 py-4 text-center">Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredSchedules.map((sch) => (
                <tr key={sch.id} className="hover:bg-slate-50/50 transition-all">
                  <td className="px-6 py-4">
                    <div>
                      <span className="block font-bold text-slate-800">{sch.title}</span>
                      <span className="block text-[11px] text-slate-400 mt-0.5">{sch.description || 'Tidak ada deskripsi'}</span>
                      {sch.vehicle && (
                        <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-600 bg-slate-100 rounded-lg py-1 px-2.5 w-fit font-bold">
                          <Car className="h-3.5 w-3.5 shrink-0" />
                          <span>{sch.vehicle.brand} {sch.vehicle.model} ({sch.vehicle.plateNumber})</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                      {typeLabels[sch.maintenanceType] || sch.maintenanceType}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1 text-xs">
                      {sch.intervalKm && (
                        <span className="block text-slate-600 font-bold">Tiap {sch.intervalKm.toLocaleString('id-ID')} KM</span>
                      )}
                      {sch.intervalMonth && (
                        <span className="block text-slate-400 font-semibold">Tiap {sch.intervalMonth} Bulan</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1 text-xs">
                      {sch.nextServiceDate && (
                        <span className="block text-slate-600 font-bold flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                          {new Date(sch.nextServiceDate).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
                        </span>
                      )}
                      {sch.nextServiceOdometer && (
                        <span className="block text-slate-400 font-semibold flex items-center gap-1">
                          <Gauge className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                          {sch.nextServiceOdometer.toLocaleString('id-ID')} KM
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-block rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${statusBadges[sch.status] || 'bg-slate-100 text-slate-600'}`}>
                      {sch.status}
                    </span>
                  </td>
                  {canManage && (
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleDelete(sch.id)}
                        className="rounded-xl border border-red-100 p-2 text-red-500 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Creation Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          <div className="relative w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl space-y-6 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Buat Jadwal Pemeliharaan</h3>
                <p className="text-xs text-slate-500 mt-1">Daftarkan rutinitas perawatan preventif baru untuk armada.</p>
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
                    onChange={handleVehicleChange}
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 outline-none focus:border-primary-500"
                  >
                    {vehicles.map((v) => (
                      <option key={v.id} value={v.id}>{v.brand} {v.model} ({v.plateNumber})</option>
                    ))}
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
                    placeholder="Contoh: Servis Bulanan Ke-4"
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 outline-none focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Jenis Pemeliharaan</label>
                  <select
                    name="maintenanceType"
                    value={form.maintenanceType}
                    onChange={handleChange}
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 outline-none focus:border-primary-500"
                  >
                    <option value="OIL_CHANGE">Ganti Oli</option>
                    <option value="SERVICE">Servis Berkala</option>
                    <option value="TIRE_CHANGE">Ganti Ban</option>
                    <option value="BRAKE_CHECK">Cek Rem</option>
                    <option value="BATTERY_CHECK">Cek Aki</option>
                    <option value="GENERAL_CHECK">General Checkup</option>
                    <option value="OTHER">Lainnya</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Interval Kilometer (KM)</label>
                  <input
                    type="number"
                    name="intervalKm"
                    value={form.intervalKm}
                    onChange={handleChange}
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 outline-none focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Interval Waktu (Bulan)</label>
                  <input
                    type="number"
                    name="intervalMonth"
                    value={form.intervalMonth}
                    onChange={handleChange}
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 outline-none focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Odometer Terakhir Servis (KM)</label>
                  <input
                    type="number"
                    name="lastServiceOdometer"
                    value={form.lastServiceOdometer}
                    onChange={handleChange}
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 outline-none focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Tanggal Terakhir Servis</label>
                  <input
                    type="date"
                    name="lastServiceDate"
                    value={form.lastServiceDate}
                    onChange={handleChange}
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 outline-none focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Target Odometer Berikutnya (KM)</label>
                  <input
                    type="number"
                    name="nextServiceOdometer"
                    value={form.nextServiceOdometer}
                    onChange={handleChange}
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 outline-none focus:border-primary-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Tanggal Target Berikutnya</label>
                  <input
                    type="date"
                    required
                    name="nextServiceDate"
                    value={form.nextServiceDate}
                    onChange={handleChange}
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 outline-none focus:border-primary-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Keterangan / Detail Deskripsi</label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Rincian suku cadang atau jenis pemeriksaan khusus..."
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
                  {modalLoading ? 'Menyimpan...' : 'Jadwalkan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaintenanceSchedule;
