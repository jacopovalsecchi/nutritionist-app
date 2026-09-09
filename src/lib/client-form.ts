export type ClientInput = {
  firstName: string;
  lastName: string;
  phone: string;
  birthDate: Date | null;
  address: string;
  city: string;
  postalCode: string;
  reminderNote: string;
  internalNotes: string;
};

export type ParseResult =
  | { ok: true; data: ClientInput }
  | { ok: false; error: string };

function readString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export function normalizePhone(raw: string) {
  const compact = raw.replace(/[\s().-]/g, "");
  if (!compact) {
    return "";
  }

  let digits = compact;
  if (digits.startsWith("00")) {
    digits = `+${digits.slice(2)}`;
  }
  if (digits.startsWith("+")) {
    const rest = digits.slice(1).replace(/\D/g, "");
    return rest ? `+${rest}` : "";
  }

  const national = digits.replace(/\D/g, "");
  if (national.startsWith("39") && national.length >= 11) {
    return `+${national}`;
  }
  if (/^3\d{8,9}$/.test(national)) {
    return `+39${national}`;
  }
  if (national) {
    return `+${national}`;
  }
  return "";
}

function parseBirthDate(raw: string): { ok: true; value: Date | null } | { ok: false; error: string } {
  if (!raw) {
    return { ok: true, value: null };
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    return { ok: false, error: "Inserisci una data di nascita valida." };
  }
  const [year, month, day] = raw.split("-").map(Number);
  if (!year || !month || !day) {
    return { ok: false, error: "Inserisci una data di nascita valida." };
  }
  const value = new Date(Date.UTC(year, month - 1, day));
  if (
    value.getUTCFullYear() !== year ||
    value.getUTCMonth() !== month - 1 ||
    value.getUTCDate() !== day
  ) {
    return { ok: false, error: "Inserisci una data di nascita valida." };
  }
  if (value.getTime() > Date.now()) {
    return { ok: false, error: "La data di nascita non può essere nel futuro." };
  }
  return { ok: true, value };
}

export function parseClientForm(formData: FormData): ParseResult {
  const firstName = readString(formData, "firstName");
  const lastName = readString(formData, "lastName");
  const reminderNote = readString(formData, "reminderNote");
  const internalNotes = readString(formData, "internalNotes");
  const address = readString(formData, "address");
  const city = readString(formData, "city");
  const postalCode = readString(formData, "postalCode").replace(/\s+/g, "");
  const phone = normalizePhone(readString(formData, "phone"));
  const birthDateResult = parseBirthDate(readString(formData, "birthDate"));

  if (!firstName) {
    return { ok: false, error: "Inserisci il nome." };
  }
  if (!lastName) {
    return { ok: false, error: "Inserisci il cognome." };
  }
  if (!phone || !/^\+[1-9]\d{7,14}$/.test(phone)) {
    return {
      ok: false,
      error: "Inserisci un telefono WhatsApp valido, es. 333 123 4567.",
    };
  }
  if (!birthDateResult.ok) {
    return { ok: false, error: birthDateResult.error };
  }
  if (postalCode && !/^\d{5}$/.test(postalCode)) {
    return { ok: false, error: "Il CAP deve avere 5 cifre." };
  }

  return {
    ok: true,
    data: {
      firstName,
      lastName,
      phone,
      birthDate: birthDateResult.value,
      address,
      city,
      postalCode,
      reminderNote,
      internalNotes,
    },
  };
}

export function clientDisplayName(client: { firstName: string; lastName: string }) {
  return `${client.firstName} ${client.lastName}`;
}

export function clientInitials(client: { firstName: string; lastName: string }) {
  const first = client.firstName.trim().charAt(0);
  const last = client.lastName.trim().charAt(0);
  return `${first}${last}`.toUpperCase();
}

export function formatBirthDate(date: Date | null | undefined) {
  if (!date) {
    return "";
  }
  return new Intl.DateTimeFormat("it-IT", {
    timeZone: "UTC",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export function toDateInputValue(date: Date | null | undefined) {
  if (!date) {
    return "";
  }
  return date.toISOString().slice(0, 10);
}
