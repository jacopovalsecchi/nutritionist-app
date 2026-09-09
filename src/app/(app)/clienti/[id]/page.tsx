import Link from "next/link";
import { notFound } from "next/navigation";
import { ClientAppointmentTimeline } from "./client-appointment-timeline";
import { DeleteClientButton } from "./delete-client-button";
import { DocumentHistory } from "./document-history";
import { UploadDocumentForm } from "./upload-document-form";
import { clientDisplayName } from "@/lib/client-form";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <dt className="text-sm font-medium text-stone-500">{label}</dt>
      <dd className="whitespace-pre-wrap text-stone-900">{value || "—"}</dd>
    </div>
  );
}

export default async function ClientePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      documents: { orderBy: { createdAt: "desc" } },
      appointments: { orderBy: { startAt: "desc" } },
    },
  });
  if (!client) {
    notFound();
  }

  const name = clientDisplayName(client);
  const now = new Date();
  const upcoming = client.appointments
    .filter((appointment) => appointment.startAt >= now)
    .sort((a, b) => a.startAt.getTime() - b.startAt.getTime());
  const past = client.appointments.filter((appointment) => appointment.startAt < now);

  return (
    <section className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link href="/clienti" className="text-sm text-emerald-900 hover:underline">
            ← Clienti
          </Link>
          <h1 className="mt-2 text-2xl font-semibold text-stone-900">{name}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/clienti/${client.id}/modifica`}
            className="rounded-lg bg-emerald-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-800"
          >
            Modifica
          </Link>
          <DeleteClientButton clientId={client.id} name={name} />
        </div>
      </div>

      <dl className="grid max-w-xl gap-6 rounded-2xl border border-stone-200 bg-white p-6">
        <Detail label="Telefono WhatsApp" value={client.phone} />
        <Detail label="Nota reminder" value={client.reminderNote} />
        <Detail label="Note interne" value={client.internalNotes} />
      </dl>

      <div className="grid max-w-2xl gap-6 rounded-2xl border border-stone-200 bg-white p-6">
        <div>
          <h2 className="text-lg font-semibold text-stone-900">Appuntamenti</h2>
          <p className="mt-1 text-sm text-stone-600">
            Storico e prossime visite abbinate da iCloud.
          </p>
        </div>
        <ClientAppointmentTimeline
          upcoming={upcoming}
          past={past}
          phone={client.phone}
          reminderNote={client.reminderNote}
        />
      </div>

      <div className="grid max-w-2xl gap-6 rounded-2xl border border-stone-200 bg-white p-6">
        <div>
          <h2 className="text-lg font-semibold text-stone-900">File</h2>
          <p className="mt-1 text-sm text-stone-600">
            Piani, referti e altri documenti. Restano privati, solo tu puoi scaricarli.
          </p>
        </div>
        <UploadDocumentForm clientId={client.id} />
        <DocumentHistory clientId={client.id} documents={client.documents} />
      </div>
    </section>
  );
}
