
import { formatInTimeZone } from "date-fns-tz";

/**
 * Returns today's date as "YYYY-MM-DD" in Asia/Kolkata (IST) timezone.
 */
export function getLocalTodayDateString(): string {
  // Use date-fns-tz to get the date in Asia/Kolkata timezone
  return formatInTimeZone(new Date(), "Asia/Kolkata", "yyyy-MM-dd");
}

