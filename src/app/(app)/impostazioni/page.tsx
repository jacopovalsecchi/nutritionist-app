import { CalendarSelectForm, IcloudCredentialsForm } from "./icloud-forms";
import { DisconnectIcloudButton, SyncCalendarButton } from "./sync-buttons";
import { DisconnectWhatsappButton, WhatsappCredentialsForm } from "./whatsapp-forms";
import { formatSyncTime, listIcloudCalendars } from "@/lib/icloud";
import { decryptSecret } from "@/lib/secret-box";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function ImpostazioniPage() {
  const settings = await getSettings();
  const hasPassword = Boolean(settings.icloudPasswordEnc);
  let calendars: { url: string; name: string }[] = [];
  let calendarsError: string | null = null;

  if (settings.icloudAppleId && settings.icloudPasswordEnc) {
    try {
      calendars = await listIcloudCalendars(
        settings.icloudAppleId,
        decryptSecret(settings.icloudPasswordEnc),
      );
    } catch (error) {
      calendarsError =
        error instanceof Error ? error.message : "Impossibile leggere i calendari iCloud.";
    }
  }

  return (
    <section className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-stone-900">Impostazioni</h1>
        <p className="mt-1 text-sm text-stone-600">
          Collegamento al Calendario Apple e a WhatsApp Business (Cloud API).
        </p>
      </div>

      <div className="max-w-xl space-y-6 rounded-2xl border border-stone-200 bg-white p-6">
        <div>
          <h2 className="text-lg font-semibold text-stone-900">iCloud Calendar</h2>
          <p className="mt-1 text-sm text-stone-600">
            L’app legge gli appuntamenti da iCloud, la stessa agenda di iPhone e Mac. Crea un
            calendario dedicato, es. Pazienti.
          </p>
        </div>
        <IcloudCredentialsForm appleId={settings.icloudAppleId} hasPassword={hasPassword} />
        {hasPassword ? <DisconnectIcloudButton /> : null}
      </div>

      {calendarsError ? (
        <p className="max-w-xl rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">
          {calendarsError}
        </p>
      ) : null}

      {calendars.length > 0 ? (
        <div className="max-w-xl space-y-6 rounded-2xl border border-stone-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-stone-900">Calendario Pazienti</h2>
          <CalendarSelectForm calendars={calendars} selectedUrl={settings.calendarUrl} />
        </div>
      ) : null}

      {settings.calendarUrl ? (
        <div className="max-w-xl space-y-4 rounded-2xl border border-stone-200 bg-white p-6">
          <div>
            <h2 className="text-lg font-semibold text-stone-900">Sincronizzazione</h2>
            <p className="mt-1 text-sm text-stone-600">
              Calendario attivo: {settings.calendarDisplayName || "selezionato"}.
              {settings.lastSyncAt
                ? ` Ultimo sync: ${formatSyncTime(settings.lastSyncAt)}.`
                : " Non ancora sincronizzato."}
            </p>
            {settings.lastSyncError ? (
              <p className="mt-2 text-sm text-red-800">{settings.lastSyncError}</p>
            ) : null}
          </div>
          <SyncCalendarButton />
        </div>
      ) : null}

      <div className="max-w-xl space-y-6 rounded-2xl border border-stone-200 bg-white p-6">
        <div>
          <h2 className="text-lg font-semibold text-stone-900">WhatsApp Cloud API</h2>
          <p className="mt-1 text-sm text-stone-600">
            Serve un account Meta Business, un numero WhatsApp Business e un template Utility
            approvato. L’invio automatico arriverà nello step successivo: ora puoi solo fare una
            prova dalla scheda cliente.
          </p>
        </div>
        <WhatsappCredentialsForm
          phoneNumberId={settings.whatsappPhoneNumberId}
          templateName={settings.whatsappTemplateName}
          templateLang={settings.whatsappTemplateLang}
          hasToken={Boolean(settings.whatsappTokenEnc)}
          displayPhone={settings.whatsappDisplayPhone}
        />
        {settings.whatsappTokenEnc ? <DisconnectWhatsappButton /> : null}
      </div>
    </section>
  );
}
