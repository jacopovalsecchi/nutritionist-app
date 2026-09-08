import { matchTitleToClients } from "@/lib/match-appointment";
import { prisma } from "@/lib/prisma";

export async function rematchEligibleAppointments() {
  const clients = await prisma.client.findMany({
    select: { id: true, firstName: true, lastName: true },
  });
  const appointments = await prisma.appointment.findMany({
    where: {
      OR: [
        { matchStatus: "unmatched" },
        { matchStatus: "matched", matchSource: "auto" },
      ],
    },
    select: { id: true, title: true, clientId: true, matchStatus: true },
  });

  for (const appointment of appointments) {
    const result = matchTitleToClients(appointment.title, clients);
    if (result.type === "unique") {
      if (appointment.clientId !== result.clientId || appointment.matchStatus !== "matched") {
        await prisma.appointment.update({
          where: { id: appointment.id },
          data: {
            clientId: result.clientId,
            matchStatus: "matched",
            matchSource: "auto",
          },
        });
      }
      continue;
    }
    if (appointment.clientId || appointment.matchStatus !== "unmatched") {
      await prisma.appointment.update({
        where: { id: appointment.id },
        data: {
          clientId: null,
          matchStatus: "unmatched",
          matchSource: "auto",
        },
      });
    }
  }
}
