import { X, User, Search } from 'lucide-react';

interface FilterChipsProps {
  authorDisplayName: string | null;
  search: string;
  isFiltered: boolean;
  onClearAuthor(): void;
  onClearSearch(): void;
  onClearAll(): void;
}

function Chip({ icon, label, onRemove }: { icon: React.ReactNode; label: string; onRemove(): void }) {
  return (
    <span className="inline-flex items-center gap-1.5 pl-3 pr-1 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm rounded-full border border-blue-200 dark:border-blue-800">
      {icon}
      <span className="font-medium max-w-[14rem] truncate">{label}</span>
      <button
        onClick={onRemove}
        aria-label={`"${label}" сүзгісін алып тастау`}
        className="p-0.5 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </span>
  );
}

export function FilterChips({ authorDisplayName, search, isFiltered, onClearAuthor, onClearSearch, onClearAll }: FilterChipsProps) {
  if (!authorDisplayName && !search && !isFiltered) return null;

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      {authorDisplayName && (
        <Chip icon={<User className="w-3.5 h-3.5" />} label={`Автор: ${authorDisplayName}`} onRemove={onClearAuthor} />
      )}
      {search && (
        <Chip icon={<Search className="w-3.5 h-3.5" />} label={`«${search}»`} onRemove={onClearSearch} />
      )}
      {isFiltered && (
        <button
          onClick={onClearAll}
          className="text-sm text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 underline underline-offset-2 transition-colors"
        >
          Барлығын тазарту
        </button>
      )}
    </div>
  );
}
