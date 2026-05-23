import { auth, storage } from "@/lib/firebase";
import {
  deleteObject,
  getDownloadURL,
  getMetadata,
  listAll,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { Timestamp } from "firebase/firestore";

export type StorageCategory = "documents" | "images" | "datasets" | "temp";

export interface FileMetadata {
  id?: string;
  userId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  storagePath: string;
  downloadURL?: string;
  category: StorageCategory;
  uploadedAt: Timestamp;
  updatedAt: Timestamp;
  description?: string;
  tags?: string[];
  isPublic: boolean;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

const STORAGE_CATEGORIES: StorageCategory[] = [
  "documents",
  "images",
  "datasets",
  "temp",
];

const FILE_SIZE_LIMITS = {
  documents: 50 * 1024 * 1024,
  images: 10 * 1024 * 1024,
  datasets: 100 * 1024 * 1024,
  temp: 10 * 1024 * 1024,
} satisfies Record<StorageCategory, number>;

const ALLOWED_MIME_TYPES = {
  documents: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "text/plain",
    "text/csv",
  ],
  images: [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/svg+xml",
    "image/heic",
    "image/heif",
    "image/avif",
    "image/bmp",
    "",
  ],
  datasets: [
    "text/csv",
    "application/json",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "text/plain",
    "",
  ],
  temp: [
    "application/pdf",
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
    "text/plain",
    "text/csv",
    "",
  ],
} satisfies Record<StorageCategory, string[]>;

export const validateFileType = (
  file: File,
  category: StorageCategory
): boolean => {
  return ALLOWED_MIME_TYPES[category].includes(file.type);
};

export const validateFileSize = (
  file: File,
  category: StorageCategory
): boolean => {
  return file.size <= FILE_SIZE_LIMITS[category];
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${Math.round((bytes / Math.pow(k, i)) * 100) / 100} ${sizes[i]}`;
};

const requireCurrentUser = () => {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error("User not authenticated");
  }
  return currentUser;
};

const generateStoragePath = (
  userId: string,
  category: StorageCategory,
  fileName: string
): string => {
  const timestamp = Date.now();
  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
  return `users/${userId}/${category}/${timestamp}_${sanitizedFileName}`;
};

const getCategoryFromPath = (path: string): StorageCategory => {
  const category = path.split("/")[2] as StorageCategory | undefined;
  return category && STORAGE_CATEGORIES.includes(category) ? category : "temp";
};

const getOriginalNameFromPath = (path: string): string => {
  const rawName = path.split("/").pop() || "file";
  return rawName.replace(/^\d+_/, "");
};

const toTimestamp = (value?: string): Timestamp => {
  const millis = value ? Date.parse(value) : Date.now();
  return Timestamp.fromMillis(Number.isNaN(millis) ? Date.now() : millis);
};

const getFirebaseErrorMessage = (stage: string, error: unknown): string => {
  if (error instanceof Error) {
    return `${stage}: ${error.message}`;
  }

  return `${stage}: Operation failed`;
};

const buildFileMetadataFromStorage = async (
  storagePath: string,
  userId: string,
  isPublic = false
): Promise<FileMetadata> => {
  const fileRef = ref(storage, storagePath);
  const [metadata, downloadURL] = await Promise.all([
    getMetadata(fileRef),
    getDownloadURL(fileRef),
  ]);

  const category = getCategoryFromPath(storagePath);

  return {
    id: storagePath,
    userId,
    fileName: metadata.name || getOriginalNameFromPath(storagePath),
    fileType: metadata.contentType || "application/octet-stream",
    fileSize: metadata.size,
    storagePath,
    downloadURL,
    category,
    uploadedAt: toTimestamp(metadata.timeCreated),
    updatedAt: toTimestamp(metadata.updated || metadata.timeCreated),
    isPublic,
  };
};

export const uploadFile = (
  file: File,
  category: StorageCategory,
  _description?: string,
  _tags?: string[],
  isPublic: boolean = false,
  onProgress?: (progress: UploadProgress) => void
): Promise<FileMetadata> => {
  return new Promise((resolve, reject) => {
    try {
      const currentUser = requireCurrentUser();

      if (!validateFileType(file, category)) {
        reject(
          new Error(
            `File type not allowed for ${category}. Allowed: ${ALLOWED_MIME_TYPES[category].join(", ")}`
          )
        );
        return;
      }

      if (!validateFileSize(file, category)) {
        reject(
          new Error(
            `File size exceeds limit. Max: ${formatFileSize(FILE_SIZE_LIMITS[category])}`
          )
        );
        return;
      }

      const storagePath = generateStoragePath(
        currentUser.uid,
        category,
        file.name
      );
      const storageRef = ref(storage, storagePath);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          onProgress?.({
            loaded: snapshot.bytesTransferred,
            total: snapshot.totalBytes,
            percentage: Math.round(
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            ),
          });
        },
        (error) => {
          reject(new Error(getFirebaseErrorMessage("Storage upload failed", error)));
        },
        async () => {
          try {
            resolve(await buildFileMetadataFromStorage(storagePath, currentUser.uid, isPublic));
          } catch (error) {
            reject(new Error(getFirebaseErrorMessage("Storage metadata read failed", error)));
          }
        }
      );
    } catch (error) {
      reject(error);
    }
  });
};

export const deleteFile = async (fileMetadata: FileMetadata): Promise<void> => {
  const currentUser = requireCurrentUser();
  if (fileMetadata.userId !== currentUser.uid) {
    throw new Error("Unauthorized: Cannot delete this file");
  }

  await deleteObject(ref(storage, fileMetadata.storagePath));
};

export const replaceFile = async (
  oldFile: FileMetadata,
  newFile: File,
  onProgress?: (progress: UploadProgress) => void
): Promise<FileMetadata> => {
  await deleteFile(oldFile);
  return uploadFile(newFile, oldFile.category, undefined, undefined, false, onProgress);
};

export const getUserFiles = async (
  category?: StorageCategory
): Promise<FileMetadata[]> => {
  const currentUser = requireCurrentUser();
  const categories = category ? [category] : STORAGE_CATEGORIES;
  const files: FileMetadata[] = [];

  await Promise.all(
    categories.map(async (categoryName) => {
      const folderRef = ref(storage, `users/${currentUser.uid}/${categoryName}`);
      const result = await listAll(folderRef);
      const categoryFiles = await Promise.all(
        result.items.map((item) =>
          buildFileMetadataFromStorage(item.fullPath, currentUser.uid)
        )
      );
      files.push(...categoryFiles);
    })
  );

  return files.sort((a, b) => b.uploadedAt.toMillis() - a.uploadedAt.toMillis());
};

export const getPublicFiles = async (
  category: StorageCategory
): Promise<FileMetadata[]> => {
  return getUserFiles(category);
};

export const updateFileMetadata = async (): Promise<void> => {
  throw new Error("Storage-only files do not support editable metadata yet");
};

export const searchFiles = async (
  searchTerm: string,
  category?: StorageCategory
): Promise<FileMetadata[]> => {
  const files = await getUserFiles(category);
  const lowerSearchTerm = searchTerm.toLowerCase();

  return files.filter((file) =>
    file.fileName.toLowerCase().includes(lowerSearchTerm)
  );
};

export const getFileDownloadURL = async (
  fileMetadata: FileMetadata
): Promise<string> => {
  const currentUser = requireCurrentUser();
  if (fileMetadata.userId !== currentUser.uid) {
    throw new Error("Unauthorized: Cannot access this file");
  }

  if (fileMetadata.downloadURL) return fileMetadata.downloadURL;
  return getDownloadURL(ref(storage, fileMetadata.storagePath));
};

export const getStorageStats = async (): Promise<{
  totalSize: number;
  fileCount: number;
  byCategory: Record<StorageCategory, { size: number; count: number }>;
}> => {
  const files = await getUserFiles();
  let totalSize = 0;
  const byCategory: Record<StorageCategory, { size: number; count: number }> = {
    documents: { size: 0, count: 0 },
    images: { size: 0, count: 0 },
    datasets: { size: 0, count: 0 },
    temp: { size: 0, count: 0 },
  };

  files.forEach((file) => {
    totalSize += file.fileSize;
    byCategory[file.category].size += file.fileSize;
    byCategory[file.category].count += 1;
  });

  return {
    totalSize,
    fileCount: files.length,
    byCategory,
  };
};
