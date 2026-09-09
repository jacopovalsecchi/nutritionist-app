import type { ReactNode } from "react";
import Link from "next/link";
import {
  clientDisplayName,
  clientInitials,
  formatBirthDate,
} from "@/lib/client-form";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function matchesQuery(
  client: {
    firstName: string;
    lastName: string;
    phone: string;
    address: string;
    city: string;
    postalCode: string;
  },
  query: string,
) {
  if (!query) {
    return true;
  }
  const haystack =
    `${client.firstName} ${client.lastName} ${client.phone} ${client.address} ${client.city} ${client.postalCode}`.toLowerCase();
  return haystack.includes(query.toLowerCase());
}

function Cell({ children, muted = false }: { children: ReactNode; muted?: boolean }) {
  return (
    <td
      className={`whitespace-nowrap px-5 py-4 text-sm ${muted ? "text-stone-500" : "text-stone-700"}`}
    >
      {children}
    </td>
  );
}

export default async function ClientiPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";
  const clients = await prisma.client.findMany({
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
  });
  const visible = clients.filter((client) => matchesQuery(client, query));

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-stone-900">Clienti</h1>
          <p className="mt-1 text-sm text-stone-600">
            Anagrafica e file per i reminder WhatsApp.
          </p>
        </div>
        <Link
          href="/clienti/nuovo"
          className="inline-flex items-center justify-center rounded-lg bg-emerald-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-800"
        >
          Nuovo cliente
        </Link>
      </div>

      <form className="flex max-w-md gap-2">
        <label className="block min-w-0 flex-1 space-y-1.5">
          <span className="text-sm font-medium text-stone-700">Cerca</span>
          <input
            name="q"
            defaultValue={query}
            placeholder="Nome, telefono o città"
            className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-stone-900 outline-none ring-emerald-800/20 focus:border-emerald-800 focus:ring-4"
          />
        </label>
        <button
          type="submit"
          className="mt-7 rounded-lg border border-stone-300 bg-white px-4 py-2.5 text-sm font-medium text-stone-800 hover:bg-stone-50"
        >
          Cerca
        </button>
      </form>

      {visible.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-stone-300 bg-white px-6 py-12 text-center">
          <p className="text-stone-700">
            {clients.length === 0
              ? "Non c’è ancora nessun cliente."
              : "Nessun risultato per questa ricerca."}
          </p>
          {clients.length === 0 ? (
            <Link
              href="/clienti/nuovo"
              className="mt-4 inline-flex rounded-lg bg-emerald-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-800"
            >
              Aggiungi il primo
            </Link>
          ) : null}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-stone-200 bg-white">
          <table className="min-w-full text-left">
            <thead>
              <tr className="border-b border-stone-100">
                <th className="px-5 py-3 text-sm font-medium text-stone-500">Nome</th>
                <th className="px-5 py-3 text-sm font-medium text-stone-500">Telefono</th>
                <th className="px-5 py-3 text-sm font-medium text-stone-500">Data di nascita</th>
                <th className="px-5 py-3 text-sm font-medium text-stone-500">Indirizzo</th>
                <th className="px-5 py-3 text-sm font-medium text-stone-500">Città</th>
                <th className="px-5 py-3 text-sm font-medium text-stone-500">CAP</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((client) => {
                const name = clientDisplayName(client);
                return (
                  <tr
                    key={client.id}
                    className="border-b border-stone-100 last:border-b-0 hover:bg-stone-50"
                  >
                    <td className="px-5 py-4">
                      <Link href={`/clienti/${client.id}`} className="flex items-center gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-stone-100 text-sm font-semibold text-stone-700">
                          {clientInitials(client)}
                        </span>
                        <span className="font-semibold text-stone-900 hover:underline">{name}</span>
                      </Link>
                    </td>
                    <Cell>{client.phone}</Cell>
                    <Cell muted={!client.birthDate}>
                      {formatBirthDate(client.birthDate) || "—"}
                    </Cell>
                    <Cell muted={!client.address}>{client.address || "—"}</Cell>
                    <Cell muted={!client.city}>{client.city || "—"}</Cell>
                    <Cell muted={!client.postalCode}>{client.postalCode || "—"}</Cell>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
