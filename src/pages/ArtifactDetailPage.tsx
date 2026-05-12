import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Copy, ExternalLink, Pencil } from 'lucide-react';
import toast from 'react-hot-toast';
import { artifactGroupService } from '../services/artifactGroupService';
import { useArtifacts } from '../hooks/useArtifacts';
import type { ArtifactGroup } from '../types/artifact.types';
import { getEmbedUrl, getViewUrl } from '../utils/artifactUrl';
import { Spinner } from '../components/ui/Spinner';
import { ErrorState } from '../components/ui/ErrorState';
import { useAuth } from '../context/AuthContext';

export function ArtifactDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const [group, setGroup] = useState<ArtifactGroup | null>(null);
  const [groupLoading, setGroupLoading] = useState(true);
  const [groupError, setGroupError] = useState(false);
  const [iframeLoading, setIframeLoading] = useState(true);
  const [activeIdx, setActiveIdx] = useState(0);

  const { artifacts, loading: artifactsLoading } = useArtifacts(id ?? '');

  useEffect(() => {
    if (!id) return;
    artifactGroupService
      .getById(id)
      .then(g => {
        if (!g) setGroupError(true);
        else setGroup(g);
      })
      .catch(() => setGroupError(true))
      .finally(() => setGroupLoading(false));
  }, [id]);

  const currentArtifact = artifacts[activeIdx];
  const hasVariants = artifacts.length > 1;
  const headerH = 56;
  const tabsH = hasVariants ? 44 : 0;

  function copyLink() {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Сілтеме көшірілді');
  }

  function goBack() {
    if (window.history.length > 1) navigate(-1);
    else navigate('/');
  }

  if (groupLoading || artifactsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (groupError || !group) {
    return <ErrorState message="Артефакт табылмады" onRetry={() => navigate('/')} />;
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden">
      {/* Header */}
      <header
        className="shrink-0 flex items-center gap-2 px-3 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700"
        style={{ height: headerH }}
      >
        <button
          onClick={goBack}
          className="flex items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm hidden sm:inline">Артқа</span>
        </button>

        <div className="flex-1 min-w-0 mx-2">
          <h1 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate leading-tight">
            {group.title}
          </h1>
          {(group.createdByName || group.createdBy) && (
            <div className="text-xs text-gray-500 dark:text-gray-400 truncate leading-tight">
              {group.createdBy ? (
                <Link
                  to={`/?author=${encodeURIComponent(group.createdBy)}`}
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  title={group.createdBy}
                >
                  {group.createdByName || group.createdBy.split('@')[0]}
                </Link>
              ) : (
                <span>{group.createdByName}</span>
              )}
              <span className="mx-1.5 text-gray-300 dark:text-gray-600">·</span>
              <span>
                {group.createdAt.toDate().toLocaleDateString('kk-KZ', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isAdmin && (
            <Link
              to={`/admin/artifacts/${id}`}
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
              title="Өңдеу"
            >
              <Pencil className="w-4 h-4" />
            </Link>
          )}
          <button
            onClick={copyLink}
            className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            title="Сілтемені көшіру"
          >
            <Copy className="w-4 h-4" />
          </button>
          {currentArtifact && (
            <a
              href={getViewUrl(currentArtifact.embedUrl)}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
              title="Жаңа қойындыда ашу"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
      </header>

      {/* Tabs */}
      {hasVariants && (
        <div
          className="shrink-0 flex items-center gap-1 px-3 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 overflow-x-auto scrollbar-hide"
          style={{ height: tabsH }}
        >
          {artifacts.map((a, i) => (
            <button
              key={a.id}
              onClick={() => { setActiveIdx(i); setIframeLoading(true); }}
              className={`px-3 py-1.5 text-sm rounded whitespace-nowrap transition-colors ${
                activeIdx === i
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              {a.variantLabel}
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      <div className="relative flex-1 overflow-hidden" style={{ height: `calc(100vh - ${headerH + tabsH}px)` }}>
        {currentArtifact?.requiresAuth ? (
          <div className="flex flex-col items-center justify-center h-full gap-6 p-8 text-center">
            <div className="text-5xl">🤖</div>
            <div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-200">
                Бұл артефакт Claude аккаунтты қажет
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm max-w-sm">
                Артефакт Claude AI мүмкіндіктерін пайдаланады. Жұмыс жасау үшін Claude аккаунтыңызбен кіріңіз.
              </p>
            </div>
            <a
              href={getViewUrl(currentArtifact.embedUrl)}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Claude-та ашу
            </a>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Аккаунт жоқ па?{' '}
              <a
                href="https://claude.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-gray-600 dark:hover:text-gray-300"
              >
                Тегін тіркелу →
              </a>
            </p>
          </div>
        ) : (
          <>
            {iframeLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-50 dark:bg-gray-950 z-10">
                <Spinner />
              </div>
            )}
            {currentArtifact ? (
              <iframe
                key={currentArtifact.id}
                src={getEmbedUrl(currentArtifact.embedUrl)}
                className="w-full h-full border-0"
                allow="fullscreen; microphone; camera; autoplay; clipboard-read; clipboard-write"
                onLoad={() => setIframeLoading(false)}
                onError={() => setIframeLoading(false)}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-500">
                Нұсқалар жоқ
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
