import React, { useState, useEffect } from 'react';
import api from '../api/api';
import type { User, UserRole } from '../types';
import {
  Users,
  Search,
  Filter,
  Plus,
  Trash2,
  Edit,
  X,
  AlertTriangle,
  Mail,
  Phone,
  UserCheck,
  UserX
} from 'lucide-react';

const UsersManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Registration Toggler Setting
  const [regEnabled, setRegEnabled] = useState(true);
  const [togglingReg, setTogglingReg] = useState(false);

  // Search & Filter
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  // Modal States
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'DRIVER' as UserRole,
    phone: '',
    isActive: true
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users');
      const data = response.data?.data || response.data || [];
      setUsers(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal memuat daftar pengguna.');
    } finally {
      setLoading(false);
    }
  };

  const fetchRegSetting = async () => {
    try {
      const response = await api.get('/settings/registration');
      setRegEnabled(response.data.data.registrationEnabled);
    } catch (err) {
      console.error('Gagal mengambil status registrasi:', err);
    }
  };

  const handleToggleRegistration = async () => {
    setTogglingReg(true);
    try {
      const newValue = !regEnabled;
      await api.patch('/settings', {
        key: 'registration_enabled',
        value: newValue ? 'true' : 'false',
      });
      setRegEnabled(newValue);
    } catch (err) {
      alert('Gagal memperbarui status registrasi.');
    } finally {
      setTogglingReg(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchRegSetting();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const resolvedValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setForm((prev) => ({ ...prev, [name]: resolvedValue }));
  };

  const handleOpenCreate = () => {
    setModalMode('create');
    setSelectedUser(null);
    setForm({
      name: '',
      email: '',
      password: '',
      role: 'DRIVER',
      phone: '',
      isActive: true
    });
    setModalError(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (userToEdit: User) => {
    setModalMode('edit');
    setSelectedUser(userToEdit);
    setForm({
      name: userToEdit.name,
      email: userToEdit.email,
      password: '', // Leave blank for edit (optional backend password changes)
      role: userToEdit.role,
      phone: userToEdit.phone || '',
      isActive: userToEdit.isActive
    });
    setModalError(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);
    setModalLoading(true);

    try {
      if (modalMode === 'create') {
        if (!form.password) {
          setModalError('Password wajib diisi untuk pengguna baru.');
          setModalLoading(false);
          return;
        }
        const createPayload = {
          name: form.name,
          email: form.email,
          password: form.password,
          role: form.role,
          phone: form.phone || undefined
        };
        await api.post('/users', createPayload);
      } else if (modalMode === 'edit' && selectedUser) {
        const payload: any = {
          name: form.name,
          email: form.email,
          role: form.role,
          phone: form.phone || undefined,
          isActive: form.isActive
        };
        // Only supply password if entered during edit
        if (form.password) {
          payload.password = form.password;
        }
        await api.patch(`/users/${selectedUser.id}`, payload);
      }

      setModalOpen(false);
      fetchUsers();
    } catch (err: any) {
      setModalError(err.response?.data?.message || 'Gagal menyimpan data pengguna.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleToggleActive = async (userToToggle: User) => {
    try {
      await api.patch(`/users/${userToToggle.id}`, {
        isActive: !userToToggle.isActive
      });
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal mengubah status keaktifan.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus akun ini secara permanen?')) return;
    try {
      await api.delete(`/users/${id}`);
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menghapus pengguna.');
    }
  };

  // Filter Logic
  const filteredUsers = users.filter((u) => {
    const matchesSearch = 
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.phone && u.phone.includes(search));

    const matchesRole = roleFilter === '' || u.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const roleLabels: Record<string, string> = {
    SUPER_ADMIN: 'Super Admin',
    FLEET_MANAGER: 'Fleet Manager',
    MECHANIC: 'Mechanic',
    DRIVER: 'Driver',
    FINANCE: 'Finance',
  };

  const roleColors: Record<string, string> = {
    SUPER_ADMIN: 'bg-red-500/10 text-red-500 border-red-500/20',
    FLEET_MANAGER: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    MECHANIC: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
    DRIVER: 'bg-green-500/10 text-green-500 border-green-500/20',
    FINANCE: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">Kelola Pengguna</h1>
          <p className="mt-1 text-sm text-slate-500">Daftarkan akun staf baru, kelola peranan hak akses (RBAC), serta kendalikan keaktifan akun.</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 rounded-xl bg-primary-500 px-4 py-2.5 font-semibold text-white shadow-lg shadow-primary-500/25 transition-all hover:bg-primary-600 hover:shadow-primary-500/35"
        >
          <Plus className="h-5 w-5" />
          <span>Tambah Staff Baru</span>
        </button>
      </div>

      {/* Configuration Toggle Panel (SUPER_ADMIN) */}
      <div className="glass rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-left">
          <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-primary-500 animate-pulse"></span>
            Registrasi Mandiri (Form Daftar Akun Baru)
          </h2>
          <p className="text-xs text-slate-400">
            Tentukan apakah publik diizinkan untuk mendaftarkan akun baru secara mandiri melalui halaman depan/login.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className={`text-xs font-extrabold ${regEnabled ? 'text-green-600' : 'text-slate-400'}`}>
            {regEnabled ? 'AKTIF (Terbuka Publik)' : 'NONAKTIF (Daftar Lewat Admin)'}
          </span>
          <button
            onClick={handleToggleRegistration}
            disabled={togglingReg}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              regEnabled ? 'bg-primary-500' : 'bg-slate-200 dark:bg-slate-700'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                regEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Filter and Search Panel */}
      <div className="glass rounded-2xl p-5 shadow-sm flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Cari berdasarkan nama, email, atau handphone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-11 pr-4 py-2.5 text-sm text-slate-800 outline-none focus:border-primary-500 focus:bg-white"
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-500">
            <Filter className="h-4 w-4" />
            <span>Hak Akses</span>
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 outline-none focus:border-primary-500"
          >
            <option value="">Semua Hak Akses</option>
            <option value="SUPER_ADMIN">Super Admin</option>
            <option value="FLEET_MANAGER">Fleet Manager</option>
            <option value="MECHANIC">Mechanic</option>
            <option value="DRIVER">Driver</option>
            <option value="FINANCE">Finance</option>
          </select>
        </div>
      </div>

      {/* Main Table Grid */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
        </div>
      ) : error ? (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          <AlertTriangle className="h-5 w-5 shrink-0 text-red-500" />
          <span>{error}</span>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center max-w-lg mx-auto space-y-4">
          <Users className="h-12 w-12 text-slate-300 mx-auto" />
          <h2 className="text-lg font-bold text-slate-800">Akun Tidak Ditemukan</h2>
          <p className="text-sm text-slate-500">Tidak ada staf terdaftar yang sesuai dengan parameter pencarian Anda.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full border-collapse text-left text-sm text-slate-500">
            <thead className="bg-slate-50/75 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Nama Profil</th>
                <th className="px-6 py-4">Hubungan & Kontak</th>
                <th className="px-6 py-4">Hak Akses Role</th>
                <th className="px-6 py-4">Status Akun</th>
                <th className="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/50 transition-all text-slate-700">
                  <td className="px-6 py-4">
                    <div>
                      <span className="block font-bold text-slate-800">{u.name}</span>
                      <span className="block text-[11px] text-slate-400 mt-0.5">ID: {u.id.slice(0, 8)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1 text-xs">
                      <span className="block text-slate-600 flex items-center gap-1 font-bold">
                        <Mail className="h-3.5 w-3.5 text-slate-400" /> {u.email}
                      </span>
                      {u.phone && (
                        <span className="block text-slate-400 flex items-center gap-1">
                          <Phone className="h-3.5 w-3.5 text-slate-400" /> {u.phone}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-block rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${roleColors[u.role] || 'bg-slate-100'}`}>
                      {roleLabels[u.role] || u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggleActive(u)}
                      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold cursor-pointer transition-all ${
                        u.isActive 
                          ? 'bg-green-500/10 text-green-600 border-green-500/20 hover:bg-green-500/20' 
                          : 'bg-red-500/10 text-red-600 border-red-500/20 hover:bg-red-500/20'
                      }`}
                    >
                      {u.isActive ? (
                        <>
                          <UserCheck className="h-3 w-3" />
                          <span>AKTIF</span>
                        </>
                      ) : (
                        <>
                          <UserX className="h-3 w-3" />
                          <span>DIBEKUKAN</span>
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleOpenEdit(u)}
                        className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(u.id)}
                        className="rounded-xl border border-red-100 p-2 text-red-500 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Creation/Editing Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-slate-800">
                  {modalMode === 'create' ? 'Tambah Akun Staff Baru' : 'Edit Pengaturan Akun'}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {modalMode === 'create' ? 'Daftarkan pengguna baru beserta kewenangannya di sistem.' : 'Modifikasi peranan, detail kontak, atau sandi staf.'}
                </p>
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

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Nama Lengkap Staff</label>
                <input
                  type="text"
                  required
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Contoh: Muhammad Ihsan"
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 outline-none focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Alamat Surat Elektronik (Email)</label>
                <input
                  type="email"
                  required
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Contoh: ihsan@example.com"
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 outline-none focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Kata Sandi (Password) {modalMode === 'edit' && '(Kosongkan jika tak diubah)'}
                </label>
                <input
                  type="password"
                  required={modalMode === 'create'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Minimal 6 karakter"
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 outline-none focus:border-primary-500"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Kewenangan / Role (RBAC)</label>
                  <select
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 outline-none focus:border-primary-500 font-bold"
                  >
                    <option value="SUPER_ADMIN">Super Admin</option>
                    <option value="FLEET_MANAGER">Fleet Manager</option>
                    <option value="MECHANIC">Mekanik</option>
                    <option value="DRIVER">Pengemudi (Driver)</option>
                    <option value="FINANCE">Finance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">No. Handphone (Opsional)</label>
                  <input
                    type="text"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="Contoh: 0812345678"
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 outline-none focus:border-primary-500"
                  />
                </div>
              </div>

              {modalMode === 'edit' && (
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    name="isActive"
                    checked={form.isActive}
                    onChange={(e) => setForm(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="h-4.5 w-4.5 rounded border-slate-200 text-primary-500 focus:ring-primary-500"
                  />
                  <label htmlFor="isActive" className="text-sm font-bold text-slate-700 select-none">Akun Aktif & Diperkenankan Login</label>
                </div>
              )}

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
                  {modalLoading ? 'Menyimpan...' : 'Simpan Akun'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersManagement;
