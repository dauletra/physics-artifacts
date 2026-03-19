import { Link } from 'react-router-dom';
import { Copy, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import type { ArtifactGroup } from '../../types/artifact.types';
import { getViewUrl } from '../../utils/artifactUrl';

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
  const gradient = GRADIENTS[group.id.charCodeAt(0) % GRADIENTS.length];

  function copyLink(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(`${window.location.origin}/artifacts/${group.id}`);
    toast.success('Сілтеме көшірілді');
  }

  return (
    <Link
      to={`/artifacts/${group.id}`}
      className="group relative bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-shadow flex flex-col"
    >
      {/* Thumbnail */}
      <div className={`h-40 bg-gradient-to-br ${gradient} flex-shrink-0 relative overflow-hidden`}>
        {group.thumbnail && (
          <img
            src={group.thumbnail}
            alt={group.title}
            className="w-full h-full object-cover"
          />
        )}
        {/* Badges overlay */}
        <div className="absolute top-2 left-2 flex gap-1 flex-wrap">
          {showNewBadge && (
            <span className="px-2 py-0.5 bg-emerald-500 text-white text-xs font-medium rounded-full">
              Жаңа
            </span>
          )}
          {group.usesAI && (
            <span className="px-2 py-0.5 bg-violet-600 text-white text-xs font-medium rounded-full flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              AI
            </span>
          )}
        </div>
        {/* Copy button */}
        <button
          onClick={copyLink}
          className="absolute top-2 right-2 p-1.5 bg-black/30 hover:bg-black/50 text-white rounded-lg transition-colors"
          title="Сілтемені көшіру"
        >
          <Copy className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 text-sm leading-snug">
          {group.title}
        </h3>

        {/* Grade badges */}
        {group.grade && group.grade.length > 0 && (
          <div className="flex gap-1 flex-wrap">
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

        {/* Variants */}
        {group.variantCount > 1 && group.variantLabels.length > 0 && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-auto">
            {group.variantLabels.join(' · ')}
          </p>
        )}
      </div>
    </Link>
  );
}

export { getViewUrl };
