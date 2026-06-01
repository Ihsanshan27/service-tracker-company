import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/api';
import type { Vehicle, VehicleStatus } from '../types';
import { useAuth } from '../context/AuthContext';
import { Search, Plus, SlidersHorizontal, Eye, Compass, Fuel, Gauge, Car } from 'lucide-react';
import ExportButton from '../components/ExportButton';

const VehiclesList: React.FC = () => {
  const { hasRole } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [, setError] = useState<string | null>(null);

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>('');
  const [vehicleType, setVehicleType] = useState('');

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (search) params.search = search;
      if (status) params.status = status;
      if (vehicleType) params.vehicleType = vehicleType;

      const response = await api.get('/vehicles', { params });
      setVehicles(response.data.data);
    } catch (err: any) {
      setError('Gagal mengambil daftar kendaraan.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Debounce search slightly
    const delayDebounceFn = setTimeout(() => {
      fetchVehicles();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [search, status, vehicleType]);

  const canManage = hasRole(['SUPER_ADMIN', 'FLEET_MANAGER']);

  const statusLabels: Record<VehicleStatus, string> = {
    ACTIVE: 'Aktif',
    INACTIVE: 'Tidak Aktif',
    MAINTENANCE: 'Maintenance',
    SOLD: 'Terjual',
  };

  const statusColors: Record<VehicleStatus, string> = {
    ACTIVE: 'bg-green-500/10 text-green-600 border-green-500/20',
    INACTIVE: 'bg-slate-500/10 text-slate-600 border-slate-500/20',
    MAINTENANCE: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
    SOLD: 'bg-red-500/10 text-red-600 border-red-500/20',
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100">Daftar Armada Kendaraan</h1>
          <p className="mt-1 text-sm text-slate-500">Kelola, cari, dan pantau status seluruh kendaraan operasional organisasi.</p>
        </div>
        <div className="flex items-center gap-3">
          <ExportButton
            data={vehicles}
            filename="laporan-kendaraan"
            title="Laporan Daftar Kendaraan"
            columns={[
              { header: 'No. Polisi', key: 'plateNumber', width: 14 },
              { header: 'Merk', key: 'brand', width: 14 },
              { header: 'Model', key: 'model', width: 16 },
              { header: 'Tahun', key: 'year', width: 8 },
              { header: 'Warna', key: 'color', width: 10 },
              { header: 'Tipe', key: 'vehicleType', width: 12 },
              { header: 'Status', key: 'status', width: 12 },
              { header: 'Odometer (KM)', key: 'currentOdometer', width: 14 },
              { header: 'Bahan Bakar', key: 'fuelType', width: 12 },
            ]}
          />
          {canManage && (
            <Link
              to="/vehicles/new"
              className="flex items-center gap-2 rounded-xl bg-primary-500 px-5 py-3 font-semibold text-white shadow-lg shadow-primary-500/25 transition-all hover:bg-primary-600 hover:shadow-primary-500/35"
            >
              <Plus className="h-5 w-5" />
              <span>Tambah Kendaraan</span>
            </Link>
          )}
        </div>
      </div>

      {/* Filters Glassmorphic Card */}
      <div className="glass flex flex-col gap-4 rounded-2xl p-6 shadow-sm md:flex-row md:items-center">
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <Search className="h-5 w-5" />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white/50 py-3 pl-10 pr-4 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-primary-500 focus:bg-white"
            placeholder="Cari Plat Nomor, Merk, atau Model..."
          />
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-slate-400" />
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white/50 px-4 py-3 text-sm text-slate-700 outline-none focus:border-primary-500 focus:bg-white"
            >
              <option value="">Semua Status</option>
              <option value="ACTIVE">Aktif</option>
              <option value="INACTIVE">Tidak Aktif</option>
              <option value="MAINTENANCE">Maintenance</option>
              <option value="SOLD">Terjual</option>
            </select>
          </div>

          <select
            value={vehicleType}
            onChange={(e) => setVehicleType(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white/50 px-4 py-3 text-sm text-slate-700 outline-none focus:border-primary-500 focus:bg-white"
          >
            <option value="">Semua Tipe</option>
            <option value="MPV">MPV</option>
            <option value="Sedan">Sedan</option>
            <option value="SUV">SUV</option>
            <option value="Pick Up">Pick Up</option>
            <option value="Minibus">Minibus</option>
            <option value="Truck">Truk</option>
            <option value="Motorcycle">Sepeda Motor</option>
          </select>
        </div>
      </div>

      {/* Grid List */}
      {loading ? (
        <div className="flex h-[30vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
        </div>
      ) : vehicles.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {vehicles.map((v) => (
            <div
              key={v.id}
              className="glass relative flex flex-col justify-between overflow-hidden rounded-2xl shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:shadow-primary-500/5"
            >
              {/* Card Header */}
              <div className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <span className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                      {v.brand} {v.model}
                    </span>
                    <span className="block text-xl font-extrabold text-slate-800">{v.plateNumber}</span>
                  </div>
                  <span
                    className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${
                      statusColors[v.status] || 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {statusLabels[v.status]}
                  </span>
                </div>

                {/* Specs */}
                <div className="mt-6 grid grid-cols-3 gap-2 border-t border-slate-100 pt-4 text-xs text-slate-500">
                  <div className="flex flex-col gap-1 items-center text-center">
                    <Compass className="h-4 w-4 text-slate-400" />
                    <span>{v.transmission}</span>
                  </div>
                  <div className="flex flex-col gap-1 items-center text-center">
                    <Fuel className="h-4 w-4 text-slate-400" />
                    <span>{v.fuelType}</span>
                  </div>
                  <div className="flex flex-col gap-1 items-center text-center">
                    <Gauge className="h-4 w-4 text-slate-400" />
                    <span className="font-semibold text-slate-700">{v.currentOdometer.toLocaleString('id-ID')} km</span>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="flex border-t border-slate-100 bg-slate-50/50">
                <Link
                  to={`/vehicles/${v.id}`}
                  className="flex flex-1 items-center justify-center gap-2 py-4 text-xs font-bold text-slate-600 transition-all hover:bg-slate-100 hover:text-primary-500"
                >
                  <Eye className="h-4 w-4" />
                  <span>Detail Armada</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-500 shadow-sm">
          <Car className="h-12 w-12 text-slate-300" />
          <h3 className="mt-4 text-lg font-bold">Armada Kosong</h3>
          <p className="mt-2 text-sm max-w-sm">Tidak ada kendaraan operasional yang terdaftar yang cocok dengan filter atau pencarian Anda.</p>
        </div>
      )}
    </div>
  );
};

export default VehiclesList;
