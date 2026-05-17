import React, { useEffect, useState } from "react";
import { Database, Eye, FileText, HardDrive, Image, ShieldCheck } from "lucide-react";
import type { FileMetadata, StorageCategory } from "@/services/storageService";
import { formatFileSize, getStorageStats } from "@/services/storageService";
import { Progress } from "@/components/ui/progress";

interface FilePreviewProps {
  file: FileMetadata;
  maxHeight?: string;
}

interface StorageStatsProps {
  refreshKey?: number;
}

const categoryLabels: Record<StorageCategory, string> = {
  documents: "Documents",
  images: "Images",
  datasets: "Datasets",
  temp: "Temporary",
};

const categoryIcons = {
  documents: FileText,
  images: Image,
  datasets: Database,
  temp: HardDrive,
} satisfies Record<StorageCategory, React.ElementType>;

export const FilePreview: React.FC<FilePreviewProps> = ({ file, maxHeight = "420px" }) => {
  const previewUrl = file.downloadURL || "";
  const isImage = file.fileType.startsWith("image/");
  const isPDF = file.fileType === "application/pdf";
  const CategoryIcon = categoryIcons[file.category] ?? FileText;

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200/70 bg-white/85 shadow-xl shadow-slate-950/5 backdrop-blur-xl dark:border-white/10 dark:bg-zinc-950/75">
      <div className="flex items-start justify-between gap-4 border-b border-slate-200/70 p-5 dark:border-white/10">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-600 dark:text-teal-300">
            Preview
          </p>
          <h2 className="mt-1 truncate text-xl font-semibold text-slate-950 dark:text-zinc-50">
            {file.fileName}
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">{file.fileType}</p>
        </div>
        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-300">
          <CategoryIcon className="h-5 w-5" />
        </div>
      </div>

      <div className="p-5">
        {isImage && previewUrl && (
          <div className="flex justify-center overflow-hidden rounded-lg bg-slate-950/5 ring-1 ring-slate-200 dark:bg-white/5 dark:ring-white/10">
            <img
              src={previewUrl}
              alt={file.fileName}
              style={{ maxHeight, maxWidth: "100%" }}
              className="object-contain"
            />
          </div>
        )}

        {isPDF && previewUrl && (
          <div
            className="overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-white/10 dark:bg-zinc-900"
            style={{ height: maxHeight }}
          >
            <iframe
              src={`${previewUrl}#toolbar=0`}
              className="h-full w-full"
              title={file.fileName}
            />
          </div>
        )}

        {!isImage && !isPDF && (
          <div
            className="flex items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50/70 text-slate-500 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-400"
            style={{ height: maxHeight }}
          >
            <div className="text-center">
              <Eye className="mx-auto h-8 w-8 text-emerald-500" />
              <p className="mt-3 text-sm font-medium text-slate-900 dark:text-zinc-100">Preview not available</p>
              {previewUrl && (
                <a
                  href={previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex text-sm font-medium text-emerald-600 underline-offset-4 hover:underline dark:text-emerald-300"
                >
                  Open file
                </a>
              )}
            </div>
          </div>
        )}

        <div className="mt-5 grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
          <div className="rounded-lg bg-slate-50 p-3 dark:bg-zinc-900/70">
            <p className="text-slate-500 dark:text-zinc-400">Size</p>
            <p className="mt-1 font-semibold text-slate-950 dark:text-zinc-50">{formatFileSize(file.fileSize)}</p>
          </div>
          <div className="rounded-lg bg-slate-50 p-3 dark:bg-zinc-900/70">
            <p className="text-slate-500 dark:text-zinc-400">Category</p>
            <p className="mt-1 font-semibold text-slate-950 dark:text-zinc-50">
              {categoryLabels[file.category] ?? file.category}
            </p>
          </div>
          <div className="rounded-lg bg-slate-50 p-3 dark:bg-zinc-900/70">
            <p className="text-slate-500 dark:text-zinc-400">Visibility</p>
            <p className="mt-1 font-semibold text-slate-950 dark:text-zinc-50">
              {file.isPublic ? "Public" : "Private"}
            </p>
          </div>
          <div className="rounded-lg bg-slate-50 p-3 dark:bg-zinc-900/70">
            <p className="text-slate-500 dark:text-zinc-400">Status</p>
            <p className="mt-1 inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-300">
              <ShieldCheck className="h-4 w-4" />
              Stored
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export const StorageStats: React.FC<StorageStatsProps> = ({ refreshKey = 0 }) => {
  const [stats, setStats] = useState<{
    totalSize: number;
    fileCount: number;
    byCategory: Record<StorageCategory, { size: number; count: number }>;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        const loadedStats = await getStorageStats();
        setStats(loadedStats);
      } catch (err) {
        console.error("Failed to load storage stats:", err);
        setStats(null);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [refreshKey]);

  const freeStorageLimit = 5 * 1024 * 1024 * 1024;
  const totalSize = stats?.totalSize ?? 0;
  const fileCount = stats?.fileCount ?? 0;
  const percentageUsed = Math.min(Math.round((totalSize / freeStorageLimit) * 100), 100);

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <div className="rounded-lg border border-emerald-500/20 bg-white/80 p-4 shadow-lg shadow-emerald-950/5 backdrop-blur-xl dark:border-emerald-400/10 dark:bg-zinc-950/75">
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500 dark:text-zinc-400">Total usage</p>
          <HardDrive className="h-4 w-4 text-emerald-500" />
        </div>
        <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-zinc-50">
          {loading ? "..." : formatFileSize(totalSize)}
        </p>
        <Progress value={percentageUsed} className="mt-3 h-2" />
        <p className="mt-2 text-xs text-slate-500 dark:text-zinc-400">
          {percentageUsed}% of {formatFileSize(freeStorageLimit)}
        </p>
      </div>

      <div className="rounded-lg border border-teal-500/20 bg-white/80 p-4 shadow-lg shadow-teal-950/5 backdrop-blur-xl dark:border-teal-400/10 dark:bg-zinc-950/75">
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500 dark:text-zinc-400">Files stored</p>
          <FileText className="h-4 w-4 text-teal-500" />
        </div>
        <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-zinc-50">
          {loading ? "..." : fileCount}
        </p>
        <p className="mt-3 text-xs text-slate-500 dark:text-zinc-400">
          Across documents, images, datasets, and temporary files
        </p>
      </div>

      <div className="rounded-lg border border-sky-500/20 bg-white/80 p-4 shadow-lg shadow-sky-950/5 backdrop-blur-xl dark:border-sky-400/10 dark:bg-zinc-950/75">
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500 dark:text-zinc-400">Largest group</p>
          <Database className="h-4 w-4 text-sky-500" />
        </div>
        <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-zinc-50">
          {loading || !stats
            ? "..."
            : Object.entries(stats.byCategory).sort((a, b) => b[1].size - a[1].size)[0]?.[0] ?? "None"}
        </p>
        <p className="mt-3 text-xs text-slate-500 dark:text-zinc-400">
          Updated after each successful upload or delete
        </p>
      </div>
    </div>
  );
};
