import { LinkAppointmentForm } from "./link-appointment-form";
import { RecalculateMatchesButton, UnlinkAppointmentButton } from "./match-buttons";
import { formatAppointmentWhen } from "@/lib/icloud";
import { rematchEligibleAppointments } from "@/lib/rematch-appointments";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AbbinamentiPage() {
  await rematchEligibleAppointments();
  const [unmatched, ignored, clients] = await Promise.all([
    prisma.appointment.findMany({
      where: { matchStatus: "unmatched" },
      orderBy: { startAt: "asc" },
    }),
    prisma.appointment.findMany({
      where: { matchStatus: "ignored" },
      orderBy: { startAt: "desc" },
    }),
    prisma.client.findMany({
      select: { id: true, firstName: true, lastName: true },
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    }),
  ]);

  return (
    <section className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-stone-900">Da abbinare</h1>
          <p className="mt-1 text-sm text-stone-600">
            Titolo calendario: <span className="font-medium">Nome Cognome</span> oppure{" "}
            <span className="font-medium">Nome Cognome — tipo</span>. Il resto va abbinato a mano.
          </p>
        </div>
        <RecalculateMatchesButton />
      </div>

      {unmatched.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-stone-300 bg-white px-6 py-10 text-stone-700">
          Nessun evento da abbinare.
        </div>
      ) : (
        <ul className="divide-y divide-stone-200 overflow-hidden rounded-2xl border border-stone-200 bg-white">
          {unmatched.map((appointment) => (
            <li key={appointment.id} className="space-y-3 px-4 py-4">
              <div>
                <p className="font-medium text-stone-900">{appointment.title}</p>
                <p className="text-sm text-stone-600">
                  {formatAppointmentWhen(
                    appointment.startAt,
                    appointment.endAt,
                    appointment.isAllDay,
                  )}
                </p>
              </div>
              <LinkAppointmentForm
                appointmentId={appointment.id}
                title={appointment.title}
                clients={clients}
              />
            </li>
          ))}
        </ul>
      )}

      {ignored.length > 0 ? (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-stone-900">Ignorati</h2>
          <ul className="divide-y divide-stone-200 overflow-hidden rounded-2xl border border-stone-200 bg-white">
            {ignored.map((appointment) => (
              <li key={appointment.id} className="flex flex-col gap-2 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium text-stone-900">{appointment.title}</p>
                  <p className="text-sm text-stone-600">
                    {formatAppointmentWhen(
                      appointment.startAt,
                      appointment.endAt,
                      appointment.isAllDay,
                    )}
                  </p>
                </div>
                <UnlinkAppointmentButton appointmentId={appointment.id} />
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
