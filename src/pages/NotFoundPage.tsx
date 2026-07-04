import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="text-7xl font-bold text-gray-300 dark:text-gray-700 select-none">404</div>
        <div className="space-y-2">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Бет табылмады
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Іздеп жатқан бетіңіз жоқ немесе ауыстырылған.
          </p>
        </div>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          <Home className="w-4 h-4" />
          Витринаға қайту
        </Link>
      </div>
    </div>
  );
}
