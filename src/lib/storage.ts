import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";

const UPLOAD_DIR = process.env.UPLOAD_DIR || "public/uploads";
const UPLOAD_URL_PREFIX = process.env.UPLOAD_URL_PREFIX || "/uploads";

export async function uploadFile(
  file: File,
  folder: string = "general"
): Promise<{ url: string; filename: string }> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = path.extname(file.name) || ".bin";
  const filename = `${crypto.randomUUID()}${ext}`;
  const dir = path.join(process.cwd(), UPLOAD_DIR, folder);

  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, filename), buffer);

  return {
    url: `${UPLOAD_URL_PREFIX}/${folder}/${filename}`,
    filename,
  };
}

export async function deleteFile(url: string): Promise<void> {
  if (!url.startsWith(UPLOAD_URL_PREFIX)) return;
  const relativePath = url.replace(UPLOAD_URL_PREFIX, "");
  const fullPath = path.join(process.cwd(), UPLOAD_DIR, relativePath);

  try {
    const { unlink } = await import("fs/promises");
    await unlink(fullPath);
  } catch {
    // File may not exist
  }
}
