/**
 * In-memory store for File object references.
 *
 * File objects cannot be persisted to localStorage, so this store
 * maintains references in memory for video preview across modal sessions.
 *
 * Intentionally lost on page refresh - use thumbnail fallback for stale uploads.
 */
const fileReferences = new Map<string, File>();

export const fileReferenceStore = {
  /**
   * Store a file reference for an upload
   */
  set(uploadId: string, file: File): void {
    fileReferences.set(uploadId, file);
  },

  /**
   * Get a file reference by upload ID
   */
  get(uploadId: string): File | undefined {
    return fileReferences.get(uploadId);
  },

  /**
   * Remove a file reference
   */
  remove(uploadId: string): void {
    fileReferences.delete(uploadId);
  },

  /**
   * Check if a file reference exists
   */
  has(uploadId: string): boolean {
    return fileReferences.has(uploadId);
  },

  /**
   * Clear all file references
   */
  clear(): void {
    fileReferences.clear();
  },
};
