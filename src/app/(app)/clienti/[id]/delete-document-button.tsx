"use client";

import { useState } from "react";
import { deleteClientDocument } from "@/app/(app)/clienti/[id]/documents-actions";

export function DeleteDocumentButton({
  clientId,
  documentId,
  name,
}: {
  clientId: string;
  documentId: string;
  name: string;
}) {
  const [pending, setPending] = useState(false);

  async function onDelete() {
    const confirmed = window.confirm(`Eliminare «${name}»?`);
    if (!confirmed) {
      return;
    }
    setPending(true);
    try {
      await deleteClientDocument(clientId, documentId);
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={onDelete}
      disabled={pending}
      className="text-sm font-medium text-red-800 hover:underline disabled:opacity-70"
    >
      {pending ? "Eliminazione…" : "Elimina"}
    </button>
  );
}
