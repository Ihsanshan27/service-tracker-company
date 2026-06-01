import React, { useState, useEffect } from 'react';
import api from '../api/api';
import type { MaintenanceHistory as HistoryType, Vehicle, MaintenanceSchedule as ScheduleType, MaintenanceType } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  Wrench,
  Search,
  Filter,
  Plus,
  Trash2,
  Calendar,
  Gauge,
  AlertTriangle,
  X,
  CreditCard,
  DollarSign
} from 'lucide-react';

const MaintenanceHistory: React.FC = () => {
  const { hasRole } = useAuth();
  const [histories, setHistories] = useState<HistoryType[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [schedules, setSchedules] = useState<ScheduleType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search and Filters
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const [form, setForm] = useState({
    vehicleId: '',
    scheduleId: '',
    maintenanceType: 'SERVICE' as MaintenanceType,
    title: '',
    description: '',
    serviceDate: new Date().toISOString().split('T')[0],
    odometerAtService: 0,
    workshopName: '',
    cost: 0,
    notes: '',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [histRes, vehRes, schRes] = await Promise.all([
        api.get('/maintenance-histories'),
        api.get('/vehicles'),
        api.get('/maintenance-schedules')
      ]);

      const histData = histRes.data?.data || histRes.data || [];
      const vehData = vehRes.data?.data || vehRes.data || [];
      const schData = schRes.data?.data || schRes.data || [];

      setHistories(histData);
      setVehicles(vehData);
      
      // Filter out completed schedules so the user can only select pending ones
      const pendingSchedules = schData.filter((s: ScheduleType) => s.status !== 'COMPLETED');
      setSchedules(pendingSchedules);

      if (vehData.length > 0) {
        setForm((prev) => ({
          ...prev,
          vehicleId: vehData[0].id,
          odometerAtService: vehData[0].currentOdometer
        }));
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal memuat data riwayat servis.');
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
      [name]: name === 'odometerAtService' || name === 'cost' ? Number(value) : value
    }));
  };

  const handleVehicleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedVehId = e.target.value;
    const selectedVeh = vehicles.find(v => v.id === selectedVehId);
    setForm((prev) => ({
      ...prev,
      vehicleId: selectedVehId,
      scheduleId: '', // Reset associated schedule
      odometerAtService: selectedVeh ? selectedVeh.currentOdometer : 0
    }));
  };

  // Prepopulate form if a schedule is selected
  const handleScheduleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedSchId = e.target.value;
    const selectedSch = schedules.find(s => s.id === selectedSchId);
    
    if (selectedSch) {
      setForm((prev) => ({
        ...prev,
        scheduleId: selectedSchId,
        title: selectedSch.title,
        maintenanceType: selectedSch.maintenanceType,
        description: selectedSch.description || '',
        odometerAtService: selectedSch.nextServiceOdometer || prev.odometerAtService,
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        scheduleId: '',
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);
    setModalLoading(true);

    try {
      const payload = {
        ...form,
        scheduleId: form.scheduleId || undefined,
        description: form.description || undefined,
        notes: form.notes || undefined,
        serviceDate: new Date(form.serviceDate).toISOString(),
      };

      await api.post('/maintenance-histories', payload);
      setModalOpen(false);
      
      // Reset form
      setForm({
        vehicleId: vehicles[0]?.id || '',
        scheduleId: '',
        maintenanceType: 'SERVICE',
        title: '',
        description: '',
        serviceDate: new Date().toISOString().split('T')[0],
        odometerAtService: vehicles[0]?.currentOdometer || 0,
        workshopName: '',
        cost: 0,
        notes: '',
      });

      fetchData();
    } catch (err: any) {
      setModalError(err.response?.data?.message || 'Gagal menyimpan log servis.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus data riwayat servis ini?')) return;
    try {
      await api.delete(`/maintenance-histories/${id}`);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menghapus riwayat.');
    }
  };

  // Filter Logic
  const filteredHistories = histories.filter((hist) => {
    const matchesSearch = 
      hist.title.toLowerCase().includes(search.toLowerCase()) ||
      hist.workshopName.toLowerCase().includes(search.toLowerCase()) ||
      hist.vehicle?.plateNumber?.toLowerCase().includes(search.toLowerCase()) ||
      hist.vehicle?.brand?.toLowerCase().includes(search.toLowerCase()) ||
      hist.vehicle?.model?.toLowerCase().includes(search.toLowerCase());

    const matchesType = typeFilter === '' || hist.maintenanceType === typeFilter;

    return matchesSearch && matchesType;
  });

  // Calculate Metrics
  const totalCost = filteredHistories.reduce((acc, h) => acc + h.cost, 0);
  const avgCost = filteredHistories.length > 0 ? totalCost / filteredHistories.length : 0;

  const typeLabels: Record<string, string> = {
    OIL_CHANGE: 'Ganti Oli',
    SERVICE: 'Servis Berkala',
    TIRE_CHANGE: 'Ganti Ban',
    BRAKE_CHECK: 'Cek Rem',
    BATTERY_CHECK: 'Cek Aki',
    GENERAL_CHECK: 'General Checkup',
    OTHER: 'Lainnya',
  };

  const canManage = hasRole(['SUPER_ADMIN', 'FLEET_MANAGER', 'MECHANIC']);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">Riwayat Pemeliharaan</h1>
          <p className="mt-1 text-sm text-slate-500">Rekapitulasi lengkap pekerjaan perbaikan dan perawatan berkala seluruh armada.</p>
        </div>
        {canManage && (
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-primary-500 px-4 py-2.5 font-semibold text-white shadow-lg shadow-primary-500/25 transition-all hover:bg-primary-600 hover:shadow-primary-500/35"
          >
            <Plus className="h-5 w-5" />
            <span>Catat Pekerjaan Baru</span>
          </button>
        )}
      </div>

      {/* Analytics Summary */}
      <div className="grid gap-6 sm:grid-cols-3">
        <div className="glass rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="rounded-xl bg-primary-500/10 p-3 text-primary-600">
            <DollarSign className="h-6 w-6" />
          </div>
          <div>
            <span className="block text-xs font-bold uppercase tracking-wider text-slate-400">Total Investasi Servis</span>
            <span className="text-lg font-extrabold text-slate-800">Rp {totalCost.toLocaleString('id-ID')}</span>
          </div>
        </div>
        <div className="glass rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="rounded-xl bg-emerald-500/10 p-3 text-emerald-600">
            <CreditCard className="h-6 w-6" />
          </div>
          <div>
            <span className="block text-xs font-bold uppercase tracking-wider text-slate-400">Rata-Rata Biaya Servis</span>
            <span className="text-lg font-extrabold text-slate-800">Rp {Math.round(avgCost).toLocaleString('id-ID')}</span>
          </div>
        </div>
        <div className="glass rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="rounded-xl bg-blue-500/10 p-3 text-blue-600">
            <Wrench className="h-6 w-6" />
          </div>
          <div>
            <span className="block text-xs font-bold uppercase tracking-wider text-slate-400">Total Pekerjaan Log</span>
            <span className="text-lg font-extrabold text-slate-800">{filteredHistories.length} Pekerjaan</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Panel */}
      <div className="glass rounded-2xl p-5 shadow-sm flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Cari berdasarkan kegiatan, bengkel, merk atau nomor polisi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-11 pr-4 py-2.5 text-sm text-slate-800 outline-none focus:border-primary-500 focus:bg-white"
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-500">
            <Filter className="h-4 w-4" />
            <span>Kategori</span>
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 outline-none focus:border-primary-500"
          >
            <option value="">Semua Kategori</option>
            <option value="OIL_CHANGE">Ganti Oli</option>
            <option value="SERVICE">Servis Berkala</option>
            <option value="TIRE_CHANGE">Ganti Ban</option>
            <option value="BRAKE_CHECK">Cek Rem</option>
            <option value="BATTERY_CHECK">Cek Aki</option>
            <option value="GENERAL_CHECK">General Checkup</option>
            <option value="OTHER">Lainnya</option>
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
      ) : filteredHistories.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center max-w-lg mx-auto space-y-4">
          <Wrench className="h-12 w-12 text-slate-300 mx-auto" />
          <h2 className="text-lg font-bold text-slate-800">Riwayat Kosong</h2>
          <p className="text-sm text-slate-500">Tidak ada log riwayat servis/pemeliharaan yang ditemukan.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full border-collapse text-left text-sm text-slate-500">
            <thead className="bg-slate-50/75 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Kegiatan & Bengkel</th>
                <th className="px-6 py-4">Armada</th>
                <th className="px-6 py-4">Kategori</th>
                <th className="px-6 py-4">Odometer Servis</th>
                <th className="px-6 py-4">Total Biaya</th>
                <th className="px-6 py-4">Tanggal Pekerjaan</th>
                {canManage && <th className="px-6 py-4 text-center">Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredHistories.map((hist) => (
                <tr key={hist.id} className="hover:bg-slate-50/50 transition-all text-slate-700">
                  <td className="px-6 py-4">
                    <div>
                      <span className="block font-bold text-slate-800">{hist.title}</span>
                      <span className="block text-xs text-slate-400 font-semibold mt-0.5">{hist.workshopName}</span>
                      {hist.notes && <span className="block text-[11px] text-slate-400 mt-1 italic">"{hist.notes}"</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {hist.vehicle && (
                      <div className="space-y-1">
                        <span className="block font-bold text-slate-800">{hist.vehicle.brand} {hist.vehicle.model}</span>
                        <span className="inline-block rounded bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600">{hist.vehicle.plateNumber}</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                      {typeLabels[hist.maintenanceType] || hist.maintenanceType}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs font-bold">
                    <span className="flex items-center gap-1"><Gauge className="h-4 w-4 text-slate-400" /> {hist.odometerAtService.toLocaleString('id-ID')} KM</span>
                  </td>
                  <td className="px-6 py-4 font-extrabold text-primary-600">
                    Rp {hist.cost.toLocaleString('id-ID')}
                  </td>
                  <td className="px-6 py-4 text-xs font-bold text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-slate-400" />
                      {new Date(hist.serviceDate).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
                    </span>
                  </td>
                  {canManage && (
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleDelete(hist.id)}
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

      {/* Logging Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          <div className="relative w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl space-y-6 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Catat Pekerjaan Pemeliharaan</h3>
                <p className="text-xs text-slate-500 mt-1">Simpan rincian pemeliharaan riil lengkap beserta bukti biaya dan odometer.</p>
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
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Hubungkan Dengan Jadwal (Opsional)</label>
                  <select
                    name="scheduleId"
                    value={form.scheduleId}
                    onChange={handleScheduleChange}
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none focus:border-primary-500"
                  >
                    <option value="">-- Pekerjaan Non-Jadwal / Adhoc --</option>
                    {schedules
                      .filter((s) => s.vehicleId === form.vehicleId)
                      .map((s) => (
                        <option key={s.id} value={s.id}>{s.title} ({s.status})</option>
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
                    placeholder="Contoh: Ganti Oli Mesin Shell Helix"
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 outline-none focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Kategori</label>
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
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Bengkel / Workshop Pelaksana</label>
                  <input
                    type="text"
                    required
                    name="workshopName"
                    value={form.workshopName}
                    onChange={handleChange}
                    placeholder="Contoh: Auto2000 Kalimalang"
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 outline-none focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Odometer Saat Servis (KM)</label>
                  <input
                    type="number"
                    required
                    name="odometerAtService"
                    value={form.odometerAtService}
                    onChange={handleChange}
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 outline-none focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Total Biaya (Rupiah)</label>
                  <input
                    type="number"
                    required
                    name="cost"
                    value={form.cost}
                    onChange={handleChange}
                    placeholder="Contoh: 750000"
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 outline-none focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Tanggal Pengerjaan</label>
                  <input
                    type="date"
                    required
                    name="serviceDate"
                    value={form.serviceDate}
                    onChange={handleChange}
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 outline-none focus:border-primary-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Deskripsi Detail Pekerjaan</label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Sebutkan item-item yang diganti atau diperbaiki..."
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 outline-none focus:border-primary-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Catatan Lainnya / Keterangan Tambahan</label>
                  <textarea
                    name="notes"
                    value={form.notes}
                    onChange={handleChange}
                    rows={2}
                    placeholder="Misal: Ada garansi 1 bulan, bunyi gluduk-gluduk hilang..."
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
                  {modalLoading ? 'Menyimpan...' : 'Simpan Log'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaintenanceHistory;
