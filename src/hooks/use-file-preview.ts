/**
 * File Preview Hooks
 *
 * Hooks for managing file preview URLs with automatic cleanup.
 * Handles ObjectURL creation and revocation to prevent memory leaks.
 */

import { useCallback, useEffect, useRef, useState } from 'react';

interface FilePreviewState {
  file: File | null;
  previewUrl: string | null;
}

interface FilePreviewActions {
  setFile: (file: File | null) => void;
  clearFile: () => void;
}

/**
 * Hook for managing a single file preview with auto-cleanup
 *
 * @returns File state and actions
 */
export function useFilePreview(): FilePreviewState & FilePreviewActions {
  const [file, setFileState] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const previewUrlRef = useRef<string | null>(null);

  const revokeUrl = useCallback(() => {
    if (previewUrlRef.current) {
      try {
        URL.revokeObjectURL(previewUrlRef.current);
      } catch {
        // Ignore errors during cleanup
      }
      previewUrlRef.current = null;
    }
  }, []);

  const setFile = useCallback(
    (newFile: File | null) => {
      // Revoke previous URL
      revokeUrl();

      if (newFile) {
        const url = URL.createObjectURL(newFile);
        previewUrlRef.current = url;
        setPreviewUrl(url);
        setFileState(newFile);
      } else {
        setPreviewUrl(null);
        setFileState(null);
      }
    },
    [revokeUrl]
  );

  const clearFile = useCallback(() => {
    setFile(null);
  }, [setFile]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      revokeUrl();
    };
  }, [revokeUrl]);

  return {
    file,
    previewUrl,
    setFile,
    clearFile,
  };
}

interface MultiFilePreviewState {
  files: File[];
  previewUrls: string[];
}

interface MultiFilePreviewActions {
  addFiles: (files: File[]) => void;
  removeFile: (index: number) => void;
  clearFiles: () => void;
}

/**
 * Hook for managing multiple file previews with auto-cleanup
 *
 * @param maxFiles - Maximum number of files allowed (default: 4)
 * @returns Files state and actions
 */
export function useMultiFilePreview(maxFiles = 4): MultiFilePreviewState & MultiFilePreviewActions {
  const [files, setFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const previewUrlsRef = useRef<string[]>([]);

  const revokeUrl = useCallback((url: string) => {
    try {
      URL.revokeObjectURL(url);
    } catch {
      // Ignore errors during cleanup
    }
    const idx = previewUrlsRef.current.indexOf(url);
    if (idx >= 0) {
      previewUrlsRef.current.splice(idx, 1);
    }
  }, []);

  const revokeAllUrls = useCallback(() => {
    for (const url of previewUrlsRef.current) {
      try {
        URL.revokeObjectURL(url);
      } catch {
        // Ignore errors during cleanup
      }
    }
    previewUrlsRef.current = [];
  }, []);

  const addFiles = useCallback(
    (newFiles: File[]) => {
      const remainingSlots = maxFiles - files.length;
      const filesToAdd = newFiles.slice(0, remainingSlots);

      if (filesToAdd.length === 0) return;

      const newUrls = filesToAdd.map((file) => {
        const url = URL.createObjectURL(file);
        previewUrlsRef.current.push(url);
        return url;
      });

      setFiles((prev) => [...prev, ...filesToAdd].slice(0, maxFiles));
      setPreviewUrls((prev) => [...prev, ...newUrls].slice(0, maxFiles));
    },
    [files.length, maxFiles]
  );

  const removeFile = useCallback(
    (index: number) => {
      setFiles((prev) => prev.filter((_, i) => i !== index));
      setPreviewUrls((prev) => {
        const urlToRemove = prev[index];
        if (urlToRemove) {
          revokeUrl(urlToRemove);
        }
        return prev.filter((_, i) => i !== index);
      });
    },
    [revokeUrl]
  );

  const clearFiles = useCallback(() => {
    revokeAllUrls();
    setFiles([]);
    setPreviewUrls([]);
  }, [revokeAllUrls]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      revokeAllUrls();
    };
  }, [revokeAllUrls]);

  return {
    files,
    previewUrls,
    addFiles,
    removeFile,
    clearFiles,
  };
}
