/**
 * Returns the next upcoming Sunday strictly after `from` (the library's session day),
 * normalized to local midnight. If `from` is itself a Sunday, returns the following Sunday.
 * Pure function — no side effects — so it can be unit-tested directly.
 *
 * @param {Date} from - reference date (defaults to now)
 * @returns {Date} the next Sunday at 00:00 local time
 */
export function nextSunday(from = new Date()) {
  const d = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const day = d.getDay(); // 0 = Sunday ... 6 = Saturday
  const offset = ((7 - day) % 7) || 7; // always 1..7 -> strictly future Sunday
  d.setDate(d.getDate() + offset);
  return d;
}
