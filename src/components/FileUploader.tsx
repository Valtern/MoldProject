import React, { useRef, useState } from "react";
import { AlertCircle, CheckCircle2, Image, Loader2, UploadCloud } from "lucide-react";
import type { FileMetadata, UploadProgress } from "@/services/storageService";
import { formatFileSize, uploadFile } from "@/services/storageService";
import { Progress } from "@/components/ui/progress";

interface FileUploaderProps {
  category: FileMetadata["category"];
  description?: string;
  tags?: string[];
  isPublic?: boolean;
  onSuccess?: (file: FileMetadata) => void;
  onError?: (error: Error) => void;
  multiple?: boolean;
}

const categoryHints: Record<FileMetadata["category"], string> = {
  documents: "PDF, Word, Excel, text, or CSV files up to 50 MB",
  images: "JPEG, PNG, GIF, WebP, or SVG images up to 10 MB",
  datasets: "CSV, JSON, Excel, or text datasets up to 100 MB",
  temp: "Quick working files up to 10 MB",
};

export const FileUploader: React.FC<FileUploaderProps> = ({
  category,
  description,
  tags,
  isPublic = false,
  onSuccess,
  onError,
  multiple = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successName, setSuccessName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const openPicker = () => {
    if (!uploading) fileInputRef.current?.click();
  };

  const handleFiles = async (files: File[]) => {
    if (files.length === 0) return;

    setError(null);
    setSuccessName(null);

    for (const file of files) {
      setUploading(true);

      try {
        const uploadedFile = await uploadFile(
          file,
          category,
          description,
          tags,
          isPublic,
          setProgress
        );

        setSuccessName(uploadedFile.fileName);
        onSuccess?.(uploadedFile);
        setProgress(null);

        if (!multiple) break;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Upload failed";
        setError(errorMessage);
        onError?.(new Error(errorMessage));
      } finally {
        if (!multiple || files.indexOf(file) === files.length - 1) {
          setUploading(false);
          if (fileInputRef.current) fileInputRef.current.value = "";
        }
      }
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(Array.from(event.currentTarget.files ?? []));
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    handleFiles(Array.from(event.dataTransfer.files));
  };

  return (
    <div className="relative overflow-hidden rounded-lg border border-emerald-500/20 bg-white/85 p-5 shadow-xl shadow-emerald-950/5 backdrop-blur-xl dark:border-emerald-400/10 dark:bg-zinc-950/80">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-400 via-teal-400 to-sky-400" />

      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-400">
            Upload Bay
          </p>
          <h2 className="mt-1 text-xl font-semibold text-slate-950 dark:text-zinc-50">
            Add to {category}
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">
            {categoryHints[category]}
          </p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-300">
          <UploadCloud className="h-5 w-5" />
        </div>
      </div>

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openPicker}
        className={`group flex min-h-48 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed p-6 text-center transition-all duration-300 ${
          isDragging
            ? "border-emerald-400 bg-emerald-500/10 shadow-inner"
            : "border-slate-300/80 bg-slate-50/70 hover:border-emerald-400 hover:bg-emerald-500/5 dark:border-zinc-700 dark:bg-zinc-900/60 dark:hover:border-emerald-400/70"
        } ${uploading ? "pointer-events-none opacity-80" : ""}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          disabled={uploading}
          multiple={multiple}
          className="hidden"
        />

        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-lg bg-white text-emerald-600 shadow-sm ring-1 ring-slate-200 transition-transform duration-300 group-hover:-translate-y-1 dark:bg-zinc-950 dark:ring-zinc-800">
          {uploading ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            <Image className="h-6 w-6" />
          )}
        </div>

        {uploading && progress ? (
          <div className="w-full max-w-sm space-y-3">
            <p className="text-sm font-medium text-slate-800 dark:text-zinc-100">
              Uploading {progress.percentage}%
            </p>
            <Progress value={progress.percentage} className="h-2" />
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              {formatFileSize(progress.loaded)} of {formatFileSize(progress.total)}
            </p>
          </div>
        ) : (
          <>
            <p className="text-base font-semibold text-slate-900 dark:text-zinc-100">
              Drop files here or click to browse
            </p>
            <p className="mt-2 max-w-xs text-sm text-slate-500 dark:text-zinc-400">
              Files are stored under your account and shown in your personal storage library.
            </p>
          </>
        )}
      </div>

      {error && (
        <div className="mt-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successName && !error && (
        <div className="mt-4 flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">
          <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <span>{successName} uploaded.</span>
        </div>
      )}
    </div>
  );
};
