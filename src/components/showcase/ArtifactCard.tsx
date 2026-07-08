import { Link, useNavigate } from 'react-router-dom';
import { Copy, Sparkles, User } from 'lucide-react';
import toast from 'react-hot-toast';
import type { ArtifactGroup } from '../../types/artifact.types';

const GRADIENTS = [
  'from-blue-400 to-indigo-600',
  'from-emerald-400 to-teal-600',
  'from-orange-400 to-rose-600',
  'from-violet-400 to-purple-600',
  'from-amber-400 to-orange-600',
  'from-pink-400 to-rose-600',
];

interface ArtifactCardProps {
  group: ArtifactGroup;
  showNewBadge: boolean;
}

export function ArtifactCard({ group, showNewBadge }: ArtifactCardProps) {
  const navigate = useNavigate();
  const gradient = GRADIENTS[group.id.charCodeAt(0) % GRADIENTS.length];
  const authorName = group.createdByName || (group.createdBy ? group.createdBy.split('@')[0] : null);

  function copyLink() {
    navigator.clipboard.writeText(`${window.location.origin}/artifacts/${group.id}`);
    toast.success('Сілтеме көшірілді');
  }

  function filterByAuthor() {
    if (!group.createdBy) return;
    navigate(`/?author=${encodeURIComponent(group.createdBy)}`);
  }

  return (
    <div className="group relative bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-shadow flex flex-col">
      {/* Stretched link covers the whole card for click/keyboard nav */}
      <Link to={`/artifacts/${group.id}`} className="absolute inset-0 z-0" aria-label={group.title} />

      {/* Thumbnail */}
      <div className={`h-40 bg-gradient-to-br ${gradient} shrink-0 relative overflow-hidden pointer-events-none`}>
        {group.thumbnail && (
          <img src={group.thumbnail} alt={group.title} className="w-full h-full object-cover" />
        )}
        {/* Badges overlay */}
        <div className="absolute top-2 left-2 flex gap-1 flex-wrap">
          {showNewBadge && (
            <span className="px-2 py-0.5 bg-emerald-600 text-white text-xs font-medium rounded-full">
              Жаңа
            </span>
          )}
          {group.usesAI && (
            <span className="px-2 py-0.5 bg-violet-700 text-white text-xs font-medium rounded-full flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              AI
            </span>
          )}
        </div>
      </div>

      {/* Copy button — above the stretched link, needs pointer-events */}
      <button
        onClick={copyLink}
        aria-label="Сілтемені көшіру"
        title="Сілтемені көшіру"
        className="absolute top-2 right-2 z-10 p-1.5 bg-black/40 hover:bg-black/60 text-white rounded-lg transition-colors"
      >
        <Copy className="w-3.5 h-3.5" />
      </button>

      {/* Content */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 text-sm leading-snug pointer-events-none">
          {group.title}
        </h3>

        {group.description && (
          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 pointer-events-none">
            {group.description}
          </p>
        )}

        {/* Grade badges */}
        {group.grade && group.grade.length > 0 && (
          <div className="flex gap-1 flex-wrap pointer-events-none">
            {group.grade.map(g => (
              <span
                key={g}
                className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs rounded"
              >
                {g} кл.
              </span>
            ))}
          </div>
        )}

        {/* Meta footer */}
        <div className="mt-auto flex flex-col gap-1">
          {authorName && (
            <button
              onClick={filterByAuthor}
              title={group.createdBy ? `Автордың барлық артефактілері: ${group.createdBy}` : undefined}
              aria-label={group.createdBy ? `Автордың барлық артефактілерін көрсету: ${authorName}` : undefined}
              className="relative z-10 flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-left min-w-0"
            >
              <User className="w-3 h-3 shrink-0" />
              <span className="truncate">{authorName}</span>
            </button>
          )}
          {group.variantCount > 1 && group.variantLabels.length > 0 && (
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate pointer-events-none">
              {group.variantLabels.join(' · ')}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
