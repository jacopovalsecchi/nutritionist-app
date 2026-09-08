"use client";

import { useActionState } from "react";
import { createClient, type ClientActionState } from "@/app/(app)/clienti/actions";
import { ClientForm } from "@/components/client-form";

export function NewClientForm({
  firstName = "",
  lastName = "",
}: {
  firstName?: string;
  lastName?: string;
}) {
  const [state, action, pending] = useActionState<ClientActionState, FormData>(
    createClient,
    null,
  );

  return (
    <ClientForm
      action={action}
      pending={pending}
      error={state?.error ?? null}
      values={{ firstName, lastName }}
      submitLabel="Crea cliente"
    />
  );
}
