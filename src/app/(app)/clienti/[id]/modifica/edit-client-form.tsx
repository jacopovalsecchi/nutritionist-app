"use client";

import { useActionState } from "react";
import { updateClient, type ClientActionState } from "@/app/(app)/clienti/actions";
import { ClientForm } from "@/components/client-form";

type ClientValues = {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  reminderNote: string;
  internalNotes: string;
};

export function EditClientForm({ client }: { client: ClientValues }) {
  const boundUpdate = updateClient.bind(null, client.id);
  const [state, action, pending] = useActionState<ClientActionState, FormData>(
    boundUpdate,
    null,
  );

  return (
    <ClientForm
      action={action}
      pending={pending}
      error={state?.error ?? null}
      values={client}
      submitLabel="Salva modifiche"
    />
  );
}
