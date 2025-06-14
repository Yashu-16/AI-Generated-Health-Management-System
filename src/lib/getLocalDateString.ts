
/**
 * Returns today's date as "YYYY-MM-DD" in IST (Indian Standard Time, Asia/Kolkata).
 */
export function getLocalTodayDateString(): string {
  // Get current time in UTC, add IST offset (5.5 hours)
  const now = new Date();

  // India Standard Time offset +05:30
  const istOffset = 5.5 * 60 * 60 * 1000;
  // Convert current UTC time to IST time by adding offset
  const istTime = new Date(now.getTime() + (istOffset - now.getTimezoneOffset() * 60 * 1000));

  const year = istTime.getUTCFullYear();
  const month = String(istTime.getUTCMonth() + 1).padStart(2, "0");
  const day = String(istTime.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
