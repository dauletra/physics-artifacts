import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Plus, Trash2, ShieldCheck, Shield, Pencil, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { useAdmins } from '../../hooks/useAdmins';
import { adminService } from '../../services/adminService';
import { DeleteConfirmModal } from '../../components/modals/DeleteConfirmModal';
import { Spinner } from '../../components/ui/Spinner';
import type { Admin } from '../../types/artifact.types';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function AdminsPage() {
  const { user, isSuperAdmin } = useAuth();
  const { admins, loading, reload } = useAdmins();
  const [newEmail, setNewEmail] = useState('');
  const [newPublicName, setNewPublicName] = useState('');
  const [newIsSuper, setNewIsSuper] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Admin | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [editingEmail, setEditingEmail] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  if (!isSuperAdmin) return <Navigate to="/admin" replace />;

  const superCount = admins.filter(a => a.isSuper).length;

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const email = newEmail.trim().toLowerCase();
    if (!EMAIL_RE.test(email)) {
      toast.error('Дұрыс email енгізіңіз');
      return;
    }
    if (admins.some(a => a.email === email)) {
      toast.error('Бұл админ бар');
      return;
    }
    setSaving(true);
    try {
      await adminService.add(email, newIsSuper, user?.email ?? '', newPublicName);
      toast.success('Әкімші қосылды');
      setNewEmail('');
      setNewPublicName('');
      setNewIsSuper(false);
      reload();
    } catch {
      toast.error('Қосу қатесі');
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveName(email: string) {
    try {
      await adminService.updatePublicName(email, editName);
      toast.success('Сақталды');
      setEditingEmail(null);
      reload();
    } catch {
      toast.error('Сақтау қатесі');
    }
  }

  function requestDelete(admin: Admin) {
    if (admin.email === user?.email) {
      toast.error('Өзіңізді жою мүмкін емес');
      return;
    }
    if (admin.isSuper && superCount <= 1) {
      toast.error('Соңғы бас әкімшіні жою мүмкін емес');
      return;
    }
    setDeleteTarget(admin);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await adminService.remove(deleteTarget.email);
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
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Әкімшілер</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Тек бас әкімшілер басқа әкімшілерді қоса/жоя алады. «Көрсетілетін аты» витринада автор ретінде көрінеді.
        </p>
      </div>

      <form onSubmit={handleCreate} className="space-y-2 max-w-2xl">
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="email"
            value={newEmail}
            onChange={e => setNewEmail(e.target.value)}
            placeholder="user@example.com"
            className="flex-1 min-w-[220px] px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            value={newPublicName}
            onChange={e => setNewPublicName(e.target.value)}
            placeholder="Көрсетілетін аты"
            className="flex-1 min-w-[180px] px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 select-none cursor-pointer">
            <input
              type="checkbox"
              checked={newIsSuper}
              onChange={e => setNewIsSuper(e.target.checked)}
              className="accent-blue-600"
            />
            Бас әкімші
          </label>
          <button
            type="submit"
            disabled={saving}
            className="ml-auto flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-70 text-sm transition-colors"
          >
            {saving ? <Spinner className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
            Қосу
          </button>
        </div>
      </form>

      {loading ? (
        <div className="flex justify-center py-12"><Spinner /></div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden max-w-2xl">
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {admins.map(admin => {
              const isSelf = admin.email === user?.email;
              const isLastSuper = admin.isSuper && superCount <= 1;
              const removeDisabled = isSelf || isLastSuper;
              const isEditing = editingEmail === admin.email;
              return (
                <div key={admin.email} className="flex items-center gap-3 px-4 py-3">
                  {admin.isSuper ? (
                    <ShieldCheck className="w-4 h-4 text-blue-500 shrink-0" />
                  ) : (
                    <Shield className="w-4 h-4 text-gray-400 shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    {isEditing ? (
                      <input
                        type="text"
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        placeholder="Көрсетілетін аты"
                        autoFocus
                        className="w-full px-2 py-1 border border-blue-400 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none"
                      />
                    ) : (
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {admin.publicName || <span className="text-gray-400 italic">аты көрсетілмеген</span>}
                        {isSelf && <span className="ml-2 text-xs text-gray-400 not-italic">(сіз)</span>}
                      </div>
                    )}
                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{admin.email}</div>
                  </div>
                  <span className="text-xs text-gray-400 shrink-0">
                    {admin.isSuper ? 'бас әкімші' : 'әкімші'}
                  </span>
                  {isEditing ? (
                    <>
                      <button
                        onClick={() => handleSaveName(admin.email)}
                        className="p-1 text-green-500 hover:text-green-600"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setEditingEmail(null)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => { setEditingEmail(admin.email); setEditName(admin.publicName ?? ''); }}
                        title="Көрсетілетін атын өзгерту"
                        className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => requestDelete(admin)}
                        disabled={removeDisabled}
                        title={isSelf ? 'Өзіңізді жою мүмкін емес' : isLastSuper ? 'Соңғы бас әкімшіні жою мүмкін емес' : 'Жою'}
                        className="p-1 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-30 disabled:hover:text-gray-400 disabled:cursor-not-allowed"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>
              );
            })}
            {admins.length === 0 && (
              <div className="px-4 py-8 text-center text-gray-400 text-sm">Әкімшілер жоқ</div>
            )}
          </div>
        </div>
      )}

      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        title={deleteTarget?.email ?? ''}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        isDeleting={deleting}
      />
    </div>
  );
}
