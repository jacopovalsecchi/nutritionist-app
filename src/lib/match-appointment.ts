export type MatchableClient = {
  id: string;
  firstName: string;
  lastName: string;
};

export type AutoMatchResult =
  | { type: "unique"; clientId: string }
  | { type: "none" }
  | { type: "ambiguous" };

function stripAccents(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export function normalizePersonName(value: string) {
  return stripAccents(value)
    .toLowerCase()
    .replace(/[''`]/g, " ")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const TITLE_PREFIXES = /^(dott ssa|dottssa|dott|dr|sig ra|sigra|sig|mr|mrs)\s+/;

export function eventNameFromTitle(title: string) {
  const beforeSeparator = title.split(/\s+[—–\-]\s+/)[0] ?? title;
  let name = normalizePersonName(beforeSeparator);
  name = name.replace(TITLE_PREFIXES, "").trim();
  return name;
}

export function clientNameKeys(client: MatchableClient) {
  const first = normalizePersonName(client.firstName);
  const last = normalizePersonName(client.lastName);
  return [`${first} ${last}`, `${last} ${first}`];
}

export function suggestedNameFromTitle(title: string) {
  const name = eventNameFromTitle(title);
  const parts = name.split(" ").filter(Boolean);
  const capitalize = (value: string) =>
    value ? value[0].toUpperCase() + value.slice(1) : "";
  if (parts.length < 2) {
    return { firstName: capitalize(parts[0] ?? ""), lastName: "" };
  }
  return {
    firstName: capitalize(parts[0] ?? ""),
    lastName: parts.slice(1).map(capitalize).join(" "),
  };
}

export function matchTitleToClients(
  title: string,
  clients: MatchableClient[],
): AutoMatchResult {
  const eventName = eventNameFromTitle(title);
  if (!eventName || !eventName.includes(" ")) {
    return { type: "none" };
  }

  const exact = clients.filter((client) => clientNameKeys(client).includes(eventName));
  if (exact.length === 1 && exact[0]) {
    return { type: "unique", clientId: exact[0].id };
  }
  if (exact.length > 1) {
    return { type: "ambiguous" };
  }

  const prefixHits = clients.filter((client) =>
    clientNameKeys(client).some((key) => eventName === key || eventName.startsWith(`${key} `)),
  );
  if (prefixHits.length === 1 && prefixHits[0]) {
    return { type: "unique", clientId: prefixHits[0].id };
  }
  if (prefixHits.length > 1) {
    return { type: "ambiguous" };
  }
  return { type: "none" };
}
