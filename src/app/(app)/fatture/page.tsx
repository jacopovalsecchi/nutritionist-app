import type { ReactNode } from "react";
import Link from "next/link";
import { clientDisplayName } from "@/lib/client-form";
import {
  formatEuroFromCents,
  formatInvoiceAppointmentWhen,
  formatInvoiceIssueDate,
} from "@/lib/invoice";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function matchesQuery(
  invoice: {
    number: string;
    client: { firstName: string; lastName: string };
  },
  query: string,
) {
  if (!query) {
    return true;
  }
  const haystack = `${invoice.number} ${invoice.client.firstName} ${invoice.client.lastName}`.toLowerCase();
  return haystack.includes(query.toLowerCase());
}

function Cell({
  children,
  muted = false,
  strong = false,
}: {
  children: ReactNode;
  muted?: boolean;
  strong?: boolean;
}) {
  return (
    <td
      className={`whitespace-nowrap px-5 py-4 text-sm ${
        strong ? "font-semibold text-stone-900" : muted ? "text-stone-500" : "text-stone-700"
      }`}
    >
      {children}
    </td>
  );
}

export default async function FatturePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";
  const invoices = await prisma.invoice.findMany({
    include: { client: true, appointment: true },
    orderBy: [{ issuedAt: "desc" }, { number: "desc" }],
  });
  const visible = invoices.filter((invoice) => matchesQuery(invoice, query));

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-stone-900">Fatture</h1>
        <p className="mt-1 text-sm text-stone-600">
          Elenco delle fatture emesse. La creazione arriverà dopo.
        </p>
      </div>

      <form className="flex max-w-md gap-2">
        <label className="block min-w-0 flex-1 space-y-1.5">
          <span className="text-sm font-medium text-stone-700">Cerca</span>
          <input
            name="q"
            defaultValue={query}
            placeholder="Numero o cliente"
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
            {invoices.length === 0
              ? "Non c’è ancora nessuna fattura."
              : "Nessun risultato per questa ricerca."}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-stone-200 bg-white">
          <table className="min-w-full text-left">
            <thead>
              <tr className="border-b border-stone-100">
                <th className="px-5 py-3 text-sm font-medium text-stone-500">Numero</th>
                <th className="px-5 py-3 text-sm font-medium text-stone-500">Data emissione</th>
                <th className="px-5 py-3 text-sm font-medium text-stone-500">Cliente</th>
                <th className="px-5 py-3 text-sm font-medium text-stone-500">Appuntamento</th>
                <th className="px-5 py-3 text-sm font-medium text-stone-500">Importo</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((invoice) => {
                const name = clientDisplayName(invoice.client);
                return (
                  <tr
                    key={invoice.id}
                    className="border-b border-stone-100 last:border-b-0 hover:bg-stone-50"
                  >
                    <Cell strong>{invoice.number}</Cell>
                    <Cell>{formatInvoiceIssueDate(invoice.issuedAt)}</Cell>
                    <td className="whitespace-nowrap px-5 py-4 text-sm">
                      <Link
                        href={`/clienti/${invoice.client.id}`}
                        className="font-semibold text-stone-900 hover:underline"
                      >
                        {name}
                      </Link>
                    </td>
                    <Cell muted={!invoice.appointment}>
                      {invoice.appointment
                        ? formatInvoiceAppointmentWhen(
                            invoice.appointment.startAt,
                            invoice.appointment.isAllDay,
                          )
                        : "—"}
                    </Cell>
                    <Cell strong>{formatEuroFromCents(invoice.totalCents)}</Cell>
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
