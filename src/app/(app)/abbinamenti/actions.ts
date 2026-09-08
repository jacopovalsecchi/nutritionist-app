"use server";

import { revalidatePath } from "next/cache";
import { rematchEligibleAppointments } from "@/lib/rematch-appointments";
import { prisma } from "@/lib/prisma";

async function revalidateMatchViews(clientIds: Array<string | null | undefined> = []) {
  revalidatePath("/dashboard");
  revalidatePath("/abbinamenti");
  revalidatePath("/clienti");
  for (const clientId of clientIds) {
    if (clientId) {
      revalidatePath(`/clienti/${clientId}`);
    }
  }
}

export async function linkAppointmentToClient(appointmentId: string, formData: FormData) {
  const clientId = String(formData.get("clientId") ?? "").trim();
  if (!clientId) {
    return;
  }
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    select: { clientId: true },
  });
  if (!appointment) {
    return;
  }
  const client = await prisma.client.findUnique({
    where: { id: clientId },
    select: { id: true },
  });
  if (!client) {
    return;
  }

  await prisma.appointment.update({
    where: { id: appointmentId },
    data: {
      clientId,
      matchStatus: "matched",
      matchSource: "manual",
    },
  });
  await revalidateMatchViews([appointment.clientId, clientId]);
}

export async function ignoreAppointment(appointmentId: string) {
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    select: { clientId: true },
  });
  if (!appointment) {
    return;
  }
  await prisma.appointment.update({
    where: { id: appointmentId },
    data: {
      clientId: null,
      matchStatus: "ignored",
      matchSource: "manual",
    },
  });
  await revalidateMatchViews([appointment.clientId]);
}

export async function unlinkAppointment(appointmentId: string) {
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    select: { clientId: true },
  });
  if (!appointment) {
    return;
  }
  await prisma.appointment.update({
    where: { id: appointmentId },
    data: {
      clientId: null,
      matchStatus: "unmatched",
      matchSource: "auto",
    },
  });
  await rematchEligibleAppointments();
  await revalidateMatchViews([appointment.clientId]);
}

export async function recalculateMatches() {
  await rematchEligibleAppointments();
  await revalidateMatchViews();
}
