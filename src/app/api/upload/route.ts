import { NextRequest } from "next/server";
import {
  getAuthSession,
  unauthorized,
  badRequest,
  success,
  serverError,
} from "@/lib/api-utils";
import { uploadFile } from "@/lib/storage";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
  "video/mp4",
];

const VIDEO_TYPES = ["video/mp4"];

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const folder = (formData.get("folder") as string) || "general";

    if (!file) return badRequest("No file provided");
    if (!ALLOWED_TYPES.includes(file.type))
      return badRequest("Invalid file type");

    const maxSize = VIDEO_TYPES.includes(file.type) ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
    if (file.size > maxSize) {
      const limitMB = maxSize / (1024 * 1024);
      return badRequest(`File too large (max ${limitMB}MB)`);
    }

    const result = await uploadFile(file, folder);
    return success(result, 201);
  } catch (error) {
    console.error("POST /api/upload error:", error);
    return serverError();
  }
}
