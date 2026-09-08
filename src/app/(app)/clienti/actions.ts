"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { parseClientForm } from "@/lib/client-form";
import { rematchEligibleAppointments } from "@/lib/rematch-appointments";
import { prisma } from "@/lib/prisma";
import { deleteClientUploads } from "@/lib/uploads";

export type ClientActionState = { error: string } | null;

function uniquePhoneError(error: unknown) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  );
}

export async function createClient(
  _prev: ClientActionState,
  formData: FormData,
): Promise<ClientActionState> {
  const parsed = parseClientForm(formData);
  if (!parsed.ok) {
    return { error: parsed.error };
  }

  try {
    const client = await prisma.client.create({ data: parsed.data });
    await rematchEligibleAppointments();
    revalidatePath("/clienti");
    revalidatePath("/dashboard");
    revalidatePath("/abbinamenti");
    redirect(`/clienti/${client.id}`);
  } catch (error) {
    if (uniquePhoneError(error)) {
      return { error: "Esiste già un cliente con questo numero di telefono." };
    }
    throw error;
  }
}

export async function updateClient(
  clientId: string,
  _prev: ClientActionState,
  formData: FormData,
): Promise<ClientActionState> {
  const parsed = parseClientForm(formData);
  if (!parsed.ok) {
    return { error: parsed.error };
  }

  try {
    await prisma.client.update({
      where: { id: clientId },
      data: parsed.data,
    });
    await rematchEligibleAppointments();
    revalidatePath("/clienti");
    revalidatePath(`/clienti/${clientId}`);
    revalidatePath("/dashboard");
    revalidatePath("/abbinamenti");
    redirect(`/clienti/${clientId}`);
  } catch (error) {
    if (uniquePhoneError(error)) {
      return { error: "Esiste già un cliente con questo numero di telefono." };
    }
    throw error;
  }
}

export async function deleteClient(clientId: string) {
  await prisma.appointment.updateMany({
    where: { clientId },
    data: {
      clientId: null,
      matchStatus: "unmatched",
      matchSource: "auto",
    },
  });
  await deleteClientUploads(clientId);
  await prisma.client.delete({ where: { id: clientId } });
  revalidatePath("/clienti");
  revalidatePath("/dashboard");
  revalidatePath("/abbinamenti");
  redirect("/clienti");
}
