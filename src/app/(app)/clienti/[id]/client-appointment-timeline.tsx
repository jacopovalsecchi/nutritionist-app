import { formatAppointmentWhen } from "@/lib/icloud";
import { whatsappReminderHref } from "@/lib/whatsapp-link";
import { WhatsappReminderButton } from "@/components/whatsapp-reminder-button";
import { UnlinkAppointmentButton } from "@/app/(app)/abbinamenti/match-buttons";

type AppointmentItem = {
  id: string;
  title: string;
  startAt: Date;
  endAt: Date;
  isAllDay: boolean;
  location: string;
};

export function ClientAppointmentTimeline({
  upcoming,
  past,
  phone,
  reminderNote,
}: {
  upcoming: AppointmentItem[];
  past: AppointmentItem[];
  phone: string;
  reminderNote: string;
}) {
  if (upcoming.length === 0 && past.length === 0) {
    return (
      <p className="text-sm text-stone-600">
        Nessun appuntamento abbinato. Controlla il calendario o la coda Da abbinare.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <AppointmentGroup
        title="Prossimi"
        appointments={upcoming}
        empty="Nessun appuntamento in arrivo."
        phone={phone}
        reminderNote={reminderNote}
      />
      <AppointmentGroup
        title="Storico"
        appointments={past}
        empty="Nessun appuntamento passato."
        phone={phone}
        reminderNote={reminderNote}
      />
    </div>
  );
}

function AppointmentGroup({
  title,
  appointments,
  empty,
  phone,
  reminderNote,
}: {
  title: string;
  appointments: AppointmentItem[];
  empty: string;
  phone: string;
  reminderNote: string;
}) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-stone-500">{title}</h3>
      {appointments.length === 0 ? (
        <p className="text-sm text-stone-600">{empty}</p>
      ) : (
        <ul className="divide-y divide-stone-200 overflow-hidden rounded-xl border border-stone-200">
          {appointments.map((appointment) => {
            const whatsappHref = whatsappReminderHref(
              phone,
              appointment.startAt,
              appointment.isAllDay,
              reminderNote,
            );
            return (
              <li
                key={appointment.id}
                className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
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
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  {whatsappHref ? <WhatsappReminderButton href={whatsappHref} /> : null}
                  <UnlinkAppointmentButton appointmentId={appointment.id} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
