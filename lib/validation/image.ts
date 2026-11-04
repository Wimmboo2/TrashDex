import { crc32, inflateSync } from "node:zlib";
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

function unreadableImage(): AppError {
  return new AppError("UNREADABLE_IMAGE", 400, "Can't read this image.");
}

function jpegIsReadable(buffer: Buffer): boolean {
  if (buffer.length < 4 || buffer[0] !== 0xff || buffer[1] !== 0xd8) return false;

  let offset = 2;
  let sawFrame = false;
  let sawScan = false;

  while (offset < buffer.length) {
    if (buffer[offset] !== 0xff) return false;
    while (offset < buffer.length && buffer[offset] === 0xff) offset += 1;
    if (offset >= buffer.length) return false;

    const marker = buffer[offset];
    offset += 1;
    if (marker === 0xd9) return sawFrame && sawScan;
    if (marker === 0xd8 || marker === 0x00) return false;
    if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) continue;
    if (offset + 1 >= buffer.length) return false;

    const length = buffer.readUInt16BE(offset);
    if (length < 2 || offset + length > buffer.length) return false;

    const isFrame =
      (marker >= 0xc0 && marker <= 0xc3) ||
      (marker >= 0xc5 && marker <= 0xc7) ||
      (marker >= 0xc9 && marker <= 0xcb) ||
      (marker >= 0xcd && marker <= 0xcf);
    if (isFrame) {
      if (length < 8) return false;
      const height = buffer.readUInt16BE(offset + 3);
      const width = buffer.readUInt16BE(offset + 5);
      if (width === 0 || height === 0) return false;
      sawFrame = true;
    }

    if (marker === 0xda) {
      if (!sawFrame) return false;
      sawScan = true;
      offset += length;
      while (offset < buffer.length) {
        if (buffer[offset] !== 0xff) {
          offset += 1;
          continue;
        }
        const next = buffer[offset + 1];
        if (next === 0x00 || (next >= 0xd0 && next <= 0xd7)) {
          offset += 2;
          continue;
        }
        break;
      }
      continue;
    }

    offset += length;
  }

  return false;
}

function pngIsReadable(buffer: Buffer): boolean {
  if (buffer.length < 8) return false;

  let offset = 8;
  let sawHeader = false;
  const imageData: Buffer[] = [];

  while (offset + 12 <= buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const typeStart = offset + 4;
    const dataStart = offset + 8;
    const end = dataStart + length;
    if (end + 4 > buffer.length) return false;

    const type = buffer.toString("ascii", typeStart, dataStart);
    const expected = crc32(buffer.subarray(typeStart, end)) >>> 0;
    const actual = buffer.readUInt32BE(end);
    if (expected !== actual) return false;

    if (!sawHeader) {
      if (type !== "IHDR" || length !== 13) return false;
      const width = buffer.readUInt32BE(dataStart);
      const height = buffer.readUInt32BE(dataStart + 4);
      const depth = buffer[dataStart + 8];
      const color = buffer[dataStart + 9];
      if (width === 0 || height === 0) return false;
      if (depth !== 1 && depth !== 2 && depth !== 4 && depth !== 8 && depth !== 16) return false;
      if (color > 6 || color === 1 || color === 5) return false;
      sawHeader = true;
    } else if (type === "IHDR") {
      return false;
    }

    if (type === "IDAT") imageData.push(buffer.subarray(dataStart, end));
    if (type === "IEND") {
      if (length !== 0 || imageData.length === 0) return false;
      try {
        return inflateSync(Buffer.concat(imageData)).length > 0;
      } catch {
        return false;
      }
    }

    offset = end + 4;
  }

  return false;
}

function webpIsReadable(buffer: Buffer): boolean {
  if (buffer.length < 12) return false;
  if (buffer.toString("ascii", 0, 4) !== "RIFF" || buffer.toString("ascii", 8, 12) !== "WEBP") {
    return false;
  }
  if (buffer.readUInt32LE(4) + 8 !== buffer.length) return false;

  let offset = 12;
  let sawImage = false;
  while (offset + 8 <= buffer.length) {
    const tag = buffer.toString("ascii", offset, offset + 4);
    const size = buffer.readUInt32LE(offset + 4);
    const padded = size + (size & 1);
    if (offset + 8 + padded > buffer.length) return false;
    if (tag === "VP8 " || tag === "VP8L" || tag === "VP8X") sawImage = true;
    offset += 8 + padded;
  }

  return sawImage && offset === buffer.length;
}

function imageIsReadable(buffer: Buffer, mimeType: DetectedImage["mimeType"]): boolean {
  if (mimeType === "image/jpeg") return jpegIsReadable(buffer);
  if (mimeType === "image/png") return pngIsReadable(buffer);
  return webpIsReadable(buffer);
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

  if (!imageIsReadable(buffer, detected.mimeType)) throw unreadableImage();

  return { buffer, mimeType: detected.mimeType };
}
