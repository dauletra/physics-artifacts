import { ExternalLink, X } from 'lucide-react';
import { getEmbedUrl, getViewUrl } from '../../utils/artifactUrl';

interface ArtifactPreviewModalProps {
  isOpen: boolean;
  embedUrl: string;
  requiresAuth?: boolean;
  onClose(): void;
}

export function ArtifactPreviewModal({ isOpen, embedUrl, requiresAuth, onClose }: ArtifactPreviewModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Артефактіні алдын ала қарау</span>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        {requiresAuth ? (
          <div className="flex flex-col items-center justify-center flex-1 gap-5 p-8 text-center">
            <div className="text-4xl">🤖</div>
            <div>
              <h3 className="text-lg font-semibold mb-1 text-gray-800 dark:text-gray-200">
                Бұл артефакт Claude аккаунтты қажет
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                iframe-да ашылмайды. Claude-та тікелей ашыңыз.
              </p>
            </div>
            <a
              href={getViewUrl(embedUrl)}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Claude-та ашу
            </a>
          </div>
        ) : (
          <iframe
            src={getEmbedUrl(embedUrl)}
            className="flex-1 w-full rounded-b-xl"
            allow="fullscreen; microphone; camera; autoplay; clipboard-read; clipboard-write"
          />
        )}
      </div>
    </div>
  );
}
