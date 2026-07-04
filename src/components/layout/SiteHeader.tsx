import { Link } from 'react-router-dom';
import { Search, ShieldCheck, LogIn, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SiteHeaderProps {
  search: string;
  onSearchChange(value: string): void;
}

export function SiteHeader({ search, onSearchChange }: SiteHeaderProps) {
  const { isAdmin } = useAuth();

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <img src="/favicon.svg" alt="Физика артефактілері логотипі" className="w-9 h-9 shrink-0" />
          <div className="min-w-0">
            <h1 className="font-bold text-gray-900 dark:text-gray-100 text-lg leading-tight truncate">
              Физика артефактілері
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate hidden sm:block">
              7–11 сынып оқушыларына арналған интерактивті жаттығулар
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:ml-auto">
          <div className="relative flex-1 sm:flex-none sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
            <input
              type="search"
              value={search}
              onChange={e => onSearchChange(e.target.value)}
              placeholder="Артефакт іздеу…"
              aria-label="Артефакт іздеу"
              className="w-full pl-9 pr-8 py-2 text-sm bg-gray-100 dark:bg-gray-800 border border-transparent focus:border-blue-400 focus:bg-white dark:focus:bg-gray-900 rounded-lg outline-none transition-colors text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
            />
            {search && (
              <button
                onClick={() => onSearchChange('')}
                aria-label="Іздеуді тазарту"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <Link
            to={isAdmin ? '/admin' : '/login'}
            aria-label={isAdmin ? 'Әкімші панелі' : 'Кіру'}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors shrink-0 ${
              isAdmin
                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            {isAdmin ? <ShieldCheck className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
            <span className="hidden md:inline">{isAdmin ? 'Әкімші панелі' : 'Кіру'}</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
