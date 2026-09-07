import Link from "next/link";

export default function NotFound() {
  return (
    <section className="max-w-xl">
      <h1 className="text-2xl font-semibold text-stone-900">Cliente non trovato</h1>
      <p className="mt-3 text-stone-600">
        Questo cliente non esiste o è stato eliminato.
      </p>
      <Link
        href="/clienti"
        className="mt-6 inline-block text-sm font-medium text-emerald-900 hover:underline"
      >
        Torna ai clienti
      </Link>
    </section>
  );
}
