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
  const [error, setError] = useState<string | null>(null);

  async function onDelete() {
    const confirmed = window.confirm(
      `Eliminare ${name}? Questa azione non si può annullare.`,
    );
    if (!confirmed) {
      return;
    }
    setPending(true);
    setError(null);
    try {
      const result = await deleteClient(clientId);
      if (result?.error) {
        setError(result.error);
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={onDelete}
        disabled={pending}
        className="rounded-lg px-3 py-2 text-sm font-medium text-red-800 hover:bg-red-50 disabled:opacity-70"
      >
        {pending ? "Eliminazione…" : "Elimina"}
      </button>
      {error ? (
        <p className="text-sm text-red-800" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
