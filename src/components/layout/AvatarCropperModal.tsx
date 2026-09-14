import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Icons } from '../ui/Icons';
import { Button } from '../ui/Button';

interface AvatarCropperModalProps {
  isOpen: boolean;
  imageUrl: string;
  onClose: () => void;
  onSaveCropped: (croppedBase64: string) => void;
}

export const AvatarCropperModal: React.FC<AvatarCropperModalProps> = ({
  isOpen,
  imageUrl,
  onClose,
  onSaveCropped,
}) => {
  const [zoom, setZoom] = useState<number>(1.0);
  const [offsetX, setOffsetX] = useState<number>(0); // -100 to 100 (%)
  const [offsetY, setOffsetY] = useState<number>(0); // -100 to 100 (%)
  const [rotation, setRotation] = useState<number>(0); // 0, 90, 180, 270
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number; initX: number; initY: number }>({ x: 0, y: 0, initX: 0, initY: 0 });
  const [previewDataUrl, setPreviewDataUrl] = useState<string>('');
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [isImageLoaded, setIsImageLoaded] = useState<boolean>(false);

  // Reset parameters when opened with a new image
  useEffect(() => {
    if (isOpen && imageUrl) {
      setZoom(1.1);
      setOffsetX(0);
      setOffsetY(0);
      setRotation(0);
      setIsImageLoaded(false);

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        imgRef.current = img;
        setIsImageLoaded(true);
      };
      img.src = imageUrl;
    }
  }, [isOpen, imageUrl]);

  // Update canvas preview
  const generateCroppedDataUrl = useCallback((targetSize: number = 400): string => {
    if (!imgRef.current || !isImageLoaded) return '';

    const canvas = document.createElement('canvas');
    canvas.width = targetSize;
    canvas.height = targetSize;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    const img = imgRef.current;
    const imgAspect = img.naturalWidth / img.naturalHeight;

    // Hitung ukuran dasar untuk cover 1:1
    let baseW = targetSize;
    let baseH = targetSize;
    if (imgAspect > 1) {
      baseH = targetSize;
      baseW = targetSize * imgAspect;
    } else {
      baseW = targetSize;
      baseH = targetSize / imgAspect;
    }

    ctx.clearRect(0, 0, targetSize, targetSize);
    ctx.save();

    // Pindah titik pusat ke tengah kanvas
    ctx.translate(targetSize / 2, targetSize / 2);
    ctx.rotate((rotation * Math.PI) / 180);

    // Hitung pergeseran posisi (offset dalam persentase dikonversi ke piksel)
    const pxOffsetX = (offsetX / 100) * (baseW * 0.5);
    const pxOffsetY = (offsetY / 100) * (baseH * 0.5);

    ctx.translate(pxOffsetX, pxOffsetY);
    ctx.scale(zoom, zoom);

    // Gambar di tengah kanvas
    ctx.drawImage(img, -baseW / 2, -baseH / 2, baseW, baseH);
    ctx.restore();

    return canvas.toDataURL('image/jpeg', 0.92);
  }, [zoom, offsetX, offsetY, rotation, isImageLoaded]);

  // Live preview generator
  useEffect(() => {
    if (isImageLoaded) {
      const dataUrl = generateCroppedDataUrl(250);
      setPreviewDataUrl(dataUrl);
    }
  }, [generateCroppedDataUrl, isImageLoaded]);

  // Drag interaction handlers (Mouse & Touch)
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      initX: offsetX,
      initY: offsetY,
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    // Sensitivitas geser
    const newX = Math.max(-100, Math.min(100, dragStartRef.current.initX + (dx / 1.5)));
    const newY = Math.max(-100, Math.min(100, dragStartRef.current.initY + (dy / 1.5)));
    setOffsetX(Math.round(newX));
    setOffsetY(Math.round(newY));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      dragStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        initX: offsetX,
        initY: offsetY,
      };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    const dx = e.touches[0].clientX - dragStartRef.current.x;
    const dy = e.touches[0].clientY - dragStartRef.current.y;
    const newX = Math.max(-100, Math.min(100, dragStartRef.current.initX + (dx / 1.5)));
    const newY = Math.max(-100, Math.min(100, dragStartRef.current.initY + (dy / 1.5)));
    setOffsetX(Math.round(newX));
    setOffsetY(Math.round(newY));
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handlePreset = (preset: 'center' | 'top' | 'left' | 'right') => {
    switch (preset) {
      case 'center':
        setOffsetX(0);
        setOffsetY(0);
        break;
      case 'top':
        setOffsetX(0);
        setOffsetY(40);
        break;
      case 'left':
        setOffsetX(40);
        setOffsetY(0);
        break;
      case 'right':
        setOffsetX(-40);
        setOffsetY(0);
        break;
    }
  };

  const handleApply = () => {
    const finalCroppedUrl = generateCroppedDataUrl(450);
    if (finalCroppedUrl) {
      onSaveCropped(finalCroppedUrl);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-[#0E111F] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] bg-white/[0.02]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-violet-500/20 text-violet-400 border border-violet-500/30 flex items-center justify-center">
              <Icons.Crop size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">
                Sesuaikan & Potong Foto Profil
              </h3>
              <p className="text-[11px] text-slate-400">
                Posisikan fokus wajah agar tampil rapi dan simetris di Dashboard
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Ketentuan Foto Standar Box */}
          <div className="p-3.5 rounded-2xl bg-violet-950/30 border border-violet-500/20 flex items-start gap-3 text-xs">
            <span className="text-violet-400 shrink-0 mt-0.5">
              <Icons.Sparkles size={16} />
            </span>
            <div className="space-y-1 text-slate-300">
              <span className="font-bold text-violet-200">Ketentuan Foto Profil Standar:</span>
              <ul className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] text-slate-300">
                <li>• <strong>Rasio</strong>: 1:1 (Persegi/Kotak)</li>
                <li>• <strong>Dimensi</strong>: 400 × 400 px</li>
                <li>• <strong>Fokus</strong>: Wajah di tengah lingkaran</li>
                <li>• <strong>Kompresi</strong>: Otomatis ringan (~50KB)</li>
              </ul>
            </div>
          </div>

          {/* Interactive Crop Viewport Area */}
          <div className="flex flex-col sm:flex-row items-center gap-6 justify-center">
            {/* Viewport Box */}
            <div className="flex flex-col items-center">
              <div
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                className="relative w-64 h-64 rounded-2xl overflow-hidden bg-black border-2 border-dashed border-violet-500/40 select-none cursor-grab active:cursor-grabbing shadow-inner flex items-center justify-center group"
                title="Klik dan geser (drag) foto untuk mengatur posisi"
              >
                {/* Background Image rendered through CSS transform for real-time smoothness */}
                {imageUrl && (
                  <img
                    src={imageUrl}
                    alt="Source"
                    style={{
                      transform: `translate(${offsetX * 0.5}px, ${offsetY * 0.5}px) scale(${zoom}) rotate(${rotation}deg)`,
                      transformOrigin: 'center center',
                    }}
                    className="max-w-none w-full h-full object-cover transition-transform duration-75 pointer-events-none"
                  />
                )}

                {/* Squircle / Circular Crop Mask Overlay */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  {/* Grid Lines for alignment */}
                  <div className="w-56 h-56 rounded-2xl border-2 border-cyan-400/80 shadow-[0_0_20px_rgba(6,182,212,0.3)] relative">
                    {/* Rule of thirds grid */}
                    <div className="absolute inset-x-0 top-1/3 border-t border-cyan-400/20" />
                    <div className="absolute inset-x-0 top-2/3 border-t border-cyan-400/20" />
                    <div className="absolute inset-y-0 left-1/3 border-l border-cyan-400/20" />
                    <div className="absolute inset-y-0 left-2/3 border-l border-cyan-400/20" />
                  </div>
                </div>

                {/* Drag Hint Pill */}
                <div className="absolute bottom-2 px-2.5 py-1 rounded-full bg-black/70 border border-white/10 text-[10px] text-slate-300 font-medium pointer-events-none backdrop-blur-sm flex items-center gap-1.5">
                  <Icons.Move size={12} color="#06B6D4" />
                  <span>Geser untuk atur posisi</span>
                </div>
              </div>

              {/* Reset & Rotate Button */}
              <div className="flex items-center gap-2 mt-2.5">
                <button
                  type="button"
                  onClick={handleRotate}
                  className="px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 text-xs font-semibold flex items-center gap-1.5 border border-white/10 transition-colors"
                >
                  <Icons.RotateCw size={13} />
                  <span>Putar 90°</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setZoom(1.1);
                    setOffsetX(0);
                    setOffsetY(0);
                    setRotation(0);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 text-xs font-semibold transition-colors"
                >
                  Reset Posisi
                </button>
              </div>
            </div>

            {/* Live Previews Panel */}
            <div className="flex sm:flex-col items-center gap-4 bg-white/[0.02] p-4 rounded-2xl border border-white/[0.06]">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Pratinjau Nyata:
              </span>

              {/* Preview 1: Header Dashboard (64x64 squircle) */}
              <div className="flex flex-col items-center gap-1.5">
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl p-[2px] bg-gradient-to-tr from-violet-500 via-indigo-500 to-cyan-400 shadow-lg shadow-violet-500/25">
                    <div className="w-full h-full rounded-[14px] overflow-hidden bg-[#0E111D]">
                      {previewDataUrl ? (
                        <img src={previewDataUrl} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-slate-800 animate-pulse" />
                      )}
                    </div>
                  </div>
                  {/* Status Dot */}
                  <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-[#0E111F]" />
                </div>
                <span className="text-[10px] text-slate-400 font-mono">Header (64px)</span>
              </div>

              {/* Preview 2: Sidebar (40x40 squircle) */}
              <div className="flex flex-col items-center gap-1.5">
                <div className="relative">
                  <div className="w-10 h-10 rounded-xl p-[1.5px] bg-gradient-to-tr from-violet-500/50 to-cyan-400/50">
                    <div className="w-full h-full rounded-[10px] overflow-hidden bg-[#0E111D]">
                      {previewDataUrl ? (
                        <img src={previewDataUrl} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-slate-800 animate-pulse" />
                      )}
                    </div>
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-[#0E111F]" />
                </div>
                <span className="text-[10px] text-slate-400 font-mono">Sidebar (40px)</span>
              </div>
            </div>
          </div>

          {/* Controls Sliders */}
          <div className="space-y-3.5 bg-white/[0.02] p-4 rounded-2xl border border-white/[0.06]">
            {/* Zoom Slider */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Icons.ZoomIn size={14} color="#8B5CF6" />
                  <span>Perbesar / Zoom:</span>
                </span>
                <span className="font-mono text-violet-400">{zoom.toFixed(2)}x</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setZoom(prev => Math.max(1.0, parseFloat((prev - 0.1).toFixed(2))))}
                  className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 flex items-center justify-center font-mono font-bold"
                >
                  -
                </button>
                <input
                  type="range"
                  min="1.0"
                  max="3.5"
                  step="0.05"
                  value={zoom}
                  onChange={e => setZoom(parseFloat(e.target.value))}
                  className="flex-1 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-violet-500"
                />
                <button
                  type="button"
                  onClick={() => setZoom(prev => Math.min(3.5, parseFloat((prev + 0.1).toFixed(2))))}
                  className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 flex items-center justify-center font-mono font-bold"
                >
                  +
                </button>
              </div>
            </div>

            {/* Geser Horizontal (X) */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Icons.Move size={14} color="#06B6D4" />
                  <span>Geser Posisi Horizontal (Kiri / Kanan):</span>
                </span>
                <span className="font-mono text-cyan-400">{offsetX}%</span>
              </div>
              <input
                type="range"
                min="-100"
                max="100"
                step="1"
                value={offsetX}
                onChange={e => setOffsetX(parseInt(e.target.value, 10))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
            </div>

            {/* Geser Vertikal (Y) */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Icons.Move size={14} color="#10B981" />
                  <span>Geser Posisi Vertikal (Atas / Bawah):</span>
                </span>
                <span className="font-mono text-emerald-400">{offsetY}%</span>
              </div>
              <input
                type="range"
                min="-100"
                max="100"
                step="1"
                value={offsetY}
                onChange={e => setOffsetY(parseInt(e.target.value, 10))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>

            {/* Quick Focus Preset Buttons */}
            <div className="pt-1">
              <span className="text-[11px] font-semibold text-slate-400 block mb-1.5">
                Preset Fokus Cepat:
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {[
                  { id: 'center', label: '🎯 Tengah' },
                  { id: 'top', label: '⬆️ Wajah Atas' },
                  { id: 'left', label: '⬅️ Sisi Kiri' },
                  { id: 'right', label: '➡️ Sisi Kanan' },
                ].map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handlePreset(p.id as any)}
                    className="px-3 py-1 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs text-slate-300 transition-colors"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/[0.08] bg-white/[0.02]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            Batal
          </button>
          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={handleApply}
            icon={<Icons.Check size={16} />}
          >
            Terapkan & Simpan Foto (400×400)
          </Button>
        </div>
      </div>
    </div>
  );
};
