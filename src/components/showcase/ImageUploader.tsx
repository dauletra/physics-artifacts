import { useRef, useState, useCallback } from 'react';
import { Upload, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { storageService } from '../../services/storageService';
import { ImageCropModal } from './ImageCropModal';

interface ImageUploaderProps {
  onUpload(url: string, storagePath: string): void;
  currentImageUrl?: string;
  onRemove?(): void;
}

export function ImageUploader({ onUpload, currentImageUrl, onRemove }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [cropFile, setCropFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Тек суреттер рұқсат етілген');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Файл тым үлкен (максимум 10 МБ)');
      return;
    }
    setCropFile(file);
  }, []);

  const handleCropConfirm = useCallback(async (blob: Blob) => {
    setCropFile(null);
    setUploading(true);
    setProgress(0);
    try {
      const { url, path } = await storageService.upload(blob, setProgress);
      onUpload(url, path);
    } catch (e) {
      toast.error('Жүктеу қатесі: ' + (e instanceof Error ? e.message : String(e)));
    } finally {
      setUploading(false);
    }
  }, [onUpload]);

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function onPaste(e: React.ClipboardEvent) {
    const file = Array.from(e.clipboardData.items)
      .find(i => i.kind === 'file')
      ?.getAsFile();
    if (file) handleFile(file);
  }

  if (currentImageUrl) {
    return (
      <div className="relative w-full max-w-xs">
        <img src={currentImageUrl} alt="Thumbnail" className="w-full h-32 object-cover rounded-lg" />
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="absolute top-1 right-1 p-1 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  }

  return (
    <>
      {cropFile && (
        <ImageCropModal
          file={cropFile}
          onConfirm={handleCropConfirm}
          onCancel={() => { setCropFile(null); if (inputRef.current) inputRef.current.value = ''; }}
        />
      )}

      <div
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
          dragOver
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'
        }`}
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onPaste={onPaste}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
        />
        {uploading ? (
          <div className="space-y-2">
            <p className="text-sm text-gray-500">Жүктелуде... {progress}%</p>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
              <div
                className="bg-blue-600 h-1.5 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-1">
            <Upload className="w-8 h-8 text-gray-400 mx-auto" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Сүйреңіз, қойыңыз (Ctrl+V) немесе таңдау үшін басыңыз
            </p>
            <p className="text-xs text-gray-400">image/*, 10 МБ дейін</p>
          </div>
        )}
      </div>
    </>
  );
}
