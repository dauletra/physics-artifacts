import { useState } from 'react';
import { Plus, Trash2, Check, X, Pencil } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTags } from '../../hooks/useTags';
import { tagService } from '../../services/tagService';
import { DeleteConfirmModal } from '../../components/modals/DeleteConfirmModal';
import { Spinner } from '../../components/ui/Spinner';
import type { Tag } from '../../types/artifact.types';

export function TagsPage() {
  const { tags, loading, reload } = useTags();
  const [deleteTarget, setDeleteTarget] = useState<Tag | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newOrder, setNewOrder] = useState(0);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState('');

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newLabel.trim()) { toast.error('Атауын енгізіңіз'); return; }
    setSaving(true);
    try {
      await tagService.create({ label: newLabel.trim(), order: newOrder });
      toast.success('Тег жасалды');
      setNewLabel('');
      setNewOrder(0);
      reload();
    } catch {
      toast.error('Жасау қатесі');
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveEdit(id: string) {
    if (!editLabel.trim()) return;
    try {
      await tagService.update(id, { label: editLabel.trim() });
      toast.success('Сақталды');
      setEditingId(null);
      reload();
    } catch {
      toast.error('Сақтау қатесі');
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await tagService.delete(deleteTarget.id);
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
    <div className="p-6 space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Тегтер</h2>

      {/* Create form */}
      <form onSubmit={handleCreate} className="flex items-center gap-2 max-w-md">
        <input
          type="text"
          value={newLabel}
          onChange={e => setNewLabel(e.target.value)}
          placeholder="Тег атауы"
          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="number"
          value={newOrder}
          onChange={e => setNewOrder(Number(e.target.value))}
          placeholder="Порядок"
          className="w-20 px-2 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100"
        />
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-70 text-sm transition-colors"
        >
          {saving ? <Spinner className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          Добавить
        </button>
      </form>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-12"><Spinner /></div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden max-w-lg">
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {tags.map(tag => (
              <div key={tag.id} className="flex items-center gap-3 px-4 py-3">
                {editingId === tag.id ? (
                  <>
                    <input
                      type="text"
                      value={editLabel}
                      onChange={e => setEditLabel(e.target.value)}
                      className="flex-1 px-2 py-1 border border-blue-400 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none"
                      autoFocus
                    />
                    <button
                      onClick={() => handleSaveEdit(tag.id)}
                      className="p-1 text-green-500 hover:text-green-600"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="p-1 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <>
                    <span className="flex-1 text-sm text-gray-900 dark:text-gray-100">{tag.label}</span>
                    <span className="text-xs text-gray-400">реттілік: {tag.order}</span>
                    <button
                      onClick={() => { setEditingId(tag.id); setEditLabel(tag.label); }}
                      className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(tag)}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
              </div>
            ))}
            {tags.length === 0 && (
              <div className="px-4 py-8 text-center text-gray-400 text-sm">Тегтер жоқ</div>
            )}
          </div>
        </div>
      )}

      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        title={deleteTarget?.label ?? ''}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        isDeleting={deleting}
      />
    </div>
  );
}
