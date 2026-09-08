export const MAX_UPLOAD_BYTES = 20 * 1024 * 1024;

export const ALLOWED_EXTENSIONS = new Map<string, string>([
  [".pdf", "application/pdf"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".png", "image/png"],
  [".webp", "image/webp"],
  [".heic", "image/heic"],
  [".doc", "application/msword"],
  [".docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
  [".xls", "application/vnd.ms-excel"],
  [".xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"],
  [".txt", "text/plain"],
  [".csv", "text/csv"],
]);

export function describeAllowedFiles() {
  return "PDF, immagini, Word, Excel, testo o CSV. Massimo 20 MB.";
}

function extensionFromName(name: string) {
  const base = name.split(/[/\\]/).pop()?.toLowerCase() ?? "";
  const match = base.match(/(\.[a-z0-9]{1,8})$/);
  return match ? match[1] : "";
}

export function validateUpload(file: File) {
  if (!file || file.size === 0) {
    return { ok: false as const, error: "Scegli un file da caricare." };
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return { ok: false as const, error: "Il file supera i 20 MB." };
  }
  const extension = extensionFromName(file.name);
  const mimeFromExt = ALLOWED_EXTENSIONS.get(extension);
  if (!mimeFromExt) {
    return {
      ok: false as const,
      error: `Formato non supportato. ${describeAllowedFiles()}`,
    };
  }
  return {
    ok: true as const,
    extension,
    mimeType: file.type && file.type !== "application/octet-stream" ? file.type : mimeFromExt,
  };
}

export function formatFileSize(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  const kb = bytes / 1024;
  if (kb < 1024) {
    return `${kb.toLocaleString("it-IT", { maximumFractionDigits: 1 })} KB`;
  }
  return `${(kb / 1024).toLocaleString("it-IT", { maximumFractionDigits: 1 })} MB`;
}

export function formatUploadedAt(date: Date) {
  return new Intl.DateTimeFormat("it-IT", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}
