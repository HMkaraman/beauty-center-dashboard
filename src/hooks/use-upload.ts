"use client";

import { useState } from "react";
import { uploadFileApi } from "@/lib/api/upload";

export function useUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = async (file: File, folder?: string) => {
    setIsUploading(true);
    setError(null);
    try {
      const result = await uploadFileApi(file, folder);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed";
      setError(message);
      throw err;
    } finally {
      setIsUploading(false);
    }
  };

  return { upload, isUploading, error };
}
