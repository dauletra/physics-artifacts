import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import type { ArtifactGroup, Artifact } from '../../types/artifact.types';
import { artifactGroupService } from '../../services/artifactGroupService';
import { artifactService } from '../../services/artifactService';
import { useSections } from '../../hooks/useSections';
import { useTags } from '../../hooks/useTags';
import { GRADES, QUARTERS } from '../../config/constants';
import { normalizeArtifactUrl, isValidArtifactUrl } from '../../utils/artifactUrl';
import { ImageUploader } from '../showcase/ImageUploader';
import { ArtifactPreviewModal } from '../modals/ArtifactPreviewModal';
import { Spinner } from '../ui/Spinner';

interface VariantForm {
  id?: string;
  variantLabel: string;
  embedUrl: string;
  description: string;
  order: number;
}

interface ArtifactEditFormProps {
  initialGroupId?: string;
  onSaveRedirect: string;
}

const MAX_VARIANTS = 5;

export function ArtifactEditForm({ initialGroupId, onSaveRedirect }: ArtifactEditFormProps) {
  const navigate = useNavigate();
  const { sections } = useSections();
  const { tags } = useTags();

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!!initialGroupId);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedGrades, setSelectedGrades] = useState<number[]>([]);
  const [quarter, setQuarter] = useState<number | null>(null);
  const [sectionId, setSectionId] = useState<string | null>(null);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [thumbnail, setThumbnail] = useState<string | undefined>();
  const [thumbnailPath, setThumbnailPath] = useState<string | undefined>();
  const [isPublic, setIsPublic] = useState(false);
  const [usesAI, setUsesAI] = useState(false);
  const [variants, setVariants] = useState<VariantForm[]>([
    { variantLabel: '', embedUrl: '', description: '', order: 0 },
  ]);

  useEffect(() => {
    if (!initialGroupId) return;
    Promise.all([
      artifactGroupService.getById(initialGroupId),
      artifactService.getByGroupId(initialGroupId),
    ]).then(([group, arts]) => {
      if (!group) { toast.error('Артефакт табылмады'); navigate(onSaveRedirect); return; }
      setTitle(group.title);
      setDescription(group.description ?? '');
      setSelectedGrades(group.grade ?? []);
      setQuarter(group.quarter ?? null);
      setSectionId(group.sectionId ?? null);
      setSelectedTagIds(group.tagIds);
      setThumbnail(group.thumbnail);
      setThumbnailPath(group.thumbnailPath);
      setIsPublic(group.isPublic);
      setUsesAI(group.usesAI ?? false);
      setVariants(
        arts.length > 0
          ? arts.map(a => ({ id: a.id, variantLabel: a.variantLabel, embedUrl: a.embedUrl, description: a.description ?? '', order: a.order }))
          : [{ variantLabel: '', embedUrl: '', description: '', order: 0 }]
      );
    }).catch(() => toast.error('Жүктеу қатесі')).finally(() => setLoading(false));
  }, [initialGroupId, navigate, onSaveRedirect]);

  const filteredSections = sections.filter(
    s => selectedGrades.includes(s.grade) && s.quarter === quarter
  );

  function toggleGrade(g: number) {
    setSelectedGrades(prev =>
      prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]
    );
  }

  function toggleTag(id: string) {
    setSelectedTagIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  }

  function addVariant() {
    if (variants.length >= MAX_VARIANTS) return;
    setVariants(prev => [...prev, { variantLabel: '', embedUrl: '', description: '', order: prev.length }]);
  }

  function removeVariant(idx: number) {
    setVariants(prev => prev.filter((_, i) => i !== idx).map((v, i) => ({ ...v, order: i })));
  }

  function updateVariant(idx: number, field: keyof VariantForm, value: string) {
    setVariants(prev => prev.map((v, i) => i === idx ? { ...v, [field]: value } : v));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) { toast.error('Атауын енгізіңіз'); return; }
    if (variants.some(v => !v.variantLabel.trim())) { toast.error('Әр нұсқаның белгісін толтырыңыз'); return; }
    if (variants.some(v => !isValidArtifactUrl(v.embedUrl))) { toast.error('Артефакттың URL-і дұрыс емес'); return; }

    setSaving(true);
    try {
      const normalizedVariants = variants.map((v, i) => ({
        ...v,
        embedUrl: normalizeArtifactUrl(v.embedUrl),
        order: i,
      }));

      const groupData: Omit<ArtifactGroup, 'id' | 'createdAt' | 'updatedAt'> = {
        title: title.trim(),
        description: description.trim() || undefined,
        thumbnail,
        thumbnailPath,
        isPublic,
        usesAI,
        variantCount: normalizedVariants.length,
        variantLabels: normalizedVariants.map(v => v.variantLabel),
        grade: selectedGrades,
        quarter: quarter ?? undefined,
        sectionId: sectionId ?? undefined,
        tagIds: selectedTagIds,
      };

      if (initialGroupId) {
        await artifactGroupService.update(initialGroupId, groupData);

        // Get existing artifacts to diff
        const existing = await artifactService.getByGroupId(initialGroupId);
        const existingIds = new Set(existing.map(a => a.id));
        const keepIds = new Set(normalizedVariants.filter(v => v.id).map(v => v.id!));

        // Delete removed variants
        await Promise.all(
          existing.filter(a => !keepIds.has(a.id)).map(a => artifactService.delete(a.id))
        );

        // Update/create
        await Promise.all(
          normalizedVariants.map(v => {
            const data: Omit<Artifact, 'id' | 'createdAt' | 'updatedAt'> = {
              groupId: initialGroupId,
              variantLabel: v.variantLabel,
              embedUrl: v.embedUrl,
              description: v.description || undefined,
              order: v.order,
            };
            if (v.id && existingIds.has(v.id)) {
              return artifactService.update(v.id, data);
            }
            return artifactService.create(data);
          })
        );
      } else {
        const groupId = await artifactGroupService.create(groupData);
        await Promise.all(
          normalizedVariants.map(v =>
            artifactService.create({
              groupId,
              variantLabel: v.variantLabel,
              embedUrl: v.embedUrl,
              description: v.description || undefined,
              order: v.order,
            })
          )
        );
      }

      toast.success(initialGroupId ? 'Сақталды' : 'Артефакт жасалды');
      navigate(onSaveRedirect);
    } catch (e) {
      toast.error('Сақтау қатесі: ' + (e instanceof Error ? e.message : String(e)));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Spinner /></div>;
  }

  return (
    <form onSubmit={handleSave} className="max-w-2xl mx-auto p-6 space-y-6">
      {/* Title */}
      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Атауы *</label>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Артефакт атауы"
        />
      </div>

      {/* Description */}
      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Сипаттама</label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      {/* Grades */}
      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Сыныптар</label>
        <div className="flex gap-2 flex-wrap">
          {GRADES.map(g => (
            <button
              key={g}
              type="button"
              onClick={() => toggleGrade(g)}
              className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                selectedGrades.includes(g)
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-blue-400'
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Quarter */}
      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Тоқсан</label>
        <div className="flex gap-2">
          {QUARTERS.map(q => (
            <button
              key={q}
              type="button"
              onClick={() => { setQuarter(quarter === q ? null : q); setSectionId(null); }}
              className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                quarter === q
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-blue-400'
              }`}
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Section */}
      {filteredSections.length > 0 && (
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Бөлім</label>
          <select
            value={sectionId ?? ''}
            onChange={e => setSectionId(e.target.value || null)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">— бөлімсіз —</option>
            {filteredSections.map(s => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>
        </div>
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Тегтер</label>
          <div className="flex gap-2 flex-wrap">
            {tags.map(tag => (
              <button
                key={tag.id}
                type="button"
                onClick={() => toggleTag(tag.id)}
                className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                  selectedTagIds.includes(tag.id)
                    ? 'bg-violet-600 border-violet-600 text-white'
                    : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-violet-400'
                }`}
              >
                {tag.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Thumbnail */}
      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Мұқаба</label>
        <ImageUploader
          currentImageUrl={thumbnail}
          onUpload={(url, path) => { setThumbnail(url); setThumbnailPath(path); }}
          onRemove={() => { setThumbnail(undefined); setThumbnailPath(undefined); }}
        />
      </div>

      {/* Checkboxes */}
      <div className="flex gap-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isPublic}
            onChange={e => setIsPublic(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">Жариялы</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={usesAI}
            onChange={e => setUsesAI(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">AI powered</span>
        </label>
      </div>

      {/* Variants */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Нұсқалар ({variants.length}/{MAX_VARIANTS})
          </label>
          {variants.length < MAX_VARIANTS && (
            <button
              type="button"
              onClick={addVariant}
              className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
            >
              <Plus className="w-4 h-4" />
              Қосу
            </button>
          )}
        </div>

        {variants.map((v, idx) => (
          <div key={idx} className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500">Нұсқа {idx + 1}</span>
              {variants.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeVariant(idx)}
                  className="text-red-500 hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
            <input
              type="text"
              value={v.variantLabel}
              onChange={e => updateVariant(idx, 'variantLabel', e.target.value)}
              placeholder="Белгі (мыс. «Тест»)"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <div className="flex gap-2">
              <input
                type="text"
                value={v.embedUrl}
                onChange={e => updateVariant(idx, 'embedUrl', e.target.value)}
                placeholder="UUID немесе Claude артефактінің URL-і"
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              {v.embedUrl && (
                <button
                  type="button"
                  onClick={() => setPreviewUrl(v.embedUrl)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  title="Алдын ала қарау"
                >
                  <Eye className="w-4 h-4 text-gray-500" />
                </button>
              )}
            </div>
            <input
              type="text"
              value={v.description}
              onChange={e => updateVariant(idx, 'description', e.target.value)}
              placeholder="Нұсқа сипаттамасы"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
        ))}
      </div>

      {/* Submit */}
      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={() => navigate(onSaveRedirect)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          Болдырмау
        </button>
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-70 transition-colors flex items-center gap-2"
        >
          {saving && <Spinner className="w-4 h-4" />}
          {initialGroupId ? 'Сақтау' : 'Жасау'}
        </button>
      </div>

      {previewUrl && (
        <ArtifactPreviewModal
          isOpen={true}
          embedUrl={previewUrl}
          onClose={() => setPreviewUrl(null)}
        />
      )}
    </form>
  );
}
