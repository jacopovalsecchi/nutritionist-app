"use client";

import { useState } from "react";
import {
  disconnectIcloud,
  syncIcloudCalendar,
} from "@/app/(app)/impostazioni/actions";

export function SyncCalendarButton({ label = "Sincronizza ora" }: { label?: string }) {
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onClick() {
    setPending(true);
    setMessage(null);
    setError(null);
    try {
      const result = await syncIcloudCalendar();
      if (result && "error" in result) {
        setError(result.error);
      } else if (result && result.message) {
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
        {pending ? "Sincronizzazione…" : label}
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

export function DisconnectIcloudButton() {
  const [pending, setPending] = useState(false);

  async function onClick() {
    const confirmed = window.confirm(
      "Scollegare iCloud? Gli eventi già sincronizzati verranno rimossi dall’app, non dal calendario Apple.",
    );
    if (!confirmed) {
      return;
    }
    setPending(true);
    try {
      await disconnectIcloud();
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      className="text-sm font-medium text-red-800 hover:underline disabled:opacity-70"
    >
      {pending ? "Disconnessione…" : "Scollega iCloud"}
    </button>
  );
}
