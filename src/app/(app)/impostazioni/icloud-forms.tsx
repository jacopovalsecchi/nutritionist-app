"use client";

import { useActionState } from "react";
import {
  saveIcloudCredentials,
  saveSelectedCalendar,
  type SettingsActionState,
} from "@/app/(app)/impostazioni/actions";

const inputClassName =
  "w-full rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-stone-900 outline-none ring-emerald-800/20 focus:border-emerald-800 focus:ring-4";

function ActionMessage({ state }: { state: SettingsActionState }) {
  if (!state) {
    return null;
  }
  if ("error" in state) {
    return (
      <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
        {state.error}
      </p>
    );
  }
  if (state.message) {
    return (
      <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-900">{state.message}</p>
    );
  }
  return null;
}

export function IcloudCredentialsForm({
  appleId,
  hasPassword,
}: {
  appleId: string;
  hasPassword: boolean;
}) {
  const [state, action, pending] = useActionState<SettingsActionState, FormData>(
    saveIcloudCredentials,
    null,
  );

  return (
    <form action={action} className="space-y-4">
      <label className="block space-y-1.5">
        <span className="text-sm font-medium text-stone-700">Apple ID</span>
        <input
          name="icloudAppleId"
          type="email"
          required
          defaultValue={appleId}
          autoComplete="username"
          className={inputClassName}
        />
      </label>
      <label className="block space-y-1.5">
        <span className="text-sm font-medium text-stone-700">Password per app</span>
        <input
          name="icloudPassword"
          type="password"
          required={!hasPassword}
          autoComplete="current-password"
          placeholder={hasPassword ? "Lascia vuoto per non cambiarla" : "xxxx-xxxx-xxxx-xxxx"}
          className={inputClassName}
        />
        <span className="text-xs text-stone-500">
          Su account.apple.com → Accesso e sicurezza → Password per app. Non è la password
          dell’Apple ID.
        </span>
      </label>
      <ActionMessage state={state} />
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-emerald-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-70"
      >
        {pending ? "Verifica in corso…" : hasPassword ? "Aggiorna collegamento" : "Collega iCloud"}
      </button>
    </form>
  );
}

export function CalendarSelectForm({
  calendars,
  selectedUrl,
}: {
  calendars: { url: string; name: string }[];
  selectedUrl: string;
}) {
  const [state, action, pending] = useActionState<SettingsActionState, FormData>(
    saveSelectedCalendar,
    null,
  );

  return (
    <form action={action} className="space-y-4">
      <label className="block space-y-1.5">
        <span className="text-sm font-medium text-stone-700">Calendario da leggere</span>
        <select name="calendarUrl" defaultValue={selectedUrl} className={inputClassName} required>
          <option value="">Scegli un calendario</option>
          {calendars.map((calendar) => (
            <option key={calendar.url} value={calendar.url}>
              {calendar.name}
            </option>
          ))}
        </select>
        <span className="text-xs text-stone-500">
          Usa un calendario dedicato, es. Pazienti, così non importi gli eventi personali.
        </span>
      </label>
      <ActionMessage state={state} />
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-emerald-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-70"
      >
        {pending ? "Salvataggio…" : "Salva calendario"}
      </button>
    </form>
  );
}
