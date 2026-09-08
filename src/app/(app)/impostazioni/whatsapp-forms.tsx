"use client";

import { useActionState, useState } from "react";
import {
  disconnectWhatsapp,
  saveWhatsappCredentials,
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

export function WhatsappCredentialsForm({
  phoneNumberId,
  templateName,
  templateLang,
  hasToken,
  displayPhone,
}: {
  phoneNumberId: string;
  templateName: string;
  templateLang: string;
  hasToken: boolean;
  displayPhone: string;
}) {
  const [state, action, pending] = useActionState<SettingsActionState, FormData>(
    saveWhatsappCredentials,
    null,
  );

  return (
    <form action={action} className="space-y-4">
      {displayPhone ? (
        <p className="text-sm text-stone-600">Numero Business collegato: {displayPhone}</p>
      ) : null}
      <label className="block space-y-1.5">
        <span className="text-sm font-medium text-stone-700">Phone number ID</span>
        <input
          name="whatsappPhoneNumberId"
          required
          defaultValue={phoneNumberId}
          inputMode="numeric"
          autoComplete="off"
          className={inputClassName}
        />
        <span className="text-xs text-stone-500">
          In developers.facebook.com → la tua app → WhatsApp → Configurazione API.
        </span>
      </label>
      <label className="block space-y-1.5">
        <span className="text-sm font-medium text-stone-700">Token di accesso</span>
        <input
          name="whatsappToken"
          type="password"
          required={!hasToken}
          autoComplete="off"
          placeholder={hasToken ? "Lascia vuoto per non cambiarlo" : "Token permanente (system user)"}
          className={inputClassName}
        />
        <span className="text-xs text-stone-500">
          Non è il token temporaneo di prova. Crea un utente di sistema nel Business Manager e un
          token permanente. Non viene mai mostrato in chiaro.
        </span>
      </label>
      <label className="block space-y-1.5">
        <span className="text-sm font-medium text-stone-700">Nome template</span>
        <input
          name="whatsappTemplateName"
          required
          defaultValue={templateName}
          placeholder="promemoria_appuntamento"
          className={inputClassName}
        />
      </label>
      <label className="block space-y-1.5">
        <span className="text-sm font-medium text-stone-700">Lingua template</span>
        <input
          name="whatsappTemplateLang"
          required
          defaultValue={templateLang}
          placeholder="it"
          className={inputClassName}
        />
        <span className="text-xs text-stone-500">
          Template Utility in italiano, quattro variabili:{" "}
          <span className="font-medium">
            Ciao {"{{1}}"}, ti ricordo l’appuntamento del {"{{2}}"} alle {"{{3}}"}. {"{{4}}"}
          </span>
        </span>
      </label>
      <ActionMessage state={state} />
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-emerald-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-70"
      >
        {pending ? "Verifica in corso…" : hasToken ? "Aggiorna WhatsApp" : "Collega WhatsApp"}
      </button>
    </form>
  );
}

export function DisconnectWhatsappButton() {
  const [pending, setPending] = useState(false);

  async function onClick() {
    const confirmed = window.confirm("Scollegare WhatsApp? I reminder non potranno più essere inviati.");
    if (!confirmed) {
      return;
    }
    setPending(true);
    try {
      await disconnectWhatsapp();
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
      {pending ? "Disconnessione…" : "Scollega WhatsApp"}
    </button>
  );
}
