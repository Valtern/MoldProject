import React, { useMemo, useState } from "react";
import { Database, FileText, Image, Sparkles, TimerReset } from "lucide-react";
import type { FileMetadata, StorageCategory } from "@/services/storageService";
import { auth } from "@/lib/firebase";
import { FileUploader } from "@/components/FileUploader";
import { FileList } from "@/components/FileList";
import { FilePreview, StorageStats } from "@/components/FilePreview";

type Category = StorageCategory;

const categories: Array<{
  value: Category;
  label: string;
  caption: string;
  icon: React.ElementType;
  accent: string;
}> = [
  {
    value: "documents",
    label: "Documents",
    caption: "Reports, notes, and project files",
    icon: FileText,
    accent: "from-emerald-400 to-teal-400",
  },
  {
    value: "images",
    label: "Images",
    caption: "Photos, scans, and visual evidence",
    icon: Image,
    accent: "from-sky-400 to-cyan-400",
  },
  {
    value: "datasets",
    label: "Datasets",
    caption: "CSV, JSON, and analysis exports",
    icon: Database,
    accent: "from-violet-400 to-sky-400",
  },
  {
    value: "temp",
    label: "Temporary",
    caption: "Short-term working files",
    icon: TimerReset,
    accent: "from-amber-400 to-emerald-400",
  },
];

const getStorageOwnerName = () => {
  const user = auth.currentUser;
  const rawName = user?.displayName || user?.email?.split("@")[0] || "Your";

  return rawName
    .split(/[._-]+/g)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export const StoragePage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<Category>("images");
  const [selectedFile, setSelectedFile] = useState<FileMetadata | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const ownerName = useMemo(() => getStorageOwnerName(), []);

  const activeCategory = categories.find((category) => category.value === selectedCategory) ?? categories[0];

  const refreshStorage = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleFileUploaded = (file: FileMetadata) => {
    setSelectedFile(file);
    refreshStorage();
  };

  const handleFileDeleted = (fileId: string) => {
    setSelectedFile((current) => (current?.id === fileId ? null : current));
    refreshStorage();
  };

  return (
    <div className="w-full max-w-[1920px] mx-auto px-4 py-5 md:px-7 md:py-7 lg:px-10 2xl:px-12">
      <div className="relative overflow-hidden rounded-lg border border-white/60 bg-white/55 p-5 shadow-2xl shadow-slate-950/5 backdrop-blur-xl dark:border-white/10 dark:bg-zinc-950/45 md:p-7">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(16,185,129,0.16),transparent_28%),radial-gradient(circle_at_85%_20%,rgba(14,165,233,0.13),transparent_30%),radial-gradient(circle_at_55%_90%,rgba(245,158,11,0.10),transparent_28%)]" />

        <div className="relative">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-300">
                <Sparkles className="h-3.5 w-3.5" />
                Cloud vault
              </div>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 dark:text-zinc-50 md:text-5xl">
                {ownerName} Storage
              </h1>
              <p className="mt-3 max-w-2xl text-base text-slate-600 dark:text-zinc-400">
                Upload, preview, download, and clean up files tied to the signed-in MoldGuard account.
              </p>
            </div>

            <div className="rounded-lg border border-slate-200/70 bg-white/75 px-4 py-3 text-sm shadow-lg shadow-slate-950/5 dark:border-white/10 dark:bg-zinc-950/70">
              <p className="text-slate-500 dark:text-zinc-400">Active category</p>
              <p className="mt-1 font-semibold text-slate-950 dark:text-zinc-50">{activeCategory.label}</p>
            </div>
          </div>

          <div className="mt-7">
            <StorageStats refreshKey={refreshKey} />
          </div>

          <div className="mt-7 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {categories.map((category) => {
              const Icon = category.icon;
              const isActive = selectedCategory === category.value;

              return (
                <button
                  key={category.value}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(category.value);
                    setSelectedFile(null);
                  }}
                  className={`group overflow-hidden rounded-lg border p-4 text-left transition-all duration-300 ${
                    isActive
                      ? "border-emerald-400 bg-white shadow-xl shadow-emerald-950/10 dark:border-emerald-400/60 dark:bg-zinc-900"
                      : "border-slate-200/70 bg-white/65 hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-white/90 dark:border-white/10 dark:bg-zinc-950/60 dark:hover:border-emerald-400/40 dark:hover:bg-zinc-900/80"
                  }`}
                >
                  <div className={`mb-4 h-1.5 rounded-full bg-gradient-to-r ${category.accent}`} />
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-950 dark:text-zinc-50">{category.label}</p>
                      <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">{category.caption}</p>
                    </div>
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition-colors group-hover:bg-emerald-500/10 group-hover:text-emerald-600 dark:bg-zinc-800 dark:text-zinc-300 dark:group-hover:text-emerald-300">
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-7 grid grid-cols-1 gap-5 xl:grid-cols-[420px_minmax(0,1fr)]">
            <FileUploader
              category={selectedCategory}
              description={`${activeCategory.label} upload`}
              onSuccess={handleFileUploaded}
              onError={(error) => console.error("Upload error:", error)}
            />

            <FileList
              key={`${selectedCategory}-${refreshKey}`}
              category={selectedCategory}
              selectedFileId={selectedFile?.id}
              onFileDeleted={handleFileDeleted}
              onFileSelected={setSelectedFile}
            />
          </div>

          {selectedFile && selectedFile.category === selectedCategory && (
            <div className="mt-5">
              <FilePreview file={selectedFile} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StoragePage;
