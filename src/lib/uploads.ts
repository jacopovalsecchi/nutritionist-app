import { mkdir, rm, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

export function getUploadsRoot() {
  const configured = process.env.UPLOAD_DIR?.trim();
  const root = path.resolve(configured && configured.length > 0 ? configured : "uploads");
  return root;
}

export function resolveStoragePath(storageKey: string) {
  const root = getUploadsRoot();
  const resolved = path.resolve(root, storageKey);
  const prefix = root.endsWith(path.sep) ? root : `${root}${path.sep}`;
  if (resolved !== root && !resolved.startsWith(prefix)) {
    throw new Error("Percorso file non valido.");
  }
  return resolved;
}

export function newDocumentId() {
  return randomUUID().replace(/-/g, "");
}

export function storageKeyFor(clientId: string, documentId: string, extension: string) {
  return `${clientId}/${documentId}${extension}`;
}

export async function saveUploadFile(storageKey: string, bytes: Uint8Array) {
  const absolute = resolveStoragePath(storageKey);
  await mkdir(path.dirname(absolute), { recursive: true });
  await writeFile(absolute, bytes);
}

export async function deleteUploadFile(storageKey: string) {
  try {
    await unlink(resolveStoragePath(storageKey));
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      return;
    }
    throw error;
  }
}

export async function deleteClientUploads(clientId: string) {
  const directory = resolveStoragePath(clientId);
  await rm(directory, { recursive: true, force: true });
}
