"use server";

import { revalidatePath } from "next/cache";
import { buildReminderPreview, reminderBodyParameters } from "@/lib/reminder-preview";
import { getWhatsappCredentials, sendReminderTemplate } from "@/lib/whatsapp";
import { prisma } from "@/lib/prisma";

export type ReminderActionState = { error: string } | { ok: true; message: string } | null;

export async function sendTestReminder(clientId: string): Promise<ReminderActionState> {
  const credentials = await getWhatsappCredentials();
  if (!credentials) {
    return { error: "Collega WhatsApp dalle impostazioni prima di inviare." };
  }

  const client = await prisma.client.findUnique({
    where: { id: clientId },
    include: {
      appointments: {
        where: { startAt: { gte: new Date() } },
        orderBy: { startAt: "asc" },
        take: 1,
      },
    },
  });
  if (!client) {
    return { error: "Cliente non trovato." };
  }

  const upcoming = client.appointments[0] ?? null;
  const preview = buildReminderPreview(client, upcoming);
  const parameters = reminderBodyParameters(preview);

  try {
    await sendReminderTemplate({
      credentials,
      toPhone: client.phone,
      bodyParameters: parameters,
    });
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Invio WhatsApp non riuscito." };
  }

  revalidatePath(`/clienti/${clientId}`);
  return {
    ok: true,
    message: preview.usesSampleWhen
      ? `Reminder di prova inviato a ${client.phone} (data e ora di esempio).`
      : `Reminder di prova inviato a ${client.phone}.`,
  };
}
