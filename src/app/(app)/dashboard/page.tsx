import Link from "next/link";
import { addCalendarDays, calendarDateKey, formatCalendarRange } from "@/lib/calendar-date";
import { formatSyncTime } from "@/lib/icloud";
import { rematchEligibleAppointments } from "@/lib/rematch-appointments";
import { getSettings } from "@/lib/settings";
import { prisma } from "@/lib/prisma";
import { SyncCalendarButton } from "@/app/(app)/impostazioni/sync-buttons";
import { DashboardAppointmentTable } from "./appointment-table";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  await rematchEligibleAppointments();
  const settings = await getSettings();
  const todayKey = calendarDateKey(new Date());
  const weekEndKey = addCalendarDays(todayKey, 7);
  const rangeStart = new Date(`${todayKey}T00:00:00.000Z`);
  rangeStart.setUTCHours(rangeStart.getUTCHours() - 14);
  const rangeEnd = new Date(`${weekEndKey}T23:59:59.999Z`);
  rangeEnd.setUTCHours(rangeEnd.getUTCHours() + 14);

  const appointments = settings.calendarUrl
    ? await prisma.appointment.findMany({
        where: {
          calendarUrl: settings.calendarUrl,
          startAt: { gte: rangeStart, lte: rangeEnd },
          matchStatus: { not: "ignored" },
        },
        include: { client: true },
        orderBy: { startAt: "asc" },
      })
    : [];

  const todayAppointments = appointments.filter(
    (appointment) => calendarDateKey(appointment.startAt) === todayKey,
  );
  const weekAppointments = appointments.filter((appointment) => {
    const key = calendarDateKey(appointment.startAt);
    return key > todayKey && key <= weekEndKey;
  });

  const unmatchedCount = settings.calendarUrl
    ? await prisma.appointment.count({
        where: {
          calendarUrl: settings.calendarUrl,
          startAt: { gte: rangeStart },
          matchStatus: "unmatched",
        },
      })
    : 0;

  return (
    <section className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-stone-900">Dashboard</h1>
          <p className="mt-1 text-sm text-stone-600">
            Appuntamenti di oggi e della prossima settimana, dal calendario iCloud.
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

          <section className="space-y-3">
            <div>
              <h2 className="text-lg font-semibold text-stone-900">Appuntamenti di oggi</h2>
              <p className="mt-1 text-sm text-stone-500">{formatCalendarRange(todayKey, todayKey)}</p>
            </div>
            <DashboardAppointmentTable
              appointments={todayAppointments}
              empty="Nessun appuntamento in agenda per oggi."
            />
          </section>

          <section className="space-y-3">
            <div>
              <h2 className="text-lg font-semibold text-stone-900">
                Appuntamenti della prossima settimana
              </h2>
              <p className="mt-1 text-sm text-stone-500">
                {formatCalendarRange(addCalendarDays(todayKey, 1), weekEndKey)}
              </p>
            </div>
            <DashboardAppointmentTable
              appointments={weekAppointments}
              empty="Nessun appuntamento nei prossimi sette giorni."
            />
          </section>
        </>
      )}
    </section>
  );
}
