"use client";

import { ignoreAppointment, linkAppointmentToClient } from "@/app/(app)/abbinamenti/actions";
import { suggestedNameFromTitle } from "@/lib/match-appointment";

type ClientOption = {
  id: string;
  firstName: string;
  lastName: string;
};

export function LinkAppointmentForm({
  appointmentId,
  title,
  clients,
}: {
  appointmentId: string;
  title: string;
  clients: ClientOption[];
}) {
  const link = linkAppointmentToClient.bind(null, appointmentId);
  const ignore = ignoreAppointment.bind(null, appointmentId);
  const suggestedName = suggestedNameFromTitle(title);
  const suggested = new URLSearchParams();
  if (suggestedName.firstName) {
    suggested.set("nome", suggestedName.firstName);
  }
  if (suggestedName.lastName) {
    suggested.set("cognome", suggestedName.lastName);
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
      {clients.length > 0 ? (
        <form action={link} className="flex min-w-0 flex-1 gap-2">
          <select
            name="clientId"
            required
            className="min-w-0 flex-1 rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900"
            defaultValue=""
          >
            <option value="" disabled>
              Scegli un cliente
            </option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.firstName} {client.lastName}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="rounded-lg bg-emerald-900 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-800"
          >
            Abbina
          </button>
        </form>
      ) : (
        <p className="text-sm text-stone-600">Nessun cliente in anagrafica.</p>
      )}
      <a
        href={`/clienti/nuovo?${suggested.toString()}`}
        className="text-sm font-medium text-emerald-900 hover:underline"
      >
        Nuovo cliente
      </a>
      <form action={ignore}>
        <button type="submit" className="text-sm font-medium text-stone-600 hover:underline">
          Ignora
        </button>
      </form>
    </div>
  );
}
