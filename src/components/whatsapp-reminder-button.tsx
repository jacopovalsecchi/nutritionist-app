export function WhatsappReminderButton({ href }: { href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex shrink-0 items-center justify-center rounded-lg bg-emerald-900 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-800"
    >
      Invia promemoria
    </a>
  );
}
