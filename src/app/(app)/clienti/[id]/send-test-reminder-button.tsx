"use client";

import { useState } from "react";
import { sendTestReminder } from "@/app/(app)/clienti/[id]/whatsapp-actions";

export function SendTestReminderButton({
  clientId,
  clientName,
  phone,
}: {
  clientId: string;
  clientName: string;
  phone: string;
}) {
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onClick() {
    const confirmed = window.confirm(
      `Inviare un reminder WhatsApp di prova a ${clientName} (${phone})? Il messaggio parte subito.`,
    );
    if (!confirmed) {
      return;
    }
    setPending(true);
    setMessage(null);
    setError(null);
    try {
      const result = await sendTestReminder(clientId);
      if (result && "error" in result) {
        setError(result.error);
      } else if (result?.message) {
        setMessage(result.message);
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={onClick}
        disabled={pending}
        className="rounded-lg bg-emerald-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-70"
      >
        {pending ? "Invio in corso…" : "Invia reminder di prova"}
      </button>
      {error ? (
        <p className="text-sm text-red-800" role="alert">
          {error}
        </p>
      ) : null}
      {message ? <p className="text-sm text-emerald-900">{message}</p> : null}
    </div>
  );
}
