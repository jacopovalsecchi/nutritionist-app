"use client";

import { useActionState, useEffect, useRef } from "react";
import {
  uploadClientDocument,
  type DocumentActionState,
} from "@/app/(app)/clienti/[id]/documents-actions";
import { describeAllowedFiles } from "@/lib/upload-types";

export function UploadDocumentForm({ clientId }: { clientId: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const boundUpload = uploadClientDocument.bind(null, clientId);
  const [state, action, pending] = useActionState<DocumentActionState, FormData>(
    boundUpload,
    null,
  );

  useEffect(() => {
    if (state && "ok" in state) {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <form ref={formRef} action={action} className="space-y-4">
      <label className="block space-y-1.5">
        <span className="text-sm font-medium text-stone-700">File</span>
        <input
          name="file"
          type="file"
          required
          className="block w-full text-sm text-stone-700 file:mr-3 file:rounded-lg file:border-0 file:bg-emerald-900 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-emerald-800"
        />
        <span className="text-xs text-stone-500">{describeAllowedFiles()}</span>
      </label>
      <label className="block space-y-1.5">
        <span className="text-sm font-medium text-stone-700">Etichetta (opzionale)</span>
        <input
          name="label"
          placeholder="Es. Piano alimentare aprile"
          className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-stone-900 outline-none ring-emerald-800/20 focus:border-emerald-800 focus:ring-4"
        />
      </label>
      {state && "error" in state ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
          {state.error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-emerald-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {pending ? "Caricamento…" : "Carica file"}
      </button>
    </form>
  );
}
