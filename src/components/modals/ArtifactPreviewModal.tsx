import { X } from 'lucide-react';
import { getEmbedUrl } from '../../utils/artifactUrl';

interface ArtifactPreviewModalProps {
  isOpen: boolean;
  embedUrl: string;
  onClose(): void;
}

export function ArtifactPreviewModal({ isOpen, embedUrl, onClose }: ArtifactPreviewModalProps) {
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
        <iframe
          src={getEmbedUrl(embedUrl)}
          className="flex-1 w-full rounded-b-xl"
          allow="fullscreen; clipboard-write; clipboard-read"
        />
      </div>
    </div>
  );
}
