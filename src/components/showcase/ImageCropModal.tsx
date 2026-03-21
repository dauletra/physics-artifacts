import { useEffect, useRef, useState, useCallback } from 'react';
import { THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT, THUMBNAIL_RATIO } from '../../config/constants';

interface Crop { x: number; y: number; w: number; h: number }
type Handle = 'nw' | 'ne' | 'sw' | 'se';
type DragState = { type: 'move' | Handle; startX: number; startY: number; startCrop: Crop }

interface Props {
  file: File;
  onConfirm(blob: Blob): void;
  onCancel(): void;
}

const HANDLE_SIZE = 12;

export function ImageCropModal({ file, onConfirm, onCancel }: Props) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [crop, setCrop] = useState<Crop>({ x: 0, y: 0, w: 0, h: 0 });
  const [objectUrl, setObjectUrl] = useState('');
  const dragRef = useRef<DragState | null>(null);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setObjectUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const initCrop = useCallback(() => {
    const img = imgRef.current;
    if (!img) return;
    const { width: dw, height: dh } = img.getBoundingClientRect();
    if (!dw || !dh) return;
    let w: number, h: number;
    if (dw / dh > THUMBNAIL_RATIO) {
      h = dh; w = h * THUMBNAIL_RATIO;
    } else {
      w = dw; h = w / THUMBNAIL_RATIO;
    }
    setCrop({ x: (dw - w) / 2, y: (dh - h) / 2, w, h });
  }, []);

  useEffect(() => {
    if (imgLoaded) initCrop();
  }, [imgLoaded, initCrop]);

  function clampCrop(c: Crop, dw: number, dh: number): Crop {
    let { x, y, w, h } = c;
    w = Math.max(40, Math.min(w, dw));
    h = w / THUMBNAIL_RATIO;
    if (h > dh) { h = dh; w = h * THUMBNAIL_RATIO; }
    x = Math.max(0, Math.min(x, dw - w));
    y = Math.max(0, Math.min(y, dh - h));
    return { x, y, w, h };
  }

  const onMouseDown = useCallback((e: React.MouseEvent, type: 'move' | Handle) => {
    e.preventDefault();
    e.stopPropagation();
    dragRef.current = { type, startX: e.clientX, startY: e.clientY, startCrop: crop };
  }, [crop]);

  useEffect(() => {
    function onMove(e: MouseEvent) {
      const drag = dragRef.current;
      if (!drag) return;
      const img = imgRef.current;
      if (!img) return;
      const { width: dw, height: dh } = img.getBoundingClientRect();
      const dx = e.clientX - drag.startX;
      const dy = e.clientY - drag.startY;
      const { x: ox, y: oy, w: ow, h: oh } = drag.startCrop;

      if (drag.type === 'move') {
        setCrop(clampCrop({ x: ox + dx, y: oy + dy, w: ow, h: oh }, dw, dh));
        return;
      }

      const x2 = ox + ow, y2 = oy + oh;
      let nx: number, ny: number, nw: number, nh: number;

      if (drag.type === 'se') {
        nw = Math.max(40, ow + dx); nh = nw / THUMBNAIL_RATIO; nx = ox; ny = oy;
      } else if (drag.type === 'sw') {
        nw = Math.max(40, ow - dx); nh = nw / THUMBNAIL_RATIO; nx = x2 - nw; ny = oy;
      } else if (drag.type === 'ne') {
        nw = Math.max(40, ow + dx); nh = nw / THUMBNAIL_RATIO; nx = ox; ny = y2 - nh;
      } else {
        nw = Math.max(40, ow - dx); nh = nw / THUMBNAIL_RATIO; nx = x2 - nw; ny = y2 - nh;
      }

      setCrop(clampCrop({ x: nx, y: ny, w: nw, h: nh }, dw, dh));
    }

    function onUp() { dragRef.current = null; }

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, []);

  function handleConfirm() {
    const img = imgRef.current;
    if (!img) return;
    const rect = img.getBoundingClientRect();
    const scaleX = img.naturalWidth / rect.width;
    const scaleY = img.naturalHeight / rect.height;
    const canvas = document.createElement('canvas');
    canvas.width = THUMBNAIL_WIDTH;
    canvas.height = THUMBNAIL_HEIGHT;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(
      img,
      crop.x * scaleX, crop.y * scaleY,
      crop.w * scaleX, crop.h * scaleY,
      0, 0, THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT
    );
    canvas.toBlob(blob => { if (blob) onConfirm(blob); }, 'image/jpeg', 0.85);
  }

  const { x, y, w, h } = crop;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
      onClick={onCancel}
    >
      <div
        className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl p-4 flex flex-col gap-4 max-w-3xl w-full mx-4"
        onClick={e => e.stopPropagation()}
      >
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Кесу аймағын таңдаңыз (16:9)
        </p>

        {/* Image + overlay wrapper — overlay is relative to img */}
        <div className="flex justify-center bg-gray-100 dark:bg-gray-800 rounded-lg select-none">
          <div className="relative">
            <img
              ref={imgRef}
              src={objectUrl || undefined}
              alt=""
              className="block max-w-full object-contain"
              style={{ maxHeight: '65vh' }}
              onLoad={() => setImgLoaded(true)}
              draggable={false}
            />

            {imgLoaded && w > 0 && (
              <div className="absolute inset-0 pointer-events-none">
                {/* 4 darkening rects outside crop box */}
                {/* top */}
                <div className="absolute bg-black/50" style={{ left: 0, top: 0, right: 0, height: y }} />
                {/* bottom */}
                <div className="absolute bg-black/50" style={{ left: 0, top: y + h, right: 0, bottom: 0 }} />
                {/* left */}
                <div className="absolute bg-black/50" style={{ left: 0, top: y, width: x, height: h }} />
                {/* right */}
                <div className="absolute bg-black/50" style={{ left: x + w, top: y, right: 0, height: h }} />

                {/* Crop box */}
                <div
                  className="absolute pointer-events-auto cursor-move"
                  style={{ left: x, top: y, width: w, height: h, border: '2px solid white' }}
                  onMouseDown={e => onMouseDown(e, 'move')}
                >
                  {/* Rule of thirds */}
                  <div className="absolute inset-0 pointer-events-none opacity-40">
                    <div className="absolute top-1/3 inset-x-0 border-t border-white" />
                    <div className="absolute top-2/3 inset-x-0 border-t border-white" />
                    <div className="absolute left-1/3 inset-y-0 border-l border-white" />
                    <div className="absolute left-2/3 inset-y-0 border-l border-white" />
                  </div>

                  {/* Corner handles */}
                  {(['nw', 'ne', 'sw', 'se'] as Handle[]).map(pos => {
                    const isN = pos.startsWith('n');
                    const isW = pos.endsWith('w');
                    return (
                      <div
                        key={pos}
                        className="absolute bg-white border-2 border-blue-500"
                        style={{
                          width: HANDLE_SIZE, height: HANDLE_SIZE,
                          top: isN ? -HANDLE_SIZE / 2 : undefined,
                          bottom: !isN ? -HANDLE_SIZE / 2 : undefined,
                          left: isW ? -HANDLE_SIZE / 2 : undefined,
                          right: !isW ? -HANDLE_SIZE / 2 : undefined,
                          cursor: `${pos}-resize`,
                        }}
                        onMouseDown={e => onMouseDown(e, pos)}
                      />
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            Болдырмау
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            Қолдану
          </button>
        </div>
      </div>
    </div>
  );
}
