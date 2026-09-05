import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <main className="flex min-h-full flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-medium tracking-wide text-emerald-800 uppercase">
          Studio
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-stone-900">Accedi</h1>
        <p className="mt-2 mb-8 text-sm text-stone-600">
          Area riservata al nutrizionista.
        </p>
        <LoginForm />
      </div>
    </main>
  );
}
