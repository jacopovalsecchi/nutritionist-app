import type { ReactNode } from "react";
import Link from "next/link";
import { clientDisplayName, clientInitials } from "@/lib/client-form";
import { formatAppointmentWhen } from "@/lib/icloud";
import { whatsappReminderHref } from "@/lib/whatsapp-link";
import { WhatsappReminderButton } from "@/components/whatsapp-reminder-button";

type DashboardAppointment = {
  id: string;
  title: string;
  startAt: Date;
  endAt: Date;
  isAllDay: boolean;
  location: string;
  client: {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
    reminderNote: string;
  } | null;
};

function Cell({ children, muted = false }: { children: ReactNode; muted?: boolean }) {
  return (
    <td
      className={`px-5 py-4 text-sm ${muted ? "text-stone-500" : "text-stone-700"}`}
    >
      {children}
    </td>
  );
}

export function DashboardAppointmentTable({
  appointments,
  empty,
}: {
  appointments: DashboardAppointment[];
  empty: string;
}) {
  if (appointments.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-stone-300 bg-white px-6 py-12 text-center text-stone-700">
        {empty}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-stone-200 bg-white">
      <table className="min-w-full text-left">
        <thead>
          <tr className="border-b border-stone-100">
            <th className="px-5 py-3 text-sm font-medium text-stone-500">Appuntamento</th>
            <th className="px-5 py-3 text-sm font-medium text-stone-500">Cliente</th>
            <th className="px-5 py-3 text-sm font-medium text-stone-500">Data e ora</th>
            <th className="px-5 py-3 text-sm font-medium text-stone-500">Promemoria</th>
          </tr>
        </thead>
        <tbody>
          {appointments.map((appointment) => {
            const whatsappHref = appointment.client
              ? whatsappReminderHref(
                  appointment.client.firstName,
                  appointment.client.phone,
                  appointment.startAt,
                  appointment.isAllDay,
                  appointment.client.reminderNote,
                )
              : null;
            return (
              <tr
                key={appointment.id}
                className="border-b border-stone-100 last:border-b-0 hover:bg-stone-50"
              >
                <td className="px-5 py-4">
                  <p className="font-semibold text-stone-900">{appointment.title}</p>
                  {appointment.location ? (
                    <p className="mt-0.5 text-sm text-stone-500">{appointment.location}</p>
                  ) : null}
                </td>
                <td className="px-5 py-4">
                  {appointment.client ? (
                    <Link
                      href={`/clienti/${appointment.client.id}`}
                      className="flex items-center gap-3"
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-stone-100 text-sm font-semibold text-stone-700">
                        {clientInitials(appointment.client)}
                      </span>
                      <span className="font-semibold text-stone-900 hover:underline">
                        {clientDisplayName(appointment.client)}
                      </span>
                    </Link>
                  ) : (
                    <Link
                      href="/abbinamenti"
                      className="text-sm font-medium text-amber-800 hover:underline"
                    >
                      Da abbinare
                    </Link>
                  )}
                </td>
                <Cell>
                  {formatAppointmentWhen(
                    appointment.startAt,
                    appointment.endAt,
                    appointment.isAllDay,
                  )}
                </Cell>
                <td className="px-5 py-4">
                  {whatsappHref ? <WhatsappReminderButton href={whatsappHref} /> : null}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
