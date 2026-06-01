import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../api/api';
import { ArrowLeft, Save, AlertTriangle } from 'lucide-react';

const EditVehicle: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    plateNumber: '',
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    color: '',
    vehicleType: 'MPV',
    fuelType: 'Pertalite',
    transmission: 'Manual',
    chassisNumber: '',
    engineNumber: '',
    currentOdometer: 0,
    status: 'ACTIVE',
    purchaseDate: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        const response = await api.get(`/vehicles/${id}`);
        const data = response.data?.data || response.data;
        
        if (data) {
          setForm({
            plateNumber: data.plateNumber || '',
            brand: data.brand || '',
            model: data.model || '',
            year: data.year || new Date().getFullYear(),
            color: data.color || '',
            vehicleType: data.vehicleType || 'MPV',
            fuelType: data.fuelType || 'Pertalite',
            transmission: data.transmission || 'Manual',
            chassisNumber: data.chassisNumber || '',
            engineNumber: data.engineNumber || '',
            currentOdometer: data.currentOdometer || 0,
            status: data.status || 'ACTIVE',
            purchaseDate: data.purchaseDate ? data.purchaseDate.split('T')[0] : new Date().toISOString().split('T')[0],
            notes: data.notes || '',
          });
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Gagal memuat data kendaraan.');
      } finally {
        setFetching(false);
      }
    };

    fetchVehicle();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === 'year' || name === 'currentOdometer' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await api.patch(`/vehicles/${id}`, form);
      navigate(`/vehicles/${id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal memperbarui kendaraan.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Back Header */}
      <div className="flex items-center gap-4">
        <Link to={`/vehicles/${id}`} className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-500 hover:bg-slate-50">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">Edit Kendaraan</h1>
          <p className="mt-1 text-sm text-slate-500">Ubah spesifikasi, detail teknis, atau status kendaraan operasional.</p>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          <AlertTriangle className="h-5 w-5 shrink-0 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="glass rounded-2xl p-6 shadow-sm space-y-8">
        {/* Section 1: Identifikasi Kendaraan */}
        <div className="space-y-6">
          <h2 className="text-base font-bold text-slate-800 border-l-4 border-primary-500 pl-3">Identifikasi Utama</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Nomor Polisi (Plat)</label>
              <input
                type="text"
                required
                name="plateNumber"
                value={form.plateNumber}
                onChange={handleChange}
                placeholder="B 1234 ABC"
                className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-800 outline-none focus:border-primary-500 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Merk / Brand</label>
              <input
                type="text"
                required
                name="brand"
                value={form.brand}
                onChange={handleChange}
                placeholder="Toyota, Honda, Mitsubishi..."
                className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-800 outline-none focus:border-primary-500 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Model Kendaraan</label>
              <input
                type="text"
                required
                name="model"
                value={form.model}
                onChange={handleChange}
                placeholder="Avanza, Civic, L300..."
                className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-800 outline-none focus:border-primary-500 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Tahun Pembuatan</label>
              <input
                type="number"
                required
                name="year"
                value={form.year}
                onChange={handleChange}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-800 outline-none focus:border-primary-500 focus:bg-white"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Spesifikasi Fisik & Status */}
        <div className="space-y-6">
          <h2 className="text-base font-bold text-slate-800 border-l-4 border-primary-500 pl-3">Spesifikasi, Teknis & Status</h2>
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Status Kendaraan</label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-700 outline-none focus:border-primary-500 focus:bg-white font-bold text-primary-600"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
                <option value="MAINTENANCE">MAINTENANCE</option>
                <option value="SOLD">SOLD</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Tipe Kendaraan</label>
              <select
                name="vehicleType"
                value={form.vehicleType}
                onChange={handleChange}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-700 outline-none focus:border-primary-500 focus:bg-white"
              >
                <option value="MPV">MPV</option>
                <option value="Sedan">Sedan</option>
                <option value="SUV">SUV</option>
                <option value="Pick Up">Pick Up</option>
                <option value="Minibus">Minibus</option>
                <option value="Truck">Truk</option>
                <option value="Motorcycle">Sepeda Motor</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Bahan Bakar</label>
              <input
                type="text"
                required
                name="fuelType"
                value={form.fuelType}
                onChange={handleChange}
                placeholder="Pertalite, Pertamax, Solar..."
                className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-800 outline-none focus:border-primary-500 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Transmisi</label>
              <select
                name="transmission"
                value={form.transmission}
                onChange={handleChange}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-700 outline-none focus:border-primary-500 focus:bg-white"
              >
                <option value="Manual">Manual</option>
                <option value="Otomatis">Otomatis</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Warna</label>
              <input
                type="text"
                required
                name="color"
                value={form.color}
                onChange={handleChange}
                placeholder="Hitam, Putih, Silver..."
                className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-800 outline-none focus:border-primary-500 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Nomor Rangka</label>
              <input
                type="text"
                required
                name="chassisNumber"
                value={form.chassisNumber}
                onChange={handleChange}
                placeholder="MHF123..."
                className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-800 outline-none focus:border-primary-500 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Nomor Mesin</label>
              <input
                type="text"
                required
                name="engineNumber"
                value={form.engineNumber}
                onChange={handleChange}
                placeholder="1NR..."
                className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-800 outline-none focus:border-primary-500 focus:bg-white"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Pembelian & Mileage */}
        <div className="space-y-6">
          <h2 className="text-base font-bold text-slate-800 border-l-4 border-primary-500 pl-3">Pembelian & Odometer</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Odometer Saat Ini (KM)</label>
              <input
                type="number"
                required
                name="currentOdometer"
                value={form.currentOdometer}
                onChange={handleChange}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-800 outline-none focus:border-primary-500 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Tanggal Pembelian</label>
              <input
                type="date"
                required
                name="purchaseDate"
                value={form.purchaseDate}
                onChange={handleChange}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-800 outline-none focus:border-primary-500 focus:bg-white"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Catatan */}
        <div className="space-y-6">
          <h2 className="text-base font-bold text-slate-800 border-l-4 border-primary-500 pl-3">Catatan Tambahan</h2>
          <div>
            <textarea
              name="notes"
              rows={4}
              value={form.notes}
              onChange={handleChange}
              placeholder="Catatan mengenai kondisi kendaraan, peruntukan operasional, dll..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-800 outline-none focus:border-primary-500 focus:bg-white"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-4 border-t border-slate-100 pt-6">
          <Link
            to={`/vehicles/${id}`}
            className="rounded-xl border border-slate-200 bg-white px-6 py-3 font-semibold text-slate-500 transition-all hover:bg-slate-50"
          >
            Batal
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 rounded-xl bg-primary-500 px-6 py-3 font-semibold text-white shadow-lg shadow-primary-500/25 transition-all hover:bg-primary-600 hover:shadow-primary-500/35 disabled:opacity-50"
          >
            {loading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <>
                <Save className="h-5 w-5" />
                <span>Simpan Perubahan</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditVehicle;
