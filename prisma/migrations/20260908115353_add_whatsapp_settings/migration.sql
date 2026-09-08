-- AlterTable
ALTER TABLE "Setting" ADD COLUMN     "whatsappDisplayPhone" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "whatsappPhoneNumberId" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "whatsappTemplateLang" TEXT NOT NULL DEFAULT 'it',
ADD COLUMN     "whatsappTemplateName" TEXT NOT NULL DEFAULT 'promemoria_appuntamento',
ADD COLUMN     "whatsappTokenEnc" TEXT NOT NULL DEFAULT '';
