/**
 * Converts a full name into a privacy-preserving "first name + last initial"
 * form for public display, e.g. "Priya Sharma" -> "Priya S.".
 * Single-word names are returned unchanged. Pure function.
 *
 * @param {string} fullName
 * @returns {string}
 */
export function firstNameLastInitial(fullName) {
  if (!fullName || typeof fullName !== 'string') return '';
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  const last = parts[parts.length - 1];
  return `${parts[0]} ${last.charAt(0).toUpperCase()}.`;
}
