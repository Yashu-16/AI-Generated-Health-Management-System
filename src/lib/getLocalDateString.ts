
/**
 * Returns today's date as "YYYY-MM-DD" in the user's local timezone.
 */
export function getLocalTodayDateString(): string {
  const now = new Date();
  // This gives "YYYY-MM-DD" for local time, compatible with most date pickers/inputs
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
