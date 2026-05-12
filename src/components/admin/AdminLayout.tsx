import { NavLink, Outlet, Link } from 'react-router-dom';
import { LayoutGrid, Layers, Tags, LogOut, ExternalLink, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { to: '/admin', label: 'Артефактілер', icon: LayoutGrid, end: true, superOnly: false },
  { to: '/admin/sections', label: 'Бөлімдер', icon: Layers, end: false, superOnly: false },
  { to: '/admin/tags', label: 'Тегтер', icon: Tags, end: false, superOnly: false },
  { to: '/admin/admins', label: 'Әкімшілер', icon: ShieldCheck, end: false, superOnly: true },
];

export function AdminLayout() {
  const { user, signOut, isSuperAdmin } = useAuth();
  const visibleNavItems = navItems.filter(item => !item.superOnly || isSuperAdmin);
  const displayName = user?.displayName?.trim() || user?.email?.split('@')[0] || '';
  const initial = (displayName[0] ?? '?').toUpperCase();

  return (
    <div className="flex bg-gray-50 dark:bg-gray-950">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 sticky top-0 h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        <div className="px-4 py-5 border-b border-gray-200 dark:border-gray-700">
          <span className="font-semibold text-gray-900 dark:text-gray-100 text-sm">Физика — Әкімші</span>
        </div>
        <nav className="flex-1 px-2 py-3 space-y-0.5">
          {visibleNavItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-medium'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="px-3 py-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2.5 min-w-0">
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt={displayName}
                referrerPolicy="no-referrer"
                className="w-8 h-8 rounded-full object-cover shrink-0"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 flex items-center justify-center text-sm font-medium shrink-0">
                {initial}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1 min-w-0">
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate" title={displayName}>
                  {displayName}
                </span>
                {isSuperAdmin && (
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-500 shrink-0" aria-label="Бас әкімші" />
                )}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 truncate" title={user?.email ?? ''}>
                {user?.email}
              </div>
            </div>
          </div>
        </div>
        <div className="px-2 py-3 border-t border-gray-200 dark:border-gray-700 space-y-0.5">
          <Link
            to="/"
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Витринаға
          </Link>
          <button
            onClick={() => signOut()}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Шығу
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
