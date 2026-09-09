-- AlterTable
ALTER TABLE "Client" ADD COLUMN     "address" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "birthDate" DATE,
ADD COLUMN     "city" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "postalCode" TEXT NOT NULL DEFAULT '';
