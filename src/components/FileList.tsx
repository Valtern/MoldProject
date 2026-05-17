import React, { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  Database,
  Download,
  FileText,
  Image,
  Loader2,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { FileMetadata } from "@/services/storageService";
import { deleteFile, formatFileSize, getUserFiles } from "@/services/storageService";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface FileListProps {
  category?: FileMetadata["category"];
  selectedFileId?: string;
  onFileDeleted?: (fileId: string) => void;
  onFileSelected?: (file: FileMetadata) => void;
}

const categoryIcon = {
  documents: FileText,
  images: Image,
  datasets: Database,
  temp: FileText,
} satisfies Record<FileMetadata["category"], React.ElementType>;

const getFileKind = (file: FileMetadata) => {
  if (file.fileType.startsWith("image/")) return "Image";
  if (file.fileType.includes("pdf")) return "PDF";
  if (file.fileType.includes("spreadsheet") || file.fileType.includes("excel")) return "Sheet";
  if (file.fileType.includes("json") || file.fileType.includes("csv")) return "Dataset";
  return file.fileType.split("/")[1] || "File";
};

export const FileList: React.FC<FileListProps> = ({
  category,
  selectedFileId,
  onFileDeleted,
  onFileSelected,
}) => {
  const [files, setFiles] = useState<FileMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const loadFiles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const loadedFiles = await getUserFiles(category);
      setFiles(loadedFiles.sort((a, b) => b.uploadedAt.toMillis() - a.uploadedAt.toMillis()));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load files";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  const handleDelete = async (file: FileMetadata) => {
    if (!file.id) return;

    try {
      setDeleting(file.id);
      await deleteFile(file);
      setFiles((current) => current.filter((item) => item.id !== file.id));
      onFileDeleted?.(file.id);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete file";
      setError(errorMessage);
    } finally {
      setDeleting(null);
    }
  };

  const handleDownload = (file: FileMetadata) => {
    if (!file.downloadURL) {
      setError("No download URL is available for this file.");
      return;
    }

    window.open(file.downloadURL, "_blank", "noopener,noreferrer");
  };

  const CategoryIcon = category ? categoryIcon[category] : FileText;

  return (
    <div className="rounded-lg border border-slate-200/70 bg-white/80 p-5 shadow-xl shadow-slate-950/5 backdrop-blur-xl dark:border-white/10 dark:bg-zinc-950/75">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-300">
            <CategoryIcon className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-950 dark:text-zinc-50">Your files</h2>
            <p className="text-sm text-slate-500 dark:text-zinc-400">
              {files.length} file{files.length !== 1 ? "s" : ""} {category ? `in ${category}` : ""}
            </p>
          </div>
        </div>

        <Button
          onClick={loadFiles}
          variant="outline"
          size="sm"
          className="gap-2 rounded-lg border-slate-200 bg-white/70 hover:bg-emerald-50 dark:border-zinc-700 dark:bg-zinc-900/70 dark:hover:bg-emerald-500/10"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {error && (
        <div className="mb-4 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex min-h-64 items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50/70 dark:border-zinc-800 dark:bg-zinc-900/40">
          <div className="text-center">
            <Loader2 className="mx-auto h-6 w-6 animate-spin text-emerald-500" />
            <p className="mt-3 text-sm text-slate-500 dark:text-zinc-400">Scanning your storage...</p>
          </div>
        </div>
      ) : files.length === 0 ? (
        <div className="flex min-h-64 items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50/70 dark:border-zinc-800 dark:bg-zinc-900/40">
          <div className="max-w-sm text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-300">
              <CategoryIcon className="h-6 w-6" />
            </div>
            <p className="mt-4 text-base font-medium text-slate-900 dark:text-zinc-100">No files here yet</p>
            <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">
              Upload something on the left and it will appear here automatically.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-3">
          {files.map((file) => {
            const Icon = file.fileType.startsWith("image/") ? Image : CategoryIcon;
            const isSelected = selectedFileId === file.id;

            return (
              <button
                key={file.id}
                type="button"
                onClick={() => onFileSelected?.(file)}
                className={`group flex w-full items-center gap-4 rounded-lg border p-3 text-left transition-all duration-200 ${
                  isSelected
                    ? "border-emerald-400 bg-emerald-500/10 shadow-md shadow-emerald-950/5"
                    : "border-slate-200/80 bg-white/70 hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-emerald-50/70 dark:border-zinc-800 dark:bg-zinc-900/70 dark:hover:border-emerald-400/40 dark:hover:bg-emerald-500/10"
                }`}
              >
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition-colors group-hover:bg-emerald-500/10 group-hover:text-emerald-600 dark:bg-zinc-800 dark:text-zinc-300 dark:group-hover:text-emerald-300">
                  <Icon className="h-5 w-5" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-950 dark:text-zinc-50">
                    {file.fileName}
                  </p>
                  <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-zinc-400">
                    <span>{getFileKind(file)}</span>
                    <span>{formatFileSize(file.fileSize)}</span>
                    <span>{formatDistanceToNow(file.uploadedAt.toDate(), { addSuffix: true })}</span>
                  </div>
                </div>

                <div className="flex flex-shrink-0 items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-lg text-slate-500 hover:bg-teal-500/10 hover:text-teal-600 dark:text-zinc-400 dark:hover:text-teal-300"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleDownload(file);
                    }}
                  >
                    <Download className="h-4 w-4" />
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        disabled={deleting === file.id}
                        className="h-9 w-9 rounded-lg text-slate-500 hover:bg-red-500/10 hover:text-red-600 dark:text-zinc-400 dark:hover:text-red-300"
                        onClick={(event) => event.stopPropagation()}
                      >
                        {deleting === file.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent onClick={(event) => event.stopPropagation()}>
                      <AlertDialogTitle>Delete file?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This removes "{file.fileName}" from Firebase Storage and your file list.
                      </AlertDialogDescription>
                      <div className="flex justify-end gap-2">
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(file)}
                          className="bg-red-500 text-white hover:bg-red-600"
                        >
                          Delete
                        </AlertDialogAction>
                      </div>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
