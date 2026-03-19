import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useSections } from '../../hooks/useSections';
import { sectionService } from '../../services/sectionService';
import { DeleteConfirmModal } from '../../components/modals/DeleteConfirmModal';
import { Spinner } from '../../components/ui/Spinner';
import { GRADES, QUARTERS } from '../../config/constants';
import type { Section } from '../../types/artifact.types';

export function SectionsPage() {
  const { sections, loading, reload } = useSections();
  const [deleteTarget, setDeleteTarget] = useState<Section | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [newForm, setNewForm] = useState({ grade: 7, quarter: 1, label: '', order: 0 });
  const [saving, setSaving] = useState(false);

  const grouped = GRADES.flatMap(grade =>
    QUARTERS.map(quarter => ({
      grade,
      quarter,
      items: sections.filter(s => s.grade === grade && s.quarter === quarter),
    }))
  ).filter(g => g.items.length > 0);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newForm.label.trim()) { toast.error('Атауын енгізіңіз'); return; }
    setSaving(true);
    try {
      await sectionService.create({ ...newForm, label: newForm.label.trim() });
      toast.success('Бөлім жасалды');
      setNewForm({ grade: 7, quarter: 1, label: '', order: 0 });
      reload();
    } catch {
      toast.error('Жасау қатесі');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await sectionService.delete(deleteTarget.id);
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
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Бағдарлама бөлімдері</h2>

      {/* Create form */}
      <form onSubmit={handleCreate} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-3 max-w-lg">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Бөлім қосу</h3>
        <div className="flex gap-3">
          <select
            value={newForm.grade}
            onChange={e => setNewForm(f => ({ ...f, grade: Number(e.target.value) }))}
            className="px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-gray-100"
          >
            {GRADES.map(g => <option key={g} value={g}>{g} сынып</option>)}
          </select>
          <select
            value={newForm.quarter}
            onChange={e => setNewForm(f => ({ ...f, quarter: Number(e.target.value) }))}
            className="px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-gray-100"
          >
            {QUARTERS.map(q => <option key={q} value={q}>{q} тоқсан</option>)}
          </select>
          <input
            type="number"
            value={newForm.order}
            onChange={e => setNewForm(f => ({ ...f, order: Number(e.target.value) }))}
            placeholder="Порядок"
            className="w-20 px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-gray-100"
          />
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newForm.label}
            onChange={e => setNewForm(f => ({ ...f, label: e.target.value }))}
            placeholder="Бөлім атауы"
            className="flex-1 px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-70 text-sm transition-colors"
          >
            {saving ? <Spinner className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
            Қосу
          </button>
        </div>
      </form>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-12"><Spinner /></div>
      ) : (
        <div className="space-y-4 max-w-2xl">
          {grouped.map(({ grade, quarter, items }) => (
            <div key={`${grade}-${quarter}`} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="px-4 py-2 bg-gray-50 dark:bg-gray-700/50 text-sm font-medium text-gray-600 dark:text-gray-400">
                {grade} сынып, {quarter} тоқсан
              </div>
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {items.map(s => (
                  <div key={s.id} className="flex items-center gap-3 px-4 py-2.5">
                    <span className="flex-1 text-sm text-gray-900 dark:text-gray-100">{s.label}</span>
                    <span className="text-xs text-gray-400">реттілік: {s.order}</span>
                    <button
                      onClick={() => setDeleteTarget(s)}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {grouped.length === 0 && (
            <p className="text-gray-500 dark:text-gray-400 text-sm">Бөлімдер жоқ</p>
          )}
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
