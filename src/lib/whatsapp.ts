import { decryptSecret } from "@/lib/secret-box";
import { getSettings } from "@/lib/settings";

export const GRAPH_API_VERSION = "v23.0";

export type WhatsappCredentials = {
  phoneNumberId: string;
  token: string;
  templateName: string;
  templateLang: string;
  displayPhone: string;
};

type GraphErrorBody = {
  error?: {
    message?: string;
    code?: number;
    error_subcode?: number;
    error_user_msg?: string;
  };
};

export function toWhatsappNumber(phone: string) {
  return phone.replace(/^\+/, "").replace(/\D/g, "");
}

export async function getWhatsappCredentials(): Promise<WhatsappCredentials | null> {
  const settings = await getSettings();
  if (!settings.whatsappPhoneNumberId || !settings.whatsappTokenEnc) {
    return null;
  }
  return {
    phoneNumberId: settings.whatsappPhoneNumberId,
    token: decryptSecret(settings.whatsappTokenEnc),
    templateName: settings.whatsappTemplateName || "promemoria_appuntamento",
    templateLang: settings.whatsappTemplateLang || "it",
    displayPhone: settings.whatsappDisplayPhone,
  };
}

function graphUrl(path: string) {
  return `https://graph.facebook.com/${GRAPH_API_VERSION}/${path}`;
}

function mapWhatsappError(status: number, body: GraphErrorBody) {
  const code = body.error?.code;
  const subcode = body.error?.error_subcode;
  if (status === 401 || code === 190) {
    return "Token WhatsApp non valido o scaduto. Generane uno nuovo da Meta.";
  }
  if (code === 100) {
    return "Phone number ID non trovato. Controlla il valore in Impostazioni.";
  }
  if (code === 132001) {
    return "Template non trovato. Controlla nome e lingua (es. it) del template approvato.";
  }
  if (code === 132000 || code === 132005) {
    return "Il template non ha 4 variabili (nome, data, ora, nota). Allinea il testo su Meta.";
  }
  if (code === 131026) {
    return "Numero non raggiungibile su WhatsApp. Controlla il telefono del cliente.";
  }
  if (code === 133010) {
    return "Questo numero può scrivere solo ai destinatari di prova aggiunti in Meta.";
  }
  if (code === 130429 || status === 429) {
    return "Limite di invio WhatsApp raggiunto. Riprova tra poco.";
  }
  if (subcode === 2494102 || /parameter/i.test(body.error?.message ?? "")) {
    return "Un parametro del template non è accettato. Evita campi vuoti e a capo nella nota.";
  }
  if (status >= 500) {
    return "WhatsApp non risponde. Riprova tra poco.";
  }
  return body.error?.error_user_msg || "Invio WhatsApp non riuscito. Controlla credenziali e template.";
}

async function graphRequest(path: string, token: string, init?: RequestInit) {
  let response: Response;
  try {
    response = await fetch(graphUrl(path), {
      ...init,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        ...(init?.body ? { "Content-Type": "application/json" } : {}),
        ...init?.headers,
      },
      signal: AbortSignal.timeout(20000),
    });
  } catch {
    throw new Error("Impossibile raggiungere WhatsApp. Controlla la connessione e riprova.");
  }

  let body: GraphErrorBody & Record<string, unknown> = {};
  try {
    body = (await response.json()) as GraphErrorBody & Record<string, unknown>;
  } catch {
    body = {};
  }
  if (!response.ok) {
    throw new Error(mapWhatsappError(response.status, body));
  }
  return body;
}

export async function verifyWhatsappCredentials(phoneNumberId: string, token: string) {
  const body = await graphRequest(
    `${encodeURIComponent(phoneNumberId)}?fields=display_phone_number,verified_name`,
    token,
  );
  const displayPhone =
    typeof body.display_phone_number === "string" ? body.display_phone_number : "";
  const verifiedName = typeof body.verified_name === "string" ? body.verified_name : "";
  return { displayPhone, verifiedName };
}

export async function sendReminderTemplate(options: {
  credentials: WhatsappCredentials;
  toPhone: string;
  bodyParameters: string[];
}) {
  const to = toWhatsappNumber(options.toPhone);
  if (!/^[1-9]\d{7,14}$/.test(to)) {
    throw new Error("Il telefono del cliente non è un numero WhatsApp valido.");
  }

  const body = await graphRequest(`${encodeURIComponent(options.credentials.phoneNumberId)}/messages`, options.credentials.token, {
    method: "POST",
    body: JSON.stringify({
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to,
      type: "template",
      template: {
        name: options.credentials.templateName,
        language: { code: options.credentials.templateLang },
        components: [
          {
            type: "body",
            parameters: options.bodyParameters.map((text) => ({ type: "text", text })),
          },
        ],
      },
    }),
  });

  const messages = body.messages as Array<{ id?: string }> | undefined;
  return messages?.[0]?.id ?? "";
}
