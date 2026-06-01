import React, { useEffect, useState } from 'react';
import api from '../api/api';
import {
  Car,
  CheckCircle,
  Wrench,
  AlertTriangle,
  FileText,
  DollarSign,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  History
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardData {
  summary: {
    totalVehicles: number;
    activeVehicles: number;
    inactiveVehicles: number;
    maintenanceVehicles: number;
    dueSchedulesCount: number;
    totalExpiredDocsCount: number;
    totalExpensesThisMonth: number;
  };
  top5Vehicles: Array<{
    vehicleId: string;
    plateNumber: string;
    brand: string;
    model: string;
    totalCost: number;
  }>;
  latestMaintenances: Array<{
    id: string;
    title: string;
    serviceDate: string;
    cost: number;
    vehicle: { plateNumber: string; brand: string; model: string };
  }>;
  reminders: {
    schedules: Array<{
      id: string;
      title: string;
      nextServiceDate: string;
      status: string;
      vehicle: { plateNumber: string; brand: string; model: string };
    }>;
    documents: Array<{
      id: string;
      documentType: string;
      documentNumber: string;
      expiryDate: string;
      status: string;
      vehicle: { plateNumber: string; brand: string; model: string };
    }>;
  };
}

const Dashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get('/reports/dashboard');
        setData(response.data.data);
      } catch (err: any) {
        setError('Gagal memuat data dashboard.');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-red-200 bg-red-50 p-12 text-center text-red-500">
        <AlertTriangle className="h-12 w-12 text-red-400" />
        <h3 className="mt-4 text-lg font-bold">Terjadi Kesalahan</h3>
        <p className="mt-2 text-sm">{error || 'Gagal memuat data.'}</p>
      </div>
    );
  }

  const { summary, top5Vehicles, latestMaintenances, reminders } = data;

  const statCards = [
    {
      title: 'Total Armada',
      value: summary.totalVehicles,
      icon: Car,
      color: 'bg-primary-500/10 text-primary-500',
    },
    {
      title: 'Kendaraan Aktif',
      value: summary.activeVehicles,
      icon: CheckCircle,
      color: 'bg-green-500/10 text-green-500',
    },
    {
      title: 'Dalam Maintenance',
      value: summary.maintenanceVehicles,
      icon: Wrench,
      color: 'bg-orange-500/10 text-orange-500',
    },
    {
      title: 'Servis Mendatang',
      value: summary.dueSchedulesCount,
      icon: AlertTriangle,
      color: 'bg-yellow-500/10 text-yellow-500',
      badge: summary.dueSchedulesCount > 0 ? 'Mendesak' : null,
    },
    {
      title: 'Pajak & KIR Kadaluarsa',
      value: summary.totalExpiredDocsCount,
      icon: FileText,
      color: 'bg-red-500/10 text-red-500',
      badge: summary.totalExpiredDocsCount > 0 ? 'Segera Urus' : null,
    },
    {
      title: 'Biaya Operasional Bulan Ini',
      value: `Rp ${(summary.totalExpensesThisMonth || 0).toLocaleString('id-ID')}`,
      icon: DollarSign,
      color: 'bg-purple-500/10 text-purple-500',
      large: true,
    },
  ];

  const chartData = top5Vehicles.map((item) => ({
    name: `${item.brand} (${item.plateNumber})`,
    Biaya: item.totalCost,
  }));

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-800">Dashboard Analitik</h1>
        <p className="mt-1 text-sm text-slate-500">Ringkasan status operasional dan kesehatan seluruh armada operasional Anda secara real-time.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className={`glass flex items-center justify-between rounded-2xl p-6 shadow-sm transition-all hover:shadow-md ${
                card.large ? 'sm:col-span-2 lg:col-span-1' : ''
              }`}
            >
              <div className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {card.title}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-extrabold text-slate-800">{card.value}</span>
                  {card.badge && (
                    <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-bold text-red-500">
                      {card.badge}
                    </span>
                  )}
                </div>
              </div>
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.color}`}>
                <Icon className="h-6 w-6" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts & Top Cost Section */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Cost breakdown chart */}
        <div className="glass rounded-2xl p-6 shadow-sm lg:col-span-2">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800">Top 5 Armada Biaya Servis Terbesar</h2>
            <TrendingUp className="h-5 w-5 text-slate-400" />
          </div>
          {chartData.length > 0 ? (
            <div className="h-72 w-full text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} />
                  <YAxis
                    tickFormatter={(val) => `Rp ${(val / 1000000).toFixed(1)}jt`}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    formatter={(value: any) => [`Rp ${value.toLocaleString('id-ID')}`, 'Total Biaya']}
                    contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff' }}
                  />
                  <Bar dataKey="Biaya" fill="#4f75ff" radius={[8, 8, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex h-72 items-center justify-center text-sm text-slate-400">
              Belum ada riwayat servis tercatat.
            </div>
          )}
        </div>

        {/* Latest Maintenances */}
        <div className="glass flex flex-col rounded-2xl p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800">Servis Terbaru</h2>
            <History className="h-5 w-5 text-slate-400" />
          </div>
          <div className="flex-1 space-y-4">
            {latestMaintenances.length > 0 ? (
              latestMaintenances.map((hist) => (
                <div key={hist.id} className="flex items-start gap-4 border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-500">
                    <Wrench className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="block text-sm font-bold text-slate-800 truncate">{hist.title}</span>
                    <span className="block text-xs text-slate-400">
                      {hist.vehicle.brand} ({hist.vehicle.plateNumber})
                    </span>
                  </div>
                  <span className="text-right text-xs font-bold text-slate-700 shrink-0">
                    Rp {hist.cost.toLocaleString('id-ID')}
                  </span>
                </div>
              ))
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-slate-400">
                Belum ada aktivitas servis terbaru.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reminders & Alerts Panels */}
      <div className="grid gap-8 md:grid-cols-2">
        {/* Schedules reminders */}
        <div className="glass rounded-2xl p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800">Reminder Servis Terdekat</h2>
            <Link to="/schedules" className="flex items-center gap-1 text-xs font-semibold text-primary-500 hover:text-primary-600">
              <span>Semua</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="space-y-4">
            {reminders.schedules.length > 0 ? (
              reminders.schedules.map((rem) => (
                <div key={rem.id} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                  <div className="min-w-0 space-y-1">
                    <span className="block text-sm font-bold text-slate-800 truncate">{rem.title}</span>
                    <span className="block text-xs text-slate-400">
                      {rem.vehicle.brand} ({rem.vehicle.plateNumber}) • {new Date(rem.nextServiceDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                      rem.status === 'OVERDUE'
                        ? 'bg-red-500/10 text-red-500'
                        : 'bg-yellow-500/10 text-yellow-500'
                    }`}
                  >
                    {rem.status === 'OVERDUE' ? 'Terlambat' : 'Mendekati'}
                  </span>
                </div>
              ))
            ) : (
              <div className="flex h-36 items-center justify-center text-sm text-slate-400">
                <div className="flex flex-col items-center gap-2">
                  <ShieldCheck className="h-8 w-8 text-green-400" />
                  <span>Jadwal servis aman.</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Documents expired reminders */}
        <div className="glass rounded-2xl p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800">Reminder Pajak & KIR</h2>
            <Link to="/documents" className="flex items-center gap-1 text-xs font-semibold text-primary-500 hover:text-primary-600">
              <span>Semua</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="space-y-4">
            {reminders.documents.length > 0 ? (
              reminders.documents.map((rem) => (
                <div key={rem.id} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                  <div className="min-w-0 space-y-1">
                    <span className="block text-sm font-bold text-slate-800 truncate">
                      {rem.documentType} ({rem.documentNumber})
                    </span>
                    <span className="block text-xs text-slate-400">
                      {rem.vehicle.brand} ({rem.vehicle.plateNumber}) • Exp: {new Date(rem.expiryDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                      rem.status === 'EXPIRED'
                        ? 'bg-red-500/10 text-red-500'
                        : 'bg-yellow-500/10 text-yellow-500'
                    }`}
                  >
                    {rem.status === 'EXPIRED' ? 'Expired' : 'Expires Soon'}
                  </span>
                </div>
              ))
            ) : (
              <div className="flex h-36 items-center justify-center text-sm text-slate-400">
                <div className="flex flex-col items-center gap-2">
                  <ShieldCheck className="h-8 w-8 text-green-400" />
                  <span>Semua STNK & KIR aktif.</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
