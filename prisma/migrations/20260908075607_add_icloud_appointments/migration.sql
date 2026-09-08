-- CreateTable
CREATE TABLE "Setting" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "icloudAppleId" TEXT NOT NULL DEFAULT '',
    "icloudPasswordEnc" TEXT NOT NULL DEFAULT '',
    "calendarUrl" TEXT NOT NULL DEFAULT '',
    "calendarDisplayName" TEXT NOT NULL DEFAULT '',
    "lastSyncAt" TIMESTAMP(3),
    "lastSyncError" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "Setting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Appointment" (
    "id" TEXT NOT NULL,
    "calendarUrl" TEXT NOT NULL,
    "icalUid" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "startAt" TIMESTAMP(3) NOT NULL,
    "endAt" TIMESTAMP(3) NOT NULL,
    "location" TEXT NOT NULL DEFAULT '',
    "notes" TEXT NOT NULL DEFAULT '',
    "isAllDay" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Appointment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Appointment_startAt_idx" ON "Appointment"("startAt");

-- CreateIndex
CREATE UNIQUE INDEX "Appointment_calendarUrl_icalUid_startAt_key" ON "Appointment"("calendarUrl", "icalUid", "startAt");
