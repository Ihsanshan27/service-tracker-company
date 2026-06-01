import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/api';
import type { Vehicle, OdometerLog } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  ArrowLeft,
  Calendar,
  Gauge,
  Plus,
  Trash2,
  Edit,
  AlertTriangle,
  AlertCircle,
  MessageSquare,
  Send,
  User as UserIcon
} from 'lucide-react';

const VehicleDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { hasRole } = useAuth();

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'odometer' | 'schedules' | 'histories' | 'documents' | 'comments'>('overview');

  // Comments State
  const [comments, setComments] = useState<any[]>([]);
  const [commentContent, setCommentContent] = useState('');
  const [commentSubmitting, setCommentSubmitting] = useState(false);

  // Modal Odometer State
  const [odoModalOpen, setOdoModalOpen] = useState(false);
  const [newOdometer, setNewOdometer] = useState<number>(0);
  const [odoNotes, setOdoNotes] = useState('');
  const [odoError, setOdoError] = useState<string | null>(null);
  const [odoSubmitting, setOdoSubmitting] = useState(false);

  // Delete Dialog State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchVehicle = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/vehicles/${id}`);
      const data = response.data?.data || response.data;
      setVehicle(data);
      if (data) {
        setNewOdometer(data.currentOdometer || 0);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal mengambil detail kendaraan.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicle();
  }, [id]);

  const fetchComments = async () => {
    try {
      const res = await api.get(`/vehicles/${id}/comments`);
      setComments(res.data.data || []);
    } catch { /* silent */ }
  };

  useEffect(() => {
    if (activeTab === 'comments') fetchComments();
  }, [activeTab, id]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentContent.trim()) return;
    setCommentSubmitting(true);
    try {
      await api.post(`/vehicles/${id}/comments`, { content: commentContent.trim() });
      setCommentContent('');
      fetchComments();
    } catch (err: any) {
      console.error(err);
    } finally {
      setCommentSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await api.delete(`/vehicles/${id}/comments/${commentId}`);
      fetchComments();
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleUpdateOdometer = async (e: React.FormEvent) => {
    e.preventDefault();
    setOdoError(null);

    if (vehicle && newOdometer <= vehicle.currentOdometer) {
      setOdoError(`Odometer baru (${newOdometer} KM) tidak boleh lebih kecil atau sama dengan odometer saat ini (${vehicle.currentOdometer} KM).`);
      return;
    }

    setOdoSubmitting(true);
    try {
      await api.patch(`/vehicles/${id}/odometer`, {
        odometer: newOdometer,
        notes: odoNotes || undefined
      });
      setOdoModalOpen(false);
      setOdoNotes('');
      fetchVehicle();
    } catch (err: any) {
      setOdoError(err.response?.data?.message || 'Gagal memperbarui odometer.');
    } finally {
      setOdoSubmitting(false);
    }
  };

  const handleDeleteVehicle = async () => {
    setDeleteLoading(true);
    try {
      await api.delete(`/vehicles/${id}`);
      navigate('/vehicles');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal menghapus kendaraan.');
      setDeleteDialogOpen(false);
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-600 max-w-2xl mx-auto space-y-4">
        <AlertTriangle className="h-10 w-10 text-red-500 mx-auto" />
        <h2 className="text-lg font-bold">Terjadi Kesalahan</h2>
        <p className="text-sm">{error || 'Kendaraan tidak ditemukan.'}</p>
        <Link to="/vehicles" className="inline-flex items-center gap-2 rounded-xl bg-primary-500 px-4 py-2 font-semibold text-white">
          <ArrowLeft className="h-4 w-4" /> Kembali ke Daftar
        </Link>
      </div>
    );
  }

  const canManage = hasRole(['SUPER_ADMIN', 'FLEET_MANAGER']);

  const statusBadges: Record<string, string> = {
    ACTIVE: 'bg-green-500/10 text-green-600 border-green-500/20',
    INACTIVE: 'bg-slate-500/10 text-slate-600 border-slate-500/20',
    MAINTENANCE: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
    SOLD: 'bg-red-500/10 text-red-600 border-red-500/20',
  };

  return (
    <div className="space-y-8">
      {/* Header Panel */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Link to="/vehicles" className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-500 hover:bg-slate-50">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-slate-800">{vehicle.brand} {vehicle.model}</h1>
              <span className={`rounded-full border px-2.5 py-0.5 text-xs font-bold ${statusBadges[vehicle.status] || 'bg-slate-100 text-slate-600'}`}>
                {vehicle.status}
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-500">Nomor Polisi: <span className="font-bold text-slate-700">{vehicle.plateNumber}</span> · ID Aset: {vehicle.id.slice(0, 8)}</p>
          </div>
        </div>

        {canManage && (
          <div className="flex items-center gap-3">
            <Link
              to={`/vehicles/${vehicle.id}/edit`}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              <Edit className="h-4 w-4" />
              <span>Edit</span>
            </Link>
            <button
              onClick={() => setDeleteDialogOpen(true)}
              className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50/50 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
              <span>Hapus</span>
            </button>
          </div>
        )}
      </div>

      {/* Grid: Quick Specs & Tab Navigation */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Side: Summary Card */}
        <div className="glass rounded-2xl p-6 shadow-sm space-y-6 self-start">
          <div className="h-44 w-full rounded-xl bg-gradient-to-br from-primary-400 to-indigo-500 flex flex-col justify-between p-5 text-white shadow-md relative overflow-hidden">
            <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 opacity-10">
              <Gauge className="h-48 w-48" />
            </div>
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider opacity-75">Odometer Log</span>
                <span className="block text-3xl font-extrabold tracking-tight mt-1">{vehicle.currentOdometer.toLocaleString('id-ID')} <span className="text-sm font-medium">KM</span></span>
              </div>
              <span className="bg-white/20 backdrop-blur-sm rounded-lg px-2.5 py-1 text-xs font-bold uppercase tracking-wider">{vehicle.vehicleType}</span>
            </div>
            <div className="flex justify-between items-end border-t border-white/20 pt-4">
              <div>
                <span className="block text-[10px] uppercase opacity-75">Tahun</span>
                <span className="text-sm font-bold">{vehicle.year}</span>
              </div>
              <div>
                <span className="block text-[10px] uppercase opacity-75">Bahan Bakar</span>
                <span className="text-sm font-bold">{vehicle.fuelType}</span>
              </div>
              <div>
                <span className="block text-[10px] uppercase opacity-75">Transmisi</span>
                <span className="text-sm font-bold">{vehicle.transmission}</span>
              </div>
            </div>
          </div>

          {/* Quick Info Grid */}
          <div className="space-y-4 pt-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400">Nomor Rangka</span>
              <span className="font-semibold text-slate-700">{vehicle.chassisNumber}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400">Nomor Mesin</span>
              <span className="font-semibold text-slate-700">{vehicle.engineNumber}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400">Warna</span>
              <span className="font-semibold text-slate-700">{vehicle.color}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400">Tanggal Beli</span>
              <span className="font-semibold text-slate-700">{new Date(vehicle.purchaseDate).toLocaleDateString('id-ID', { dateStyle: 'long' })}</span>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-5">
            <button
              onClick={() => setOdoModalOpen(true)}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-500 py-3 text-sm font-bold text-white shadow-md shadow-primary-500/20 hover:bg-primary-600 transition-all"
            >
              <Gauge className="h-4 w-4" />
              <span>Update Odometer</span>
            </button>
          </div>
        </div>

        {/* Right Side: Tab Panel & Detailed Records */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tab Navigation */}
          <div className="flex border-b border-slate-200 overflow-x-auto gap-2 no-scrollbar">
            {(['overview', 'odometer', 'schedules', 'histories', 'documents', 'comments'] as const).map((tab) => {
              const labels = {
                overview: 'Detail & Catatan',
                odometer: 'Log Odometer',
                schedules: 'Jadwal Servis',
                histories: 'Riwayat Servis',
                documents: 'Dokumen',
                comments: `Komentar${comments.length > 0 ? ` (${comments.length})` : ''}`
              };
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`border-b-2 px-4 py-3 text-sm font-bold tracking-tight whitespace-nowrap transition-all ${
                    activeTab === tab
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {labels[tab]}
                </button>
              );
            })}
          </div>

          {/* Tab Contents */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-2">Catatan Internal</h3>
                  <div className="rounded-xl bg-slate-50 p-4 border border-slate-100 text-sm text-slate-600 leading-relaxed min-h-24">
                    {vehicle.notes || 'Tidak ada catatan khusus untuk kendaraan ini.'}
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3">Tugas Pengemudi Terakhir</h3>
                    {vehicle.assignments && vehicle.assignments.length > 0 ? (
                      <div className="space-y-3">
                        {vehicle.assignments.map((assign: any) => (
                          <div key={assign.id} className="rounded-xl border border-slate-200 p-4 flex justify-between items-center text-sm">
                            <div>
                              <span className="block font-bold text-slate-700">{assign.driver?.name}</span>
                              <span className="block text-xs text-slate-400">{assign.driver?.email}</span>
                            </div>
                            <div className="text-right">
                              <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
                                assign.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                              }`}>
                                {assign.status}
                              </span>
                              <span className="block text-[10px] text-slate-400 mt-1">{new Date(assign.startDate).toLocaleDateString('id-ID')}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-400">
                        Belum ada penugasan pengemudi.
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3">Spesifikasi Lain</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between border-b border-slate-100 pb-2">
                        <span className="text-slate-400">Waktu Register</span>
                        <span className="font-semibold text-slate-700">{new Date(vehicle.createdAt).toLocaleDateString('id-ID')}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-100 pb-2">
                        <span className="text-slate-400">Terakhir Diupdate</span>
                        <span className="font-semibold text-slate-700">{new Date(vehicle.updatedAt).toLocaleDateString('id-ID')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'odometer' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Riwayat Perjalanan Odometer</h3>
                  <button
                    onClick={() => setOdoModalOpen(true)}
                    className="flex items-center gap-1.5 rounded-lg border border-primary-100 bg-primary-50 px-3 py-1.5 text-xs font-bold text-primary-600 hover:bg-primary-100"
                  >
                    <Plus className="h-3.5 w-3.5" /> Log Baru
                  </button>
                </div>

                {vehicle.odometerLogs && vehicle.odometerLogs.length > 0 ? (
                  <div className="relative border-l border-slate-200 pl-6 ml-3 space-y-6 py-2">
                    {vehicle.odometerLogs.map((log: OdometerLog) => (
                      <div key={log.id} className="relative">
                        {/* Dot indicator */}
                        <div className="absolute -left-[31px] top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary-100">
                          <div className="h-2 w-2 rounded-full bg-primary-500"></div>
                        </div>
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <span className="text-base font-extrabold text-slate-800">{log.odometer.toLocaleString('id-ID')} KM</span>
                            {log.notes && <p className="text-xs text-slate-500 mt-0.5 italic">"{log.notes}"</p>}
                          </div>
                          <div className="text-left sm:text-right">
                            <span className="block text-xs text-slate-400">{new Date(log.date).toLocaleDateString('id-ID', { dateStyle: 'medium' })}</span>
                            {log.user && <span className="block text-[10px] text-slate-400">Dicatat oleh: {log.user.name}</span>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-400">
                    Tidak ada log odometer tercatat. Odometer awal didasarkan pada pembelian.
                  </div>
                )}
              </div>
            )}

            {activeTab === 'schedules' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Jadwal Pemeliharaan Mendatang</h3>
                  <Link
                    to="/schedules"
                    className="flex items-center gap-1.5 rounded-lg border border-primary-100 bg-primary-50 px-3 py-1.5 text-xs font-bold text-primary-600 hover:bg-primary-100"
                  >
                    <Plus className="h-3.5 w-3.5" /> Jadwalkan
                  </Link>
                </div>

                {(vehicle as any).maintenanceSchedules && (vehicle as any).maintenanceSchedules.length > 0 ? (
                  <div className="divide-y divide-slate-100">
                    {(vehicle as any).maintenanceSchedules.map((sch: any) => {
                      const scheduleStatusBadges: Record<string, string> = {
                        UPCOMING: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
                        DUE_SOON: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
                        OVERDUE: 'bg-red-500/10 text-red-600 border-red-500/20',
                        COMPLETED: 'bg-green-500/10 text-green-600 border-green-500/20',
                      };
                      return (
                        <div key={sch.id} className="py-4 first:pt-0 last:pb-0 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <span className="block font-bold text-slate-700">{sch.title}</span>
                            <span className="block text-xs text-slate-400 mt-0.5">{sch.description || 'Tidak ada deskripsi'}</span>
                            <div className="flex items-center gap-4 text-xs text-slate-500 mt-2">
                              {sch.nextServiceDate && (
                                <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5 shrink-0" /> {new Date(sch.nextServiceDate).toLocaleDateString('id-ID')}</span>
                              )}
                              {sch.nextServiceOdometer && (
                                <span className="flex items-center gap-1"><Gauge className="h-3.5 w-3.5 shrink-0" /> {sch.nextServiceOdometer.toLocaleString('id-ID')} KM</span>
                              )}
                            </div>
                          </div>
                          <div className="sm:text-right">
                            <span className={`inline-block rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${scheduleStatusBadges[sch.status] || 'bg-slate-100 text-slate-600'}`}>
                              {sch.status}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-400">
                    Tidak ada jadwal pemeliharaan terdekat.
                  </div>
                )}
              </div>
            )}

            {activeTab === 'histories' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Riwayat Pemeliharaan Lengkap</h3>
                  <Link
                    to="/histories"
                    className="flex items-center gap-1.5 rounded-lg border border-primary-100 bg-primary-50 px-3 py-1.5 text-xs font-bold text-primary-600 hover:bg-primary-100"
                  >
                    <Plus className="h-3.5 w-3.5" /> Log Servis
                  </Link>
                </div>

                {(vehicle as any).maintenanceHistories && (vehicle as any).maintenanceHistories.length > 0 ? (
                  <div className="divide-y divide-slate-100">
                    {(vehicle as any).maintenanceHistories.map((hist: any) => (
                      <div key={hist.id} className="py-4 first:pt-0 last:pb-0">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <span className="block font-bold text-slate-700">{hist.title}</span>
                            <span className="block text-xs text-slate-500 mt-1">{hist.workshopName} · {hist.odometerAtService.toLocaleString('id-ID')} KM</span>
                          </div>
                          <div className="text-left sm:text-right">
                            <span className="block font-extrabold text-sm text-primary-600">Rp {hist.cost.toLocaleString('id-ID')}</span>
                            <span className="block text-[10px] text-slate-400 mt-0.5">{new Date(hist.serviceDate).toLocaleDateString('id-ID')}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-400">
                    Belum ada riwayat pemeliharaan tercatat.
                  </div>
                )}
              </div>
            )}

            {activeTab === 'documents' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Dokumen Hukum & Lisensi</h3>
                  <Link
                    to="/documents"
                    className="flex items-center gap-1.5 rounded-lg border border-primary-100 bg-primary-50 px-3 py-1.5 text-xs font-bold text-primary-600 hover:bg-primary-100"
                  >
                    <Plus className="h-3.5 w-3.5" /> Kelola Dokumen
                  </Link>
                </div>

                {vehicle.documents && vehicle.documents.length > 0 ? (
                  <div className="divide-y divide-slate-100">
                    {vehicle.documents.map((doc) => {
                      const today = new Date();
                      const expiry = new Date(doc.expiryDate);
                      const diff = expiry.getTime() - today.getTime();
                      const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
                      
                      let docStatus = 'ACTIVE';
                      let docStatusStyle = 'bg-green-500/10 text-green-600 border-green-500/20';

                      if (days < 0) {
                        docStatus = 'EXPIRED';
                        docStatusStyle = 'bg-red-500/10 text-red-600 border-red-500/20';
                      } else if (days <= 30) {
                        docStatus = 'EXPIRES_SOON';
                        docStatusStyle = 'bg-amber-500/10 text-amber-600 border-amber-500/20';
                      }

                      return (
                        <div key={doc.id} className="py-4 first:pt-0 last:pb-0 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <span className="block font-bold text-slate-700">{doc.documentType} - {doc.documentNumber}</span>
                            <span className="block text-xs text-slate-500 mt-1">Provider: {doc.provider || '-'}</span>
                            <span className="block text-xs text-slate-400 mt-0.5">Berlaku s/d: <span className="font-semibold text-slate-600">{new Date(doc.expiryDate).toLocaleDateString('id-ID', { dateStyle: 'long' })}</span> ({days < 0 ? 'Kadaluarsa' : `${days} hari lagi`})</span>
                          </div>
                          <div className="sm:text-right">
                            <span className={`inline-block rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${docStatusStyle}`}>
                              {docStatus}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-400">
                    Belum ada dokumen yang didaftarkan.
                  </div>
                )}
              </div>
            )}

            {/* Comments Tab */}
            {activeTab === 'comments' && (
              <div className="space-y-5">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary-500" />
                  <h3 className="text-base font-bold text-slate-700 dark:text-slate-200">Komentar &amp; Catatan Tim</h3>
                </div>

                <form onSubmit={handleAddComment} className="flex gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-600 dark:bg-primary-900/40">
                    <UserIcon className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <textarea
                      value={commentContent}
                      onChange={(e) => setCommentContent(e.target.value)}
                      placeholder="Tambahkan komentar atau catatan..."
                      rows={2}
                      className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-primary-400 focus:bg-white focus:ring-2 focus:ring-primary-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                    />
                    <div className="mt-2 flex justify-end">
                      <button
                        type="submit"
                        disabled={commentSubmitting || !commentContent.trim()}
                        className="flex items-center gap-2 rounded-xl bg-primary-500 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-primary-600 disabled:opacity-50"
                      >
                        <Send className="h-3.5 w-3.5" />
                        {commentSubmitting ? 'Mengirim...' : 'Kirim'}
                      </button>
                    </div>
                  </div>
                </form>

                {comments.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 py-10 text-slate-400">
                    <MessageSquare className="h-10 w-10 opacity-30" />
                    <p className="text-sm">Belum ada komentar. Jadilah yang pertama!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {comments.map((comment: any) => (
                      <div key={comment.id} className="flex gap-3 group">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800">
                          <UserIcon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800/50">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{comment.user?.name}</span>
                              <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-500 dark:bg-slate-700 dark:text-slate-400">{comment.user?.role}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-slate-400">
                                {new Date(comment.createdAt).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                              </span>
                              <button
                                onClick={() => handleDeleteComment(comment.id)}
                                className="opacity-0 group-hover:opacity-100 rounded-lg p-1 text-slate-400 transition hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
                                title="Hapus komentar"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                          <p className="mt-1.5 text-sm text-slate-600 leading-relaxed dark:text-slate-300">{comment.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Odometer Update Modal */}
      {odoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setOdoModalOpen(false)} />
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-800">Update Odometer Kendaraan</h3>
              <p className="text-xs text-slate-500 mt-1">Catat kilometer terbaru. Odometer saat ini adalah <span className="font-bold text-slate-700">{vehicle.currentOdometer} KM</span>.</p>
            </div>

            {odoError && (
              <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-600">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
                <span>{odoError}</span>
              </div>
            )}

            <form onSubmit={handleUpdateOdometer} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Nilai Odometer Baru (KM)</label>
                <input
                  type="number"
                  required
                  value={newOdometer}
                  onChange={(e) => setNewOdometer(Number(e.target.value))}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 outline-none focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Catatan Perjalanan (Opsional)</label>
                <textarea
                  value={odoNotes}
                  onChange={(e) => setOdoNotes(e.target.value)}
                  placeholder="Misal: Perjalanan dinas ke Bandung, servis bulanan..."
                  rows={3}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 outline-none focus:border-primary-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setOdoModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-500 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={odoSubmitting}
                  className="rounded-xl bg-primary-500 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-primary-500/20 hover:bg-primary-600 disabled:opacity-50"
                >
                  {odoSubmitting ? 'Menyimpan...' : 'Simpan Log'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setDeleteDialogOpen(false)} />
          <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl text-center space-y-6">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
              <Trash2 className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">Hapus Kendaraan?</h3>
              <p className="text-sm text-slate-500 mt-2">Apakah Anda yakin ingin menghapus {vehicle.brand} {vehicle.model} ({vehicle.plateNumber})? Tindakan ini permanen dan akan menghapus semua dokumen, jadwal, serta riwayat odometer terkait.</p>
            </div>
            <div className="flex justify-center gap-3">
              <button
                type="button"
                onClick={() => setDeleteDialogOpen(false)}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-500 hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDeleteVehicle}
                disabled={deleteLoading}
                className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-red-600/20 hover:bg-red-700 disabled:opacity-50"
              >
                {deleteLoading ? 'Menghapus...' : 'Ya, Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleDetail;
