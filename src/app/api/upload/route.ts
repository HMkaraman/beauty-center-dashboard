import { NextRequest } from "next/server";
import {
  getAuthSession,
  unauthorized,
  badRequest,
  success,
  serverError,
} from "@/lib/api-utils";
import { uploadFile } from "@/lib/storage";

const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
];

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const folder = (formData.get("folder") as string) || "general";

    if (!file) return badRequest("No file provided");
    if (file.size > MAX_SIZE) return badRequest("File too large (max 5MB)");
    if (!ALLOWED_TYPES.includes(file.type))
      return badRequest("Invalid file type");

    const result = await uploadFile(file, folder);
    return success(result, 201);
  } catch (error) {
    console.error("POST /api/upload error:", error);
    return serverError();
  }
}
