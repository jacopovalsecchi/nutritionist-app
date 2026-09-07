import Link from "next/link";
import { clientDisplayName } from "@/lib/client-form";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function matchesQuery(
  client: { firstName: string; lastName: string; phone: string },
  query: string,
) {
  if (!query) {
    return true;
  }
  const haystack = `${client.firstName} ${client.lastName} ${client.phone}`.toLowerCase();
  return haystack.includes(query.toLowerCase());
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
            Anagrafica per i reminder WhatsApp. I file arriveranno nello step successivo.
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
            placeholder="Nome o telefono"
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
        <ul className="divide-y divide-stone-200 overflow-hidden rounded-2xl border border-stone-200 bg-white">
          {visible.map((client) => (
            <li key={client.id}>
              <Link
                href={`/clienti/${client.id}`}
                className="flex flex-col gap-1 px-4 py-4 hover:bg-stone-50 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium text-stone-900">{clientDisplayName(client)}</p>
                  <p className="text-sm text-stone-600">{client.phone}</p>
                </div>
                {client.reminderNote ? (
                  <p className="text-sm text-stone-500 sm:max-w-xs sm:text-right">
                    {client.reminderNote}
                  </p>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
