import { config } from "@/lib/config";
import { AppError } from "@/lib/errors";

export type DetectedImage = {
  mimeType: "image/jpeg" | "image/png" | "image/webp";
  extension: "jpg" | "png" | "webp";
};

export function detectImageType(buffer: Buffer): DetectedImage | null {
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { mimeType: "image/jpeg", extension: "jpg" };
  }

  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return { mimeType: "image/png", extension: "png" };
  }

  if (
    buffer.length >= 12 &&
    buffer.toString("ascii", 0, 4) === "RIFF" &&
    buffer.toString("ascii", 8, 12) === "WEBP"
  ) {
    return { mimeType: "image/webp", extension: "webp" };
  }

  return null;
}

export async function readValidatedImage(file: File): Promise<{
  buffer: Buffer;
  mimeType: DetectedImage["mimeType"];
}> {
  if (file.size > config.maxImageBytes) {
    throw new AppError(
      "FILE_TOO_LARGE",
      413,
      `That image is too large. Use an image under ${Math.round(config.maxImageBytes / 1024 / 1024)} MB.`,
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  if (buffer.length > config.maxImageBytes) {
    throw new AppError(
      "FILE_TOO_LARGE",
      413,
      `That image is too large. Use an image under ${Math.round(config.maxImageBytes / 1024 / 1024)} MB.`,
    );
  }

  const detected = detectImageType(buffer);
  if (!detected) {
    throw new AppError(
      "UNSUPPORTED_TYPE",
      415,
      "Use a JPEG, PNG, or WebP image. On iPhone, set Camera > Formats > Most Compatible if you see a HEIC error.",
    );
  }

  return { buffer, mimeType: detected.mimeType };
}
