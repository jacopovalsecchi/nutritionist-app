"use server";

import { revalidatePath } from "next/cache";
import {
  fetchIcloudAppointments,
  listIcloudCalendars,
} from "@/lib/icloud";
import { decryptSecret, encryptSecret } from "@/lib/secret-box";
import { rematchEligibleAppointments } from "@/lib/rematch-appointments";
import { getSettings } from "@/lib/settings";
import { prisma } from "@/lib/prisma";

export type SettingsActionState = { error: string } | { ok: true; message?: string } | null;

function readString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

async function getIcloudCredentials() {
  const settings = await getSettings();
  if (!settings.icloudAppleId || !settings.icloudPasswordEnc) {
    return null;
  }
  return {
    appleId: settings.icloudAppleId,
    password: decryptSecret(settings.icloudPasswordEnc),
    settings,
  };
}

export async function saveIcloudCredentials(
  _prev: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  const appleId = readString(formData, "icloudAppleId");
  const password = readString(formData, "icloudPassword");
  const settings = await getSettings();

  if (!appleId) {
    return { error: "Inserisci l’Apple ID (di solito l’email iCloud)." };
  }
  const resolvedPassword = password || (settings.icloudPasswordEnc ? decryptSecret(settings.icloudPasswordEnc) : "");
  if (!resolvedPassword) {
    return { error: "Inserisci la password per app di iCloud." };
  }

  try {
    await listIcloudCalendars(appleId, resolvedPassword);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Connessione a iCloud non riuscita." };
  }

  await prisma.setting.update({
    where: { id: "default" },
    data: {
      icloudAppleId: appleId,
      icloudPasswordEnc: encryptSecret(resolvedPassword),
      lastSyncError: "",
    },
  });

  revalidatePath("/impostazioni");
  revalidatePath("/dashboard");
  return { ok: true, message: "iCloud collegato. Scegli il calendario Pazienti." };
}

export async function saveSelectedCalendar(
  _prev: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  const calendarUrl = readString(formData, "calendarUrl");
  if (!calendarUrl) {
    return { error: "Scegli un calendario." };
  }

  const credentials = await getIcloudCredentials();
  if (!credentials) {
    return { error: "Collega prima iCloud." };
  }

  let calendars;
  try {
    calendars = await listIcloudCalendars(credentials.appleId, credentials.password);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Connessione a iCloud non riuscita." };
  }

  const selected = calendars.find((calendar) => calendar.url === calendarUrl);
  if (!selected) {
    return { error: "Calendario non trovato. Ricollega iCloud e riprova." };
  }

  const previousUrl = credentials.settings.calendarUrl;
  await prisma.setting.update({
    where: { id: "default" },
    data: {
      calendarUrl: selected.url,
      calendarDisplayName: selected.name,
      lastSyncError: "",
    },
  });

  if (previousUrl && previousUrl !== selected.url) {
    await prisma.appointment.deleteMany({ where: { calendarUrl: previousUrl } });
  }

  revalidatePath("/impostazioni");
  revalidatePath("/dashboard");
  return { ok: true, message: `Calendario «${selected.name}» salvato.` };
}

export async function syncIcloudCalendar(): Promise<SettingsActionState> {
  const credentials = await getIcloudCredentials();
  if (!credentials) {
    return { error: "Collega iCloud dalle impostazioni." };
  }
  if (!credentials.settings.calendarUrl) {
    return { error: "Scegli un calendario dalle impostazioni." };
  }

  try {
    const { appointments, rangeStart, rangeEnd } = await fetchIcloudAppointments(
      credentials.appleId,
      credentials.password,
      credentials.settings.calendarUrl,
    );

    await prisma.$transaction(async (tx) => {
      for (const appointment of appointments) {
        await tx.appointment.upsert({
          where: {
            calendarUrl_icalUid_startAt: {
              calendarUrl: credentials.settings.calendarUrl,
              icalUid: appointment.icalUid,
              startAt: appointment.startAt,
            },
          },
          create: {
            calendarUrl: credentials.settings.calendarUrl,
            icalUid: appointment.icalUid,
            title: appointment.title,
            startAt: appointment.startAt,
            endAt: appointment.endAt,
            location: appointment.location,
            notes: appointment.notes,
            isAllDay: appointment.isAllDay,
          },
          update: {
            title: appointment.title,
            endAt: appointment.endAt,
            location: appointment.location,
            notes: appointment.notes,
            isAllDay: appointment.isAllDay,
          },
        });
      }

      const incoming = new Set(
        appointments.map(
          (appointment) => `${appointment.icalUid}|${appointment.startAt.toISOString()}`,
        ),
      );
      const existing = await tx.appointment.findMany({
        where: {
          calendarUrl: credentials.settings.calendarUrl,
          startAt: { gte: rangeStart, lte: rangeEnd },
        },
        select: { id: true, icalUid: true, startAt: true },
      });
      const staleIds = existing
        .filter((row) => !incoming.has(`${row.icalUid}|${row.startAt.toISOString()}`))
        .map((row) => row.id);
      if (staleIds.length > 0) {
        await tx.appointment.deleteMany({ where: { id: { in: staleIds } } });
      }
    });

    await rematchEligibleAppointments();

    await prisma.setting.update({
      where: { id: "default" },
      data: {
        lastSyncAt: new Date(),
        lastSyncError: "",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Sincronizzazione non riuscita.";
    await prisma.setting.update({
      where: { id: "default" },
      data: { lastSyncError: message },
    });
    revalidatePath("/impostazioni");
    revalidatePath("/dashboard");
    revalidatePath("/abbinamenti");
    return { error: message };
  }

  revalidatePath("/impostazioni");
  revalidatePath("/dashboard");
  revalidatePath("/abbinamenti");
  revalidatePath("/clienti");
  return { ok: true, message: "Calendario sincronizzato." };
}

export async function disconnectIcloud(): Promise<SettingsActionState> {
  await prisma.$transaction([
    prisma.appointment.deleteMany(),
    prisma.setting.update({
      where: { id: "default" },
      data: {
        icloudAppleId: "",
        icloudPasswordEnc: "",
        calendarUrl: "",
        calendarDisplayName: "",
        lastSyncAt: null,
        lastSyncError: "",
      },
    }),
  ]);
  revalidatePath("/impostazioni");
  revalidatePath("/dashboard");
  revalidatePath("/abbinamenti");
  return { ok: true, message: "iCloud scollegato." };
}
