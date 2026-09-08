"use client";

import { recalculateMatches, unlinkAppointment } from "@/app/(app)/abbinamenti/actions";

export function RecalculateMatchesButton() {
  return (
    <form action={recalculateMatches}>
      <button
        type="submit"
        className="rounded-lg border border-stone-300 bg-white px-4 py-2.5 text-sm font-medium text-stone-800 hover:bg-stone-50"
      >
        Ricalcola abbinamenti
      </button>
    </form>
  );
}

export function UnlinkAppointmentButton({ appointmentId }: { appointmentId: string }) {
  const unlink = unlinkAppointment.bind(null, appointmentId);
  return (
    <form action={unlink}>
      <button type="submit" className="text-sm font-medium text-stone-600 hover:underline">
        Scollega
      </button>
    </form>
  );
}
