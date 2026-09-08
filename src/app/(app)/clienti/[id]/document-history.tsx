import { DeleteDocumentButton } from "./delete-document-button";
import { formatFileSize, formatUploadedAt } from "@/lib/upload-types";

type DocumentItem = {
  id: string;
  originalName: string;
  sizeBytes: number;
  label: string;
  createdAt: Date;
};

export function DocumentHistory({
  clientId,
  documents,
}: {
  clientId: string;
  documents: DocumentItem[];
}) {
  if (documents.length === 0) {
    return (
      <p className="text-sm text-stone-600">Nessun file in archivio per questo cliente.</p>
    );
  }

  return (
    <ul className="divide-y divide-stone-200 overflow-hidden rounded-xl border border-stone-200">
      {documents.map((document) => (
        <li
          key={document.id}
          className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="min-w-0">
            <p className="truncate font-medium text-stone-900">
              {document.label || document.originalName}
            </p>
            <p className="text-sm text-stone-500">
              {document.label ? `${document.originalName} · ` : ""}
              {formatFileSize(document.sizeBytes)} · {formatUploadedAt(document.createdAt)}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <a
              href={`/api/clienti/${clientId}/documenti/${document.id}`}
              className="text-sm font-medium text-emerald-900 hover:underline"
            >
              Scarica
            </a>
            <DeleteDocumentButton
              clientId={clientId}
              documentId={document.id}
              name={document.label || document.originalName}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
