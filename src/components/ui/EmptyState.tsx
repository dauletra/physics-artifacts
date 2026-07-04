import { SearchX } from 'lucide-react';

interface EmptyStateProps {
  onClearFilters(): void;
}

export function EmptyState({ onClearFilters }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
      <SearchX className="w-12 h-12 text-gray-300 dark:text-gray-600" />
      <p className="text-gray-500 dark:text-gray-400 max-w-sm">
        Таңдалған сүзгілер бойынша артефактілер жоқ
      </p>
      <button
        onClick={onClearFilters}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
      >
        Сүзгілерді тазарту
      </button>
    </div>
  );
}
