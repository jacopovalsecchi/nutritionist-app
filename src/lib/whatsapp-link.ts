const TIME_ZONE = "Europe/Rome";

export function toWhatsappNumber(phone: string) {
  return phone.replace(/^\+/, "").replace(/\D/g, "");
}

export function reminderWhatsappText(
  startAt: Date,
  isAllDay: boolean,
  reminderNote = "",
) {
  const date = new Intl.DateTimeFormat("it-IT", {
    timeZone: TIME_ZONE,
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(startAt);

  let text = isAllDay
    ? `Ti ricordo il tuo appuntamento in data ${date}`
    : `Ti ricordo il tuo appuntamento in data ${date} alle ${new Intl.DateTimeFormat("it-IT", {
        timeZone: TIME_ZONE,
        hour: "2-digit",
        minute: "2-digit",
      }).format(startAt)}`;

  const note = reminderNote.replace(/\s+/g, " ").trim();
  if (note) {
    text += `. ${note}`;
  }
  return text;
}

export function whatsappReminderHref(
  phone: string,
  startAt: Date,
  isAllDay: boolean,
  reminderNote = "",
) {
  const number = toWhatsappNumber(phone);
  if (!/^[1-9]\d{7,14}$/.test(number)) {
    return null;
  }
  return `https://wa.me/${number}?text=${encodeURIComponent(
    reminderWhatsappText(startAt, isAllDay, reminderNote),
  )}`;
}
