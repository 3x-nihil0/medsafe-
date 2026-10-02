import React, { useState, useRef } from 'react';
import { Camera, Upload, X, Image as ImageIcon } from 'lucide-react';

interface PhotoUploadDropzoneProps {
  id?: string;
  photoUrl?: string;
  onChangePhoto: (url: string | undefined) => void;
  label?: string;
  shape?: 'circle' | 'rectangle';
  maxDimension?: number;
  className?: string;
}

export const PhotoUploadDropzone: React.FC<PhotoUploadDropzoneProps> = ({
  id = 'photo-upload-input',
  photoUrl,
  onChangePhoto,
  label = 'Upload Photo',
  shape = 'circle',
  maxDimension = 400,
  className = ''
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    setError(null);
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (PNG, JPG, or WEBP)');
      return;
    }

    const reader = new FileReader();
    reader.onload = e => {
      const result = e.target?.result as string;
      if (!result) return;

      // Create an image element to resize and compress
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          onChangePhoto(result);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        // Compress as JPEG at 0.82 quality for small footprint (~20-40KB)
        const compressed = canvas.toDataURL('image/jpeg', 0.82);
        onChangePhoto(compressed);
      };
      img.onerror = () => {
        setError('Failed to load image');
      };
      img.src = result;
    };
    reader.onerror = () => {
      setError('Failed to read file');
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleTriggerClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemovePhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChangePhoto(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (shape === 'circle') {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          id={id}
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Dropzone Avatar Container */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleTriggerClick}
          className={`relative w-16 h-16 rounded-full cursor-pointer transition-all flex items-center justify-center shrink-0 overflow-hidden border-2 select-none group ${
            isDragging
              ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/40 ring-4 ring-teal-500/20 scale-105'
              : photoUrl
              ? 'border-teal-600 dark:border-teal-400 shadow-sm'
              : 'border-dashed border-slate-300 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/80 hover:border-teal-500 hover:bg-teal-50/50 dark:hover:bg-zinc-800'
          }`}
          title="Click or drag photo here to upload"
        >
          {photoUrl ? (
            <>
              <img
                src={photoUrl}
                alt="Profile Avatar Preview"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera className="w-5 h-5 text-white" />
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center text-slate-400 dark:text-zinc-500 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
              <Camera className="w-6 h-6" />
            </div>
          )}
        </div>

        {/* Details & Actions */}
        <div className="min-w-0 flex-1 space-y-1">
          <div className="text-xs font-semibold text-slate-800 dark:text-zinc-200">
            {label}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleTriggerClick}
              className="text-[11px] font-medium text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 underline underline-offset-2 flex items-center gap-1"
            >
              <Upload className="w-3 h-3" />
              <span>{photoUrl ? 'Change photo' : 'Choose file or drag here'}</span>
            </button>
            {photoUrl && (
              <button
                type="button"
                onClick={handleRemovePhoto}
                className="text-[11px] font-medium text-rose-500 hover:text-rose-600 flex items-center gap-0.5"
              >
                <X className="w-3 h-3" />
                <span>Remove</span>
              </button>
            )}
          </div>
          {error && <p className="text-[11px] text-rose-500">{error}</p>}
          <p className="text-[10px] text-slate-600 dark:text-zinc-400">
            Drag & drop or click • PNG, JPG, WebP
          </p>
        </div>
      </div>
    );
  }

  // Rectangle / Banner Style (for Prescriptions, Medication Boxes, etc.)
  return (
    <div className={`space-y-1.5 ${className}`}>
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        id={id}
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleTriggerClick}
        className={`relative w-full rounded-xl cursor-pointer transition-all flex flex-col items-center justify-center p-4 border-2 select-none text-center ${
          isDragging
            ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/40 ring-4 ring-teal-500/20'
            : photoUrl
            ? 'border-teal-500/60 dark:border-teal-500/40 bg-teal-50/30 dark:bg-teal-950/20'
            : 'border-dashed border-slate-300 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/50 hover:border-teal-500 hover:bg-slate-100/70 dark:hover:bg-zinc-800'
        }`}
      >
        {photoUrl ? (
          <div className="relative w-full flex items-center justify-center gap-3">
            <img
              src={photoUrl}
              alt="Medication or Document Preview"
              className="h-24 max-w-full object-contain rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900"
            />
            <button
              type="button"
              onClick={handleRemovePhoto}
              className="absolute top-0 right-0 p-1.5 rounded-full bg-rose-500 text-white hover:bg-rose-600 shadow-sm transition"
              title="Remove photo"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-2 text-slate-500 dark:text-zinc-400">
            <div className="w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400 flex items-center justify-center mb-2">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div className="text-xs font-semibold text-slate-800 dark:text-zinc-200">
              {label}
            </div>
            <div className="text-[11px] text-slate-600 dark:text-zinc-400 mt-0.5">
              Drag & drop photo here, or <span className="text-teal-600 dark:text-teal-400 font-medium underline">browse</span>
            </div>
            <div className="text-[10px] text-slate-600 dark:text-zinc-400 mt-1">
              Supports medication package, blister pack, or label
            </div>
          </div>
        )}
      </div>
      {error && <p className="text-[11px] text-rose-500">{error}</p>}
    </div>
  );
};
