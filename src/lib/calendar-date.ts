export const APP_TIME_ZONE = "Europe/Rome";

export function calendarDateKey(date: Date, timeZone = APP_TIME_ZONE) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function addCalendarDays(dateKey: string, days: number) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const shifted = new Date(Date.UTC(year ?? 0, (month ?? 1) - 1, (day ?? 1) + days));
  return shifted.toISOString().slice(0, 10);
}

export function formatCalendarRange(startKey: string, endKey: string) {
  const format = (key: string) => {
    const [year, month, day] = key.split("-").map(Number);
    return new Intl.DateTimeFormat("it-IT", {
      timeZone: "UTC",
      day: "numeric",
      month: "long",
    }).format(new Date(Date.UTC(year ?? 0, (month ?? 1) - 1, day ?? 1)));
  };
  if (startKey === endKey) {
    return format(startKey);
  }
  return `${format(startKey)} – ${format(endKey)}`;
}
