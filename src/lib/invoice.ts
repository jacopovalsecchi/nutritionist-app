export function formatEuroFromCents(cents: number) {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}

export function formatInvoiceIssueDate(date: Date) {
  return new Intl.DateTimeFormat("it-IT", {
    timeZone: "UTC",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export function formatInvoiceAppointmentWhen(startAt: Date, isAllDay: boolean) {
  const date = new Intl.DateTimeFormat("it-IT", {
    timeZone: "Europe/Rome",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(startAt);
  if (isAllDay) {
    return date;
  }
  const time = new Intl.DateTimeFormat("it-IT", {
    timeZone: "Europe/Rome",
    hour: "2-digit",
    minute: "2-digit",
  }).format(startAt);
  return `${date}, ${time}`;
}
