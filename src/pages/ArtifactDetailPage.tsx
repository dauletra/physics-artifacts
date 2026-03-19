import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Copy, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import { artifactGroupService } from '../services/artifactGroupService';
import { useArtifacts } from '../hooks/useArtifacts';
import type { ArtifactGroup } from '../types/artifact.types';
import { getEmbedUrl, getViewUrl } from '../utils/artifactUrl';
import { Spinner } from '../components/ui/Spinner';
import { ErrorState } from '../components/ui/ErrorState';

export function ArtifactDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

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
    navigate(-1);
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
    <div className="flex flex-col h-screen bg-gray-950 overflow-hidden">
      {/* Header */}
      <header
        className="shrink-0 flex items-center gap-2 px-3 bg-gray-900 border-b border-gray-700"
        style={{ height: headerH }}
      >
        <button
          onClick={goBack}
          className="flex items-center gap-1 text-gray-400 hover:text-gray-200 transition-colors shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm hidden sm:inline">Артқа</span>
        </button>

        <h1 className="flex-1 text-sm font-medium text-gray-100 truncate mx-2">
          {group.title}
        </h1>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={copyLink}
            className="p-2 text-gray-400 hover:text-gray-200 transition-colors"
            title="Сілтемені көшіру"
          >
            <Copy className="w-4 h-4" />
          </button>
          {currentArtifact && (
            <a
              href={getViewUrl(currentArtifact.embedUrl)}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-gray-400 hover:text-gray-200 transition-colors"
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
          className="shrink-0 flex items-center gap-1 px-3 bg-gray-900 border-b border-gray-700 overflow-x-auto scrollbar-hide"
          style={{ height: tabsH }}
        >
          {artifacts.map((a, i) => (
            <button
              key={a.id}
              onClick={() => { setActiveIdx(i); setIframeLoading(true); }}
              className={`px-3 py-1.5 text-sm rounded whitespace-nowrap transition-colors ${
                activeIdx === i
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              {a.variantLabel}
            </button>
          ))}
        </div>
      )}

      {/* iframe */}
      <div className="relative flex-1 overflow-hidden" style={{ height: `calc(100vh - ${headerH + tabsH}px)` }}>
        {iframeLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-950 z-10">
            <Spinner className="text-gray-400" />
          </div>
        )}
        {currentArtifact ? (
          <iframe
            key={currentArtifact.id}
            src={getEmbedUrl(currentArtifact.embedUrl)}
            className="w-full h-full border-0"
            allow="fullscreen"
            onLoad={() => setIframeLoading(false)}
            onError={() => setIframeLoading(false)}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Нұсқалар жоқ
          </div>
        )}
      </div>
    </div>
  );
}
