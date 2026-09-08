import { prisma } from "@/lib/prisma";

export async function getSettings() {
  return prisma.setting.upsert({
    where: { id: "default" },
    create: { id: "default" },
    update: {},
  });
}
