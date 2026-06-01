import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Car,
  Calendar,
  History,
  FileText,
  Users,
  LogOut,
  Menu,
  X,
  User as UserIcon,
  Sun,
  Moon,
  Search,
  ClipboardList,
  DollarSign,
  AlertTriangle
} from 'lucide-react';
import GlobalSearch from './GlobalSearch';

const DashboardLayout: React.FC = () => {
  const { user, logout, hasRole } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });

  // Ctrl+K to open search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    {
      label: 'Dashboard',
      path: '/',
      icon: LayoutDashboard,
      roles: ['SUPER_ADMIN', 'FLEET_MANAGER', 'MECHANIC', 'DRIVER', 'FINANCE'],
    },
    {
      label: 'Data Kendaraan',
      path: '/vehicles',
      icon: Car,
      roles: ['SUPER_ADMIN', 'FLEET_MANAGER', 'MECHANIC', 'DRIVER', 'FINANCE'],
    },
    {
      label: 'Jadwal Servis',
      path: '/schedules',
      icon: Calendar,
      roles: ['SUPER_ADMIN', 'FLEET_MANAGER', 'MECHANIC', 'DRIVER'],
    },
    {
      label: 'Riwayat Servis',
      path: '/histories',
      icon: History,
      roles: ['SUPER_ADMIN', 'FLEET_MANAGER', 'MECHANIC', 'DRIVER', 'FINANCE'],
    },
    {
      label: 'Dokumen Pajak/KIR',
      path: '/documents',
      icon: FileText,
      roles: ['SUPER_ADMIN', 'FLEET_MANAGER', 'MECHANIC', 'DRIVER', 'FINANCE'],
    },
    {
      label: 'Biaya & Pengeluaran',
      path: '/expenses',
      icon: DollarSign,
      roles: ['SUPER_ADMIN', 'FLEET_MANAGER', 'FINANCE'],
    },
    {
      label: 'Laporan Kerusakan',
      path: '/damage-reports',
      icon: AlertTriangle,
      roles: ['SUPER_ADMIN', 'FLEET_MANAGER', 'MECHANIC', 'DRIVER'],
    },
    {
      label: 'Kelola Pengguna',
      path: '/users',
      icon: Users,
      roles: ['SUPER_ADMIN'],
    },
    {
      label: 'Audit Log',
      path: '/audit-logs',
      icon: ClipboardList,
      roles: ['SUPER_ADMIN'],
    },
  ];

  const filteredNavItems = navItems.filter((item) => hasRole(item.roles as any));

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
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar - Desktop */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-slate-200 bg-white px-4 py-6 md:block">
        <div className="mb-8 flex items-center gap-3 px-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-500 text-white shadow-md shadow-primary-500/20">
            <LayoutDashboard className="h-5 w-5" />
          </div>
          <div>
            <span className="text-base font-bold text-slate-800">Vehicle Tracker</span>
            <span className="block text-[10px] text-slate-400">Armada Organisasi</span>
          </div>
        </div>

        <nav className="space-y-1.5">
          {filteredNavItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-primary-500 text-white shadow-md shadow-primary-500/15'
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                }`}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-6 left-4 right-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-500 transition-all hover:bg-red-50 hover:text-red-600 hover:border-red-100"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            <span>Keluar Sistem</span>
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex flex-1 flex-col md:pl-64">
        {/* Topbar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 md:px-8">
          <button
            onClick={() => setMobileOpen(true)}
            className="rounded-xl border border-slate-200 p-2 text-slate-500 hover:bg-slate-50 md:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="hidden text-sm font-semibold text-slate-500 md:block">
            {location.pathname === '/' ? 'Selamat Datang Kembali 👋' : 'Sistem Tracker Skripsi'}
          </div>

          {user && (
            <div className="flex items-center gap-2 md:gap-4">
              {/* Search Button */}
              <button
                onClick={() => setSearchOpen(true)}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500 transition-all hover:bg-white hover:shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700"
                title="Cari (Ctrl+K)"
              >
                <Search className="h-4 w-4" />
                <span className="hidden text-xs md:inline">Cari...</span>
                <kbd className="hidden rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] text-slate-400 md:inline dark:border-slate-600 dark:bg-slate-700">Ctrl K</kbd>
              </button>

              <button
                onClick={toggleTheme}
                className="rounded-xl border border-slate-200 p-2 text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-all dark:hover:bg-slate-800"
                title={theme === 'light' ? 'Mode Malam' : 'Mode Terang'}
              >
                {theme === 'light' ? <Moon className="h-4.5 w-4.5" /> : <Sun className="h-4.5 w-4.5" />}
              </button>
              <span
                className={`hidden rounded-full border px-2.5 py-0.5 text-xs font-semibold sm:inline ${
                  roleColors[user.role] || 'bg-slate-100 text-slate-600'
                }`}
              >
                {roleLabels[user.role] || user.role}
              </span>
              <div className="flex items-center gap-2 border-l border-slate-200 pl-3 md:pl-4 dark:border-slate-700">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  <UserIcon className="h-4 w-4" />
                </div>
                <div className="hidden text-left md:block">
                  <span className="block text-sm font-bold text-slate-800 dark:text-slate-100">{user.name}</span>
                  <span className="block text-[10px] text-slate-400">{user.email}</span>
                </div>
              </div>
            </div>
          )}
        </header>

        {/* Content Wrapper */}
        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
          <Outlet />
        </main>
      </div>

      {/* Mobile Drawer Sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Overlay background blur */}
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />

          <aside className="relative flex w-full max-w-xs flex-col bg-white p-6 shadow-2xl dark:bg-slate-900">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute right-4 top-4 rounded-xl border border-slate-200 p-2 text-slate-500 hover:bg-slate-50 dark:border-slate-700"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-6 flex items-center gap-3 px-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-500 text-white shadow-md shadow-primary-500/20">
                <LayoutDashboard className="h-5 w-5" />
              </div>
              <div>
                <span className="text-base font-bold text-slate-800 dark:text-slate-100">Vehicle Tracker</span>
                <span className="block text-[10px] text-slate-400">Armada Organisasi</span>
              </div>
            </div>

            {/* Mobile Search */}
            <button
              onClick={() => { setMobileOpen(false); setSearchOpen(true); }}
              className="mb-4 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800"
            >
              <Search className="h-4 w-4" />
              <span>Cari...</span>
            </button>

            <nav className="space-y-1.5 flex-1">
              {filteredNavItems.map((item) => {
                const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
                      isActive
                        ? 'bg-primary-500 text-white shadow-md shadow-primary-500/15'
                        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:hover:bg-slate-800 dark:hover:text-slate-100'
                    }`}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="mt-auto pt-4">
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-500 transition-all hover:bg-red-50 hover:text-red-600 hover:border-red-100 dark:border-slate-700 dark:bg-slate-800"
              >
                <LogOut className="h-5 w-5 shrink-0" />
                <span>Keluar Sistem</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Global Search Modal */}
      <GlobalSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
};

export default DashboardLayout;
