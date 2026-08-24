/** For a weekly-recurring event whose stored `event_date` has already
 * passed, rolls it forward to the next occurrence of the same weekday —
 * so a single admin-created row always represents "the next one," with no
 * cron job creating/deleting rows and no stale past date lingering.
 *
 * All arithmetic happens in UTC (via Date.UTC / toISOString) rather than
 * parsing "YYYY-MM-DDT00:00:00" as local time — mixing local-time parsing
 * with UTC-formatted output drifts the date by one whenever the runtime's
 * timezone isn't UTC. */
export function getEffectiveEventDate(event: {
  event_date: string;
  is_recurring: boolean;
}): string {
  if (!event.is_recurring) return event.event_date;

  const todayIso = new Date().toISOString().slice(0, 10);
  if (event.event_date >= todayIso) return event.event_date;

  const originalUtc = dateStringToUtcMs(event.event_date);
  const todayUtc = dateStringToUtcMs(todayIso);

  const daysPassed = Math.round((todayUtc - originalUtc) / 86_400_000);
  const weeksPassed = Math.ceil(daysPassed / 7);

  const nextUtc = originalUtc + weeksPassed * 7 * 86_400_000;
  return new Date(nextUtc).toISOString().slice(0, 10);
}

function dateStringToUtcMs(dateStr: string): number {
  const [year, month, day] = dateStr.split("-").map(Number);
  return Date.UTC(year!, month! - 1, day!);
}
