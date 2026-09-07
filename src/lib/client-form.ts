export type ClientInput = {
  firstName: string;
  lastName: string;
  phone: string;
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

export function parseClientForm(formData: FormData): ParseResult {
  const firstName = readString(formData, "firstName");
  const lastName = readString(formData, "lastName");
  const reminderNote = readString(formData, "reminderNote");
  const internalNotes = readString(formData, "internalNotes");
  const phone = normalizePhone(readString(formData, "phone"));

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

  return {
    ok: true,
    data: { firstName, lastName, phone, reminderNote, internalNotes },
  };
}

export function clientDisplayName(client: { firstName: string; lastName: string }) {
  return `${client.firstName} ${client.lastName}`;
}
