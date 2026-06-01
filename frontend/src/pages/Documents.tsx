import React, { useState, useEffect } from 'react';
import api from '../api/api';
import type { VehicleDocument, Vehicle, DocumentType } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  FileText,
  Search,
  Plus,
  Trash2,
  Calendar,
  AlertTriangle,
  X,
  CreditCard,
  Building,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const Documents: React.FC = () => {
  const { hasRole } = useAuth();
  const [documents, setDocuments] = useState<VehicleDocument[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search and Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const [form, setForm] = useState({
    vehicleId: '',
    documentType: 'STNK' as DocumentType,
    documentNumber: '',
    issueDate: '',
    expiryDate: '',
    provider: '',
    cost: 0,
    notes: '',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [docRes, vehRes] = await Promise.all([
        api.get('/vehicle-documents'),
        api.get('/vehicles')
      ]);

      const docData = docRes.data?.data || docRes.data || [];
      const vehData = vehRes.data?.data || vehRes.data || [];

      setDocuments(docData);
      setVehicles(vehData);

      if (vehData.length > 0) {
        setForm((prev) => ({ ...prev, vehicleId: vehData[0].id }));
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal mengambil dokumen kendaraan.');
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
      [name]: name === 'cost' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);
    setModalLoading(true);

    try {
      const payload = {
        ...form,
        provider: form.provider || undefined,
        cost: form.cost || undefined,
        notes: form.notes || undefined,
        issueDate: new Date(form.issueDate).toISOString(),
        expiryDate: new Date(form.expiryDate).toISOString(),
      };

      await api.post('/vehicle-documents', payload);
      setModalOpen(false);

      // Reset Form
      setForm({
        vehicleId: vehicles[0]?.id || '',
        documentType: 'STNK',
        documentNumber: '',
        issueDate: '',
        expiryDate: '',
        provider: '',
        cost: 0,
        notes: '',
      });

      fetchData();
    } catch (err: any) {
      setModalError(err.response?.data?.message || 'Gagal menyimpan dokumen baru.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus dokumen ini secara permanen?')) return;
    try {
      await api.delete(`/vehicle-documents/${id}`);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menghapus dokumen.');
    }
  };

  // Helper to determine status dynamically based on expiryDate
  const getDocumentStatus = (expiryDateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiryDate = new Date(expiryDateStr);
    expiryDate.setHours(0, 0, 0, 0);

    const diffTime = expiryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { status: 'EXPIRED', style: 'bg-red-500/10 text-red-600 border-red-500/20', daysText: 'Kadaluarsa' };
    } else if (diffDays <= 30) {
      return { status: 'EXPIRES_SOON', style: 'bg-amber-500/10 text-amber-600 border-amber-500/20', daysText: `${diffDays} hari lagi` };
    }
    return { status: 'ACTIVE', style: 'bg-green-500/10 text-green-600 border-green-500/20', daysText: `${diffDays} hari lagi` };
  };

  // Filter Logic
  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch = 
      doc.documentNumber.toLowerCase().includes(search.toLowerCase()) ||
      doc.provider?.toLowerCase().includes(search.toLowerCase()) ||
      doc.vehicle?.plateNumber?.toLowerCase().includes(search.toLowerCase()) ||
      doc.vehicle?.brand?.toLowerCase().includes(search.toLowerCase()) ||
      doc.vehicle?.model?.toLowerCase().includes(search.toLowerCase());

    const { status } = getDocumentStatus(doc.expiryDate);
    const matchesStatus = statusFilter === '' || status === statusFilter;
    const matchesType = typeFilter === '' || doc.documentType === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  // Analytics Metric Counts
  const expiredCount = documents.filter(d => getDocumentStatus(d.expiryDate).status === 'EXPIRED').length;
  const expiresSoonCount = documents.filter(d => getDocumentStatus(d.expiryDate).status === 'EXPIRES_SOON').length;
  const activeCount = documents.filter(d => getDocumentStatus(d.expiryDate).status === 'ACTIVE').length;

  const canManage = hasRole(['SUPER_ADMIN', 'FLEET_MANAGER']);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">Dokumen Pajak & KIR</h1>
          <p className="mt-1 text-sm text-slate-500">Kawal masa berlaku administrasi legalitas armada seperti STNK, Pajak Tahunan, KIR, dan Asuransi.</p>
        </div>
        {canManage && (
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-primary-500 px-4 py-2.5 font-semibold text-white shadow-lg shadow-primary-500/25 transition-all hover:bg-primary-600 hover:shadow-primary-500/35"
          >
            <Plus className="h-5 w-5" />
            <span>Unggah Dokumen Baru</span>
          </button>
        )}
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-6 sm:grid-cols-3">
        <div className="glass rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="rounded-xl bg-red-500/10 p-3 text-red-600">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div>
            <span className="block text-xs font-bold uppercase tracking-wider text-slate-400">Telah Kadaluarsa</span>
            <span className="text-lg font-extrabold text-red-600">{expiredCount} Dokumen</span>
          </div>
        </div>
        <div className="glass rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="rounded-xl bg-amber-500/10 p-3 text-amber-600">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <span className="block text-xs font-bold uppercase tracking-wider text-slate-400">Segera Kadaluarsa (&lt;30 Hari)</span>
            <span className="text-lg font-extrabold text-amber-600">{expiresSoonCount} Dokumen</span>
          </div>
        </div>
        <div className="glass rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="rounded-xl bg-green-500/10 p-3 text-green-600">
            <CheckCircle className="h-6 w-6" />
          </div>
          <div>
            <span className="block text-xs font-bold uppercase tracking-wider text-slate-400">Aktif & Aman</span>
            <span className="text-lg font-extrabold text-green-600">{activeCount} Dokumen</span>
          </div>
        </div>
      </div>

      {/* Filters and Search Panel */}
      <div className="glass rounded-2xl p-5 shadow-sm flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Cari berdasarkan nomor dokumen, provider, merk atau nomor polisi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-11 pr-4 py-2.5 text-sm text-slate-800 outline-none focus:border-primary-500 focus:bg-white"
          />
        </div>
        <div className="flex gap-3">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 outline-none focus:border-primary-500"
          >
            <option value="">Semua Tipe</option>
            <option value="STNK">STNK</option>
            <option value="TAX">Pajak Tahunan</option>
            <option value="INSURANCE">Asuransi</option>
            <option value="KIR">Uji KIR</option>
            <option value="OTHER">Lainnya</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 outline-none focus:border-primary-500"
          >
            <option value="">Semua Status</option>
            <option value="ACTIVE">Aktif</option>
            <option value="EXPIRES_SOON">Hampir Expired</option>
            <option value="EXPIRED">Expired</option>
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
      ) : filteredDocuments.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center max-w-lg mx-auto space-y-4">
          <FileText className="h-12 w-12 text-slate-300 mx-auto" />
          <h2 className="text-lg font-bold text-slate-800">Dokumen Kosong</h2>
          <p className="text-sm text-slate-500">Tidak ada dokumen kendaraan operasional yang memenuhi kriteria filter.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full border-collapse text-left text-sm text-slate-500">
            <thead className="bg-slate-50/75 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Informasi Dokumen</th>
                <th className="px-6 py-4">Penerbit & Biaya</th>
                <th className="px-6 py-4">Kendaraan</th>
                <th className="px-6 py-4">Masa Berlaku</th>
                <th className="px-6 py-4">Status</th>
                {canManage && <th className="px-6 py-4 text-center">Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredDocuments.map((doc) => {
                const { status, style, daysText } = getDocumentStatus(doc.expiryDate);
                return (
                  <tr key={doc.id} className="hover:bg-slate-50/50 transition-all text-slate-700">
                    <td className="px-6 py-4">
                      <div>
                        <span className="block font-bold text-slate-800">{doc.documentType}</span>
                        <span className="block text-xs text-slate-400 font-bold mt-0.5">{doc.documentNumber}</span>
                        {doc.notes && <span className="block text-[11px] text-slate-400 mt-1 italic">"{doc.notes}"</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1 text-xs">
                        <span className="block font-bold text-slate-700 flex items-center gap-1">
                          <Building className="h-3.5 w-3.5 text-slate-400" /> {doc.provider || '-'}
                        </span>
                        {doc.cost && (
                          <span className="block font-extrabold text-primary-600 flex items-center gap-1">
                            <CreditCard className="h-3.5 w-3.5 text-slate-400" /> Rp {doc.cost.toLocaleString('id-ID')}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {doc.vehicle && (
                        <div className="space-y-1">
                          <span className="block font-bold text-slate-800">{doc.vehicle.brand} {doc.vehicle.model}</span>
                          <span className="inline-block rounded bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600">{doc.vehicle.plateNumber}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-slate-500">
                      <div className="space-y-1">
                        <span className="block text-slate-700 flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-slate-400" />
                          s/d {new Date(doc.expiryDate).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
                        </span>
                        <span className="block text-[10px] text-slate-400">Rilis: {new Date(doc.issueDate).toLocaleDateString('id-ID')}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${style}`}>
                        {status} ({daysText})
                      </span>
                    </td>
                    {canManage && (
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleDelete(doc.id)}
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
          <div className="relative w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl space-y-6 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Unggah & Daftarkan Dokumen</h3>
                <p className="text-xs text-slate-500 mt-1">Daftarkan masa berlaku administratif baru untuk kendaraan operasional.</p>
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
                    onChange={handleChange}
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 outline-none focus:border-primary-500"
                  >
                    {vehicles.map((v) => (
                      <option key={v.id} value={v.id}>{v.brand} {v.model} ({v.plateNumber})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Jenis Dokumen</label>
                  <select
                    name="documentType"
                    value={form.documentType}
                    onChange={handleChange}
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 outline-none focus:border-primary-500"
                  >
                    <option value="STNK">STNK</option>
                    <option value="TAX">Pajak Tahunan</option>
                    <option value="INSURANCE">Asuransi</option>
                    <option value="KIR">Uji KIR</option>
                    <option value="OTHER">Lainnya</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Nomor Dokumen / Plat</label>
                  <input
                    type="text"
                    required
                    name="documentNumber"
                    value={form.documentNumber}
                    onChange={handleChange}
                    placeholder="Contoh: No. STNK atau No. KIR"
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 outline-none focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Lembaga Penerbit / Provider</label>
                  <input
                    type="text"
                    name="provider"
                    value={form.provider}
                    onChange={handleChange}
                    placeholder="Contoh: SAMSAT, Jasaraharja, DLLAJ..."
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 outline-none focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Biaya Administrasi (Rupiah)</label>
                  <input
                    type="number"
                    name="cost"
                    value={form.cost}
                    onChange={handleChange}
                    placeholder="Contoh: 350000"
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 outline-none focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Tanggal Rilis (Issue Date)</label>
                  <input
                    type="date"
                    required
                    name="issueDate"
                    value={form.issueDate}
                    onChange={handleChange}
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 outline-none focus:border-primary-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Tanggal Kadaluarsa (Expiry Date)</label>
                  <input
                    type="date"
                    required
                    name="expiryDate"
                    value={form.expiryDate}
                    onChange={handleChange}
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 outline-none focus:border-primary-500 font-semibold text-primary-600 animate-pulse"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Keterangan / Catatan Tambahan</label>
                  <textarea
                    name="notes"
                    value={form.notes}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Detail tambahan seputar kelulusan KIR, denda pajak, dll..."
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
                  {modalLoading ? 'Menyimpan...' : 'Unggah Dokumen'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Documents;
