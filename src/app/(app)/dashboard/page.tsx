import Link from "next/link";
import { SyncCalendarButton } from "@/app/(app)/impostazioni/sync-buttons";
import { formatAppointmentWhen, formatSyncTime } from "@/lib/icloud";
import { getSettings } from "@/lib/settings";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const settings = await getSettings();
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const appointments = settings.calendarUrl
    ? await prisma.appointment.findMany({
        where: {
          calendarUrl: settings.calendarUrl,
          startAt: { gte: startOfToday },
        },
        orderBy: { startAt: "asc" },
      })
    : [];

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-stone-900">Dashboard</h1>
          <p className="mt-1 text-sm text-stone-600">
            Eventi grezzi dal calendario iCloud. L’abbinamento ai clienti arriverà nello step
            successivo.
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
          {appointments.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-stone-300 bg-white px-6 py-10 text-stone-700">
              Nessun evento futuro. Sincronizza, oppure controlla che gli appuntamenti siano sul
              calendario selezionato.
            </div>
          ) : (
            <ul className="divide-y divide-stone-200 overflow-hidden rounded-2xl border border-stone-200 bg-white">
              {appointments.map((appointment) => (
                <li key={appointment.id} className="px-4 py-4">
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
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </section>
  );
}
