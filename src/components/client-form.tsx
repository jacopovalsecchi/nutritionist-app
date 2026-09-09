const inputClassName =
  "w-full rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-stone-900 outline-none ring-emerald-800/20 focus:border-emerald-800 focus:ring-4";

type ClientFormValues = {
  firstName: string;
  lastName: string;
  phone: string;
  birthDate: string;
  address: string;
  city: string;
  postalCode: string;
  reminderNote: string;
  internalNotes: string;
};

export function ClientForm({
  action,
  pending,
  error,
  values,
  submitLabel,
}: {
  action: (formData: FormData) => void;
  pending: boolean;
  error: string | null;
  values?: Partial<ClientFormValues>;
  submitLabel: string;
}) {
  return (
    <form action={action} className="max-w-2xl space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-stone-700">Nome</span>
          <input
            name="firstName"
            required
            defaultValue={values?.firstName ?? ""}
            autoComplete="given-name"
            className={inputClassName}
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-stone-700">Cognome</span>
          <input
            name="lastName"
            required
            defaultValue={values?.lastName ?? ""}
            autoComplete="family-name"
            className={inputClassName}
          />
        </label>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-stone-700">Telefono WhatsApp</span>
          <input
            name="phone"
            required
            defaultValue={values?.phone ?? ""}
            inputMode="tel"
            autoComplete="tel"
            placeholder="333 123 4567"
            className={inputClassName}
          />
          <span className="text-xs text-stone-500">
            Serve per i reminder. Accetta anche il formato italiano senza +39.
          </span>
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-stone-700">Data di nascita</span>
          <input
            name="birthDate"
            type="date"
            defaultValue={values?.birthDate ?? ""}
            className={inputClassName}
          />
        </label>
      </div>
      <label className="block space-y-1.5">
        <span className="text-sm font-medium text-stone-700">Indirizzo</span>
        <input
          name="address"
          defaultValue={values?.address ?? ""}
          autoComplete="street-address"
          className={inputClassName}
        />
      </label>
      <div className="grid gap-4 sm:grid-cols-3">
        <label className="block space-y-1.5 sm:col-span-2">
          <span className="text-sm font-medium text-stone-700">Città</span>
          <input
            name="city"
            defaultValue={values?.city ?? ""}
            autoComplete="address-level2"
            className={inputClassName}
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-stone-700">CAP</span>
          <input
            name="postalCode"
            defaultValue={values?.postalCode ?? ""}
            inputMode="numeric"
            autoComplete="postal-code"
            maxLength={5}
            placeholder="20100"
            className={inputClassName}
          />
        </label>
      </div>
      <label className="block space-y-1.5">
        <span className="text-sm font-medium text-stone-700">Nota reminder</span>
        <input
          name="reminderNote"
          defaultValue={values?.reminderNote ?? ""}
          placeholder="Es. Porta le analisi"
          className={inputClassName}
        />
        <span className="text-xs text-stone-500">
          Testo extra nel messaggio WhatsApp. Può restare vuota.
        </span>
      </label>
      <label className="block space-y-1.5">
        <span className="text-sm font-medium text-stone-700">Note interne</span>
        <textarea
          name="internalNotes"
          rows={4}
          defaultValue={values?.internalNotes ?? ""}
          className={inputClassName}
        />
        <span className="text-xs text-stone-500">Visibili solo a te, non nel reminder.</span>
      </label>
      {error ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-emerald-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {pending ? "Salvataggio…" : submitLabel}
      </button>
    </form>
  );
}
