"use client";

import { useState } from "react";
import { deleteClient } from "@/app/(app)/clienti/actions";

export function DeleteClientButton({
  clientId,
  name,
}: {
  clientId: string;
  name: string;
}) {
  const [pending, setPending] = useState(false);

  async function onDelete() {
    const confirmed = window.confirm(
      `Eliminare ${name}? Questa azione non si può annullare.`,
    );
    if (!confirmed) {
      return;
    }
    setPending(true);
    try {
      await deleteClient(clientId);
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={onDelete}
      disabled={pending}
      className="rounded-lg px-3 py-2 text-sm font-medium text-red-800 hover:bg-red-50 disabled:opacity-70"
    >
      {pending ? "Eliminazione…" : "Elimina"}
    </button>
  );
}
