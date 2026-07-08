import type { Tag } from '../../types/artifact.types';

interface FilterBarProps {
  tags: Tag[];
  selectedTagIds: string[];
  onTagIdsChange(v: string[]): void;
}

function TagBtn({ active, onClick, children }: { active: boolean; onClick(): void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-3.5 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
        active
          ? 'bg-violet-600 text-white'
          : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-violet-50 dark:hover:bg-violet-900/30 hover:text-violet-600 dark:hover:text-violet-400'
      }`}
    >
      {children}
    </button>
  );
}

export function FilterBar({ tags, selectedTagIds, onTagIdsChange }: FilterBarProps) {
  function toggleTag(id: string) {
    onTagIdsChange(
      selectedTagIds.includes(id)
        ? selectedTagIds.filter(t => t !== id)
        : [...selectedTagIds, id]
    );
  }

  if (tags.length === 0) return null;

  return (
    <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-20 py-3 px-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-gray-500 dark:text-gray-400 shrink-0">Тегтер:</span>
        {tags.map(tag => (
          <TagBtn key={tag.id} active={selectedTagIds.includes(tag.id)} onClick={() => toggleTag(tag.id)}>
            {tag.label}
          </TagBtn>
        ))}
      </div>
    </div>
  );
}
