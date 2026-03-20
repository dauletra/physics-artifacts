import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useArtifactGroups } from '../../hooks/useArtifactGroups';
import { useTags } from '../../hooks/useTags';
import { artifactGroupService } from '../../services/artifactGroupService';
import { DeleteConfirmModal } from '../../components/modals/DeleteConfirmModal';
import { ErrorState } from '../../components/ui/ErrorState';
import { Spinner } from '../../components/ui/Spinner';
import { ADMIN_PAGE_SIZE } from '../../config/constants';
import type { ArtifactGroup } from '../../types/artifact.types';

export function ArtifactsListPage() {
  const { groups, loading, error, reload } = useArtifactGroups();
  const { tags } = useTags();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState<ArtifactGroup | null>(null);
  const [deleting, setDeleting] = useState(false);

  const tagMap = useMemo(() => new Map(tags.map(t => [t.id, t.label])), [tags]);

  const filtered = useMemo(
    () => groups.filter(g => g.title.toLowerCase().includes(search.toLowerCase())),
    [groups, search]
  );

  const totalPages = Math.ceil(filtered.length / ADMIN_PAGE_SIZE);
  const paged = filtered.slice(page * ADMIN_PAGE_SIZE, (page + 1) * ADMIN_PAGE_SIZE);

  async function togglePublic(group: ArtifactGroup) {
    try {
      await artifactGroupService.update(group.id, { isPublic: !group.isPublic });
      reload();
    } catch {
      toast.error('Жаңарту қатесі');
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await artifactGroupService.delete(deleteTarget.id);
      toast.success('Жойылды');
      setDeleteTarget(null);
      reload();
    } catch {
      toast.error('Жою қатесі');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Артефактілер</h2>
        <Link
          to="/admin/artifacts/new"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Жасау
        </Link>
      </div>

      <input
        type="text"
        value={search}
        onChange={e => { setSearch(e.target.value); setPage(0); }}
        placeholder="Атауы бойынша іздеу..."
        className="w-full max-w-xs px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
      />

      {error && <ErrorState message="Ошибка загрузки" onRetry={reload} />}

      {loading ? (
        <div className="flex justify-center py-16"><Spinner /></div>
      ) : (
        <>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="text-left px-4 py-3 text-gray-600 dark:text-gray-400 font-medium">Атауы</th>
                  <th className="text-center px-4 py-3 text-gray-600 dark:text-gray-400 font-medium">Сынып</th>
                  <th className="text-center px-4 py-3 text-gray-600 dark:text-gray-400 font-medium">Тоқсан</th>
                  <th className="text-left px-4 py-3 text-gray-600 dark:text-gray-400 font-medium">Тегтер</th>
                  <th className="text-center px-4 py-3 text-gray-600 dark:text-gray-400 font-medium">Нұсқалар</th>
                  <th className="text-center px-4 py-3 text-gray-600 dark:text-gray-400 font-medium">Жарияланған</th>
                  <th className="text-left px-4 py-3 text-gray-600 dark:text-gray-400 font-medium">Жасалған</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {paged.map(g => (
                  <tr key={g.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="px-4 py-3 text-gray-900 dark:text-gray-100 font-medium max-w-xs truncate">
                      {g.title}
                    </td>
                    <td className="px-4 py-3 text-center text-gray-600 dark:text-gray-400 text-xs">
                      {g.grade?.length ? g.grade.join(', ') : '—'}
                    </td>
                    <td className="px-4 py-3 text-center text-gray-600 dark:text-gray-400 text-xs">
                      {g.quarter ?? '—'}
                    </td>
                    <td className="px-4 py-3">
                      {g.tagIds?.length ? (
                        <div className="flex flex-wrap gap-1">
                          {g.tagIds.map(id => (
                            <span key={id} className="px-1.5 py-0.5 bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 text-xs rounded">
                              {tagMap.get(id) ?? id}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center text-gray-600 dark:text-gray-400">
                      {g.variantCount}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => togglePublic(g)}
                        className={`relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors ${
                          g.isPublic ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 mt-0.5 rounded-full bg-white shadow transform transition-transform ${
                            g.isPublic ? 'translate-x-4' : 'translate-x-0.5'
                          }`}
                        />
                      </button>
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs">
                      {g.createdAt?.toDate().toLocaleString('ru-RU')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 justify-end">
                        <Link
                          to={`/admin/artifacts/${g.id}`}
                          className="p-1.5 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => setDeleteTarget(g)}
                          className="p-1.5 text-gray-500 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {paged.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-gray-400">
                      Артефактілер жоқ
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center gap-2 justify-end text-sm">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-gray-600 dark:text-gray-400">
                {page + 1} / {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page === totalPages - 1}
                className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}

      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        title={deleteTarget?.title ?? ''}
        description="Артефактінің барлық нұсқалары мен суреті жойылады"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        isDeleting={deleting}
      />
    </div>
  );
}
