import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";

const UPLOAD_DIR = process.env.UPLOAD_DIR || "public/uploads";
const UPLOAD_URL_PREFIX = process.env.UPLOAD_URL_PREFIX || "/uploads";

const COMPRESSIBLE_TYPES = ["image/jpeg", "image/png"];

export async function uploadFile(
  file: File,
  folder: string = "general"
): Promise<{ url: string; filename: string; mimeType: string }> {
  const rawBuffer = Buffer.from(await file.arrayBuffer());
  let fileBuffer: Buffer = rawBuffer;
  let ext = path.extname(file.name) || ".bin";
  let mimeType = file.type;

  if (COMPRESSIBLE_TYPES.includes(file.type)) {
    try {
      const sharp = (await import("sharp")).default;
      fileBuffer = await sharp(rawBuffer).webp({ quality: 80 }).toBuffer();
      ext = ".webp";
      mimeType = "image/webp";
    } catch {
      // If sharp fails, fall through and save the original file
    }
  }

  const filename = `${crypto.randomUUID()}${ext}`;
  const dir = path.join(process.cwd(), UPLOAD_DIR, folder);

  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, filename), fileBuffer);

  return {
    url: `${UPLOAD_URL_PREFIX}/${folder}/${filename}`,
    filename,
    mimeType,
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
