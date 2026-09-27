/**
 * Formats a date string (ISO timestamp, Date object, etc.) to YYYY-MM-DD (e.g. "2026-08-26").
 * Returns fallback (default "-") if date is missing or empty.
 */
export const formatDate = (
  dateInput?: string | Date | null,
  fallback = "-",
): string => {
  if (!dateInput) return fallback;

  if (dateInput instanceof Date) {
    if (isNaN(dateInput.getTime())) return fallback;
    return dateInput.toISOString().split("T")[0];
  }

  const str = String(dateInput).trim();
  if (!str) return fallback;

  if (str.includes("T")) {
    return str.split("T")[0];
  }

  try {
    const d = new Date(str);
    if (!isNaN(d.getTime())) {
      return d.toISOString().split("T")[0];
    }
  } catch {
    // ignore
  }

  return str || fallback;
};

/**
 * Formats "Member Since" or registration date.
 * Reuses standard date formatting with custom fallback.
 */
export const formatMemberSince = (
  dateInput?: string | Date | null,
  fallback = "-",
): string => {
  return formatDate(dateInput, fallback);
};

export default formatDate;
