-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN     "clientId" TEXT,
ADD COLUMN     "matchSource" TEXT NOT NULL DEFAULT 'auto',
ADD COLUMN     "matchStatus" TEXT NOT NULL DEFAULT 'unmatched';

-- CreateIndex
CREATE INDEX "Appointment_matchStatus_startAt_idx" ON "Appointment"("matchStatus", "startAt");

-- CreateIndex
CREATE INDEX "Appointment_clientId_startAt_idx" ON "Appointment"("clientId", "startAt");

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;
