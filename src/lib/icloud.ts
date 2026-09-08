import ical, { type VEvent } from "node-ical";
import { createDAVClient, type DAVCalendar } from "tsdav";

export const ICLOUD_CALDAV_URL = "https://caldav.icloud.com";
export const SYNC_PAST_DAYS = 30;
export const SYNC_FUTURE_DAYS = 90;

export type IcloudCalendar = {
  url: string;
  name: string;
};

export type ParsedAppointment = {
  icalUid: string;
  title: string;
  startAt: Date;
  endAt: Date;
  location: string;
  notes: string;
  isAllDay: boolean;
};

function icsText(value: unknown) {
  if (typeof value === "string") {
    return value.trim();
  }
  if (value && typeof value === "object" && "val" in value) {
    return String((value as { val?: unknown }).val ?? "").trim();
  }
  return "";
}

export function calendarDisplayName(calendar: DAVCalendar) {
  const name = icsText(calendar.displayName);
  return name || calendar.url;
}

function mapIcloudError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  if (/401|unauthorized|not authorized|401 Unauthorized/i.test(message)) {
    return "Apple ID o password per app non corretti.";
  }
  if (/timeout|aborted|network|fetch|ENOTFOUND|ECONN/i.test(message)) {
    return "Impossibile raggiungere iCloud. Controlla la connessione e riprova.";
  }
  return "Connessione a iCloud non riuscita. Controlla le credenziali e riprova.";
}

async function createClient(appleId: string, password: string) {
  return createDAVClient({
    serverUrl: ICLOUD_CALDAV_URL,
    credentials: {
      username: appleId,
      password,
    },
    authMethod: "Basic",
    defaultAccountType: "caldav",
    fetchOptions: {
      signal: AbortSignal.timeout(25000),
    },
  });
}

export async function listIcloudCalendars(appleId: string, password: string) {
  try {
    const client = await createClient(appleId, password);
    const calendars = await client.fetchCalendars();
    return calendars
      .filter((calendar) => !calendar.components || calendar.components.includes("VEVENT"))
      .map((calendar) => ({
        url: calendar.url,
        name: calendarDisplayName(calendar),
      }))
      .sort((a, b) => a.name.localeCompare(b.name, "it"));
  } catch (error) {
    throw new Error(mapIcloudError(error));
  }
}

function toDate(value: Date | undefined, fallback: Date) {
  return value instanceof Date && !Number.isNaN(value.getTime()) ? value : fallback;
}

function parseCalendarObject(ics: string, rangeStart: Date, rangeEnd: Date): ParsedAppointment[] {
  const parsed = ical.sync.parseICS(ics);
  const appointments: ParsedAppointment[] = [];

  for (const component of Object.values(parsed)) {
    if (!component || component.type !== "VEVENT") {
      continue;
    }
    const event = component as VEvent;
    if (event.status === "CANCELLED") {
      continue;
    }

    const base = {
      icalUid: String(event.uid ?? "").trim(),
      title: icsText(event.summary) || "(Senza titolo)",
      location: icsText(event.location),
      notes: icsText(event.description),
    };
    if (!base.icalUid) {
      continue;
    }

    if (event.rrule) {
      const instances = ical.expandRecurringEvent(event, {
        from: rangeStart,
        to: rangeEnd,
      });
      for (const instance of instances) {
        appointments.push({
          ...base,
          startAt: instance.start,
          endAt: instance.end,
          isAllDay: instance.isFullDay,
        });
      }
      continue;
    }

    const startAt = toDate(event.start, rangeStart);
    const endAt = toDate(event.end, startAt);
    appointments.push({
      ...base,
      startAt,
      endAt,
      isAllDay: event.datetype === "date",
    });
  }

  return appointments;
}

export async function fetchIcloudAppointments(
  appleId: string,
  password: string,
  calendarUrl: string,
) {
  const rangeStart = new Date();
  rangeStart.setHours(0, 0, 0, 0);
  rangeStart.setDate(rangeStart.getDate() - SYNC_PAST_DAYS);
  const rangeEnd = new Date();
  rangeEnd.setHours(23, 59, 59, 999);
  rangeEnd.setDate(rangeEnd.getDate() + SYNC_FUTURE_DAYS);

  try {
    const client = await createClient(appleId, password);
    const calendars = await client.fetchCalendars();
    const calendar = calendars.find((item) => item.url === calendarUrl);
    if (!calendar) {
      throw new Error("Calendario non trovato. Sceglilo di nuovo nelle impostazioni.");
    }

    const objects = await client.fetchCalendarObjects({
      calendar,
      expand: true,
      timeRange: {
        start: rangeStart.toISOString(),
        end: rangeEnd.toISOString(),
      },
    });

    const appointments: ParsedAppointment[] = [];
    for (const object of objects) {
      if (!object.data) {
        continue;
      }
      appointments.push(...parseCalendarObject(object.data, rangeStart, rangeEnd));
    }
    return { appointments, rangeStart, rangeEnd };
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("Calendario non trovato")) {
      throw error;
    }
    throw new Error(mapIcloudError(error));
  }
}

export function formatAppointmentWhen(startAt: Date, endAt: Date, isAllDay: boolean) {
  if (isAllDay) {
    return new Intl.DateTimeFormat("it-IT", { dateStyle: "full" }).format(startAt);
  }
  const date = new Intl.DateTimeFormat("it-IT", { dateStyle: "full" }).format(startAt);
  const start = new Intl.DateTimeFormat("it-IT", { timeStyle: "short" }).format(startAt);
  const end = new Intl.DateTimeFormat("it-IT", { timeStyle: "short" }).format(endAt);
  return `${date}, ${start}–${end}`;
}

export function formatSyncTime(date: Date) {
  return new Intl.DateTimeFormat("it-IT", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}
