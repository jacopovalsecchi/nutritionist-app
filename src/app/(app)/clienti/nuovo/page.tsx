import Link from "next/link";
import { NewClientForm } from "./new-client-form";

export default async function NuovoClientePage({
  searchParams,
}: {
  searchParams: Promise<{ nome?: string; cognome?: string }>;
}) {
  const { nome, cognome } = await searchParams;

  return (
    <section className="space-y-6">
      <div>
        <Link href="/clienti" className="text-sm text-emerald-900 hover:underline">
          ← Clienti
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-stone-900">Nuovo cliente</h1>
      </div>
      <NewClientForm firstName={nome ?? ""} lastName={cognome ?? ""} />
    </section>
  );
}
