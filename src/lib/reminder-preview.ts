const TIME_ZONE = "Europe/Rome";
const EMPTY_NOTE = "—";

export type ReminderAppointment = {
  startAt: Date;
  isAllDay: boolean;
  title: string;
};

export type ReminderPreview = {
  firstName: string;
  date: string;
  time: string;
  note: string;
  usesSampleWhen: boolean;
  appointmentTitle: string | null;
};

export function sanitizeTemplateParam(value: string, fallback = EMPTY_NOTE) {
  const cleaned = value.replace(/[\r\n\t]+/g, " ").replace(/\s+/g, " ").trim();
  if (!cleaned) {
    return fallback;
  }
  return cleaned.slice(0, 1024);
}

export function formatReminderDate(date: Date) {
  return new Intl.DateTimeFormat("it-IT", {
    timeZone: TIME_ZONE,
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function formatReminderTime(date: Date, isAllDay: boolean) {
  if (isAllDay) {
    return "tutto il giorno";
  }
  return new Intl.DateTimeFormat("it-IT", {
    timeZone: TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function buildReminderPreview(
  client: { firstName: string; reminderNote: string },
  appointment: ReminderAppointment | null,
): ReminderPreview {
  if (!appointment) {
    return {
      firstName: sanitizeTemplateParam(client.firstName, "Cliente"),
      date: "data di prova",
      time: "ora di prova",
      note: sanitizeTemplateParam(client.reminderNote),
      usesSampleWhen: true,
      appointmentTitle: null,
    };
  }

  return {
    firstName: sanitizeTemplateParam(client.firstName, "Cliente"),
    date: formatReminderDate(appointment.startAt),
    time: formatReminderTime(appointment.startAt, appointment.isAllDay),
    note: sanitizeTemplateParam(client.reminderNote),
    usesSampleWhen: false,
    appointmentTitle: appointment.title,
  };
}

export function reminderBodyParameters(preview: ReminderPreview) {
  return [preview.firstName, preview.date, preview.time, preview.note];
}
