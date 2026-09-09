import Link from "next/link";
import { clientDisplayName } from "@/lib/client-form";
import { formatAppointmentWhen, formatSyncTime } from "@/lib/icloud";
import { rematchEligibleAppointments } from "@/lib/rematch-appointments";
import { getSettings } from "@/lib/settings";
import { prisma } from "@/lib/prisma";
import { whatsappReminderHref } from "@/lib/whatsapp-link";
import { WhatsappReminderButton } from "@/components/whatsapp-reminder-button";
import { SyncCalendarButton } from "@/app/(app)/impostazioni/sync-buttons";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  await rematchEligibleAppointments();
  const settings = await getSettings();
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const appointments = settings.calendarUrl
    ? await prisma.appointment.findMany({
        where: {
          calendarUrl: settings.calendarUrl,
          startAt: { gte: startOfToday },
          matchStatus: { not: "ignored" },
        },
        include: { client: true },
        orderBy: { startAt: "asc" },
      })
    : [];

  const unmatchedCount = appointments.filter(
    (appointment) => appointment.matchStatus === "unmatched",
  ).length;

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-stone-900">Dashboard</h1>
          <p className="mt-1 text-sm text-stone-600">
            Prossimi appuntamenti dal calendario iCloud.
          </p>
        </div>
        {settings.calendarUrl ? <SyncCalendarButton /> : null}
      </div>

      {!settings.icloudPasswordEnc ? (
        <div className="rounded-2xl border border-dashed border-stone-300 bg-white px-6 py-10">
          <p className="text-stone-700">Collega iCloud per vedere gli appuntamenti.</p>
          <Link
            href="/impostazioni"
            className="mt-4 inline-flex rounded-lg bg-emerald-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-800"
          >
            Vai alle impostazioni
          </Link>
        </div>
      ) : !settings.calendarUrl ? (
        <div className="rounded-2xl border border-dashed border-stone-300 bg-white px-6 py-10">
          <p className="text-stone-700">Scegli il calendario Pazienti nelle impostazioni.</p>
          <Link
            href="/impostazioni"
            className="mt-4 inline-flex rounded-lg bg-emerald-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-800"
          >
            Scegli calendario
          </Link>
        </div>
      ) : (
        <>
          <p className="text-sm text-stone-500">
            {settings.calendarDisplayName}
            {settings.lastSyncAt ? ` · aggiornato ${formatSyncTime(settings.lastSyncAt)}` : ""}
          </p>
          {settings.lastSyncError ? (
            <p className="text-sm text-red-800">{settings.lastSyncError}</p>
          ) : null}

          {unmatchedCount > 0 ? (
            <Link
              href="/abbinamenti"
              className="block rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 hover:bg-amber-100"
            >
              {unmatchedCount === 1
                ? "1 appuntamento da abbinare a un cliente."
                : `${unmatchedCount} appuntamenti da abbinare a un cliente.`}
            </Link>
          ) : null}

          {appointments.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-stone-300 bg-white px-6 py-10 text-stone-700">
              Nessun evento futuro. Sincronizza, oppure controlla che gli appuntamenti siano sul
              calendario selezionato.
            </div>
          ) : (
            <ul className="divide-y divide-stone-200 overflow-hidden rounded-2xl border border-stone-200 bg-white">
              {appointments.map((appointment) => {
                const whatsappHref = appointment.client
                  ? whatsappReminderHref(
                      appointment.client.phone,
                      appointment.startAt,
                      appointment.isAllDay,
                      appointment.client.reminderNote,
                    )
                  : null;
                return (
                  <li
                    key={appointment.id}
                    className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-start sm:justify-between"
                  >
                    <div>
                      <p className="font-medium text-stone-900">{appointment.title}</p>
                      <p className="text-sm text-stone-600">
                        {formatAppointmentWhen(
                          appointment.startAt,
                          appointment.endAt,
                          appointment.isAllDay,
                        )}
                      </p>
                      {appointment.location ? (
                        <p className="text-sm text-stone-500">{appointment.location}</p>
                      ) : null}
                      {appointment.client ? (
                        <Link
                          href={`/clienti/${appointment.client.id}`}
                          className="mt-1 inline-block text-sm font-medium text-emerald-900 hover:underline"
                        >
                          {clientDisplayName(appointment.client)}
                        </Link>
                      ) : (
                        <Link
                          href="/abbinamenti"
                          className="mt-1 inline-block text-sm font-medium text-amber-800 hover:underline"
                        >
                          Da abbinare
                        </Link>
                      )}
                    </div>
                    {whatsappHref ? <WhatsappReminderButton href={whatsappHref} /> : null}
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}
    </section>
  );
}
