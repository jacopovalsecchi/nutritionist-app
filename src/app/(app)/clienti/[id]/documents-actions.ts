"use server";

import { revalidatePath } from "next/cache";
import {
  deleteUploadFile,
  newDocumentId,
  saveUploadFile,
  storageKeyFor,
} from "@/lib/uploads";
import { validateUpload } from "@/lib/upload-types";
import { prisma } from "@/lib/prisma";

export type DocumentActionState = { error: string } | { ok: true } | null;

export async function uploadClientDocument(
  clientId: string,
  _prev: DocumentActionState,
  formData: FormData,
): Promise<DocumentActionState> {
  const client = await prisma.client.findUnique({
    where: { id: clientId },
    select: { id: true },
  });
  if (!client) {
    return { error: "Cliente non trovato." };
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { error: "Scegli un file da caricare." };
  }

  const validated = validateUpload(file);
  if (!validated.ok) {
    return { error: validated.error };
  }

  const rawLabel = formData.get("label");
  const label = typeof rawLabel === "string" ? rawLabel.trim() : "";
  const documentId = newDocumentId();
  const storageKey = storageKeyFor(clientId, documentId, validated.extension);
  const bytes = new Uint8Array(await file.arrayBuffer());

  await saveUploadFile(storageKey, bytes);

  try {
    await prisma.document.create({
      data: {
        id: documentId,
        clientId,
        originalName: file.name,
        mimeType: validated.mimeType,
        sizeBytes: file.size,
        storageKey,
        label,
      },
    });
  } catch (error) {
    await deleteUploadFile(storageKey);
    throw error;
  }

  revalidatePath(`/clienti/${clientId}`);
  return { ok: true };
}

export async function deleteClientDocument(clientId: string, documentId: string) {
  const document = await prisma.document.findFirst({
    where: { id: documentId, clientId },
  });
  if (!document) {
    return;
  }

  await deleteUploadFile(document.storageKey);
  await prisma.document.delete({ where: { id: document.id } });
  revalidatePath(`/clienti/${clientId}`);
}
