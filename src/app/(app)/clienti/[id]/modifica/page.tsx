import Link from "next/link";
import { notFound } from "next/navigation";
import { EditClientForm } from "./edit-client-form";
import { clientDisplayName, toDateInputValue } from "@/lib/client-form";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ModificaClientePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const client = await prisma.client.findUnique({ where: { id } });
  if (!client) {
    notFound();
  }

  return (
    <section className="space-y-6">
      <div>
        <Link
          href={`/clienti/${client.id}`}
          className="text-sm text-emerald-900 hover:underline"
        >
          ← {clientDisplayName(client)}
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-stone-900">Modifica cliente</h1>
      </div>
      <EditClientForm
        client={{
          id: client.id,
          firstName: client.firstName,
          lastName: client.lastName,
          phone: client.phone,
          birthDate: toDateInputValue(client.birthDate),
          address: client.address,
          city: client.city,
          postalCode: client.postalCode,
          reminderNote: client.reminderNote,
          internalNotes: client.internalNotes,
        }}
      />
    </section>
  );
}
