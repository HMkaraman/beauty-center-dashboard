export async function uploadFileApi(
  file: File,
  folder?: string
): Promise<{ url: string; filename: string; mimeType: string }> {
  const formData = new FormData();
  formData.append("file", file);
  if (folder) formData.append("folder", folder);

  const res = await fetch("/api/upload", {
    method: "POST",
    body: formData,
    // Don't set Content-Type — browser sets it with boundary for FormData
  });

  if (!res.ok) {
    const error = await res
      .json()
      .catch(() => ({ error: "Upload failed" }));
    throw new Error(error.error || "Upload failed");
  }

  return res.json();
}
