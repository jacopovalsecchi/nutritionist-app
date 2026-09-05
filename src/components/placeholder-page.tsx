export function PlaceholderPage({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <section className="max-w-xl">
      <h1 className="text-2xl font-semibold text-stone-900">{title}</h1>
      <p className="mt-3 text-stone-600">{description}</p>
    </section>
  );
}
