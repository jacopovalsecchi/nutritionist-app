import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { resolveStoragePath } from "@/lib/uploads";

export const runtime = "nodejs";

function contentDisposition(filename: string) {
  const ascii = filename.replace(/[^\x20-\x7E]/g, "_");
  const encoded = encodeURIComponent(filename);
  return `attachment; filename="${ascii}"; filename*=UTF-8''${encoded}`;
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ clientId: string; documentId: string }> },
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorizzato." }, { status: 401 });
  }

  const { clientId, documentId } = await context.params;
  const document = await prisma.document.findFirst({
    where: { id: documentId, clientId },
  });
  if (!document) {
    return NextResponse.json({ error: "File non trovato." }, { status: 404 });
  }

  try {
    const bytes = await readFile(resolveStoragePath(document.storageKey));
    return new NextResponse(bytes, {
      headers: {
        "Content-Type": document.mimeType,
        "Content-Length": String(document.sizeBytes),
        "Content-Disposition": contentDisposition(document.originalName),
        "Cache-Control": "private, no-store",
      },
    });
  } catch {
    return NextResponse.json({ error: "File non disponibile." }, { status: 404 });
  }
}
