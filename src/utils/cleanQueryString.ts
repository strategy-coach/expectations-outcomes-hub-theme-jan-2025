import he from "he";

export function cleanQueryString(query: string): string {
  // Strip HTML tags
  const strippedString = query.replace(/<\/?[^>]+(>|$)/g, "");

  // Decode HTML entities using 'he' library
  let decodedString = he.decode(strippedString);

  // Additional replacements for problematic characters
  decodedString = decodedString
    .replace(/&#8216;/g, "'") // Left single quotation mark
    .replace(/&#8217;/g, "'") // Right single quotation mark
    .replace(/&#8220;/g, '"') // Left double quotation mark
    .replace(/&#8221;/g, '"') // Right double quotation mark
    .replace(/[\u2018\u2019]/g, "'") // Unicode single quotes
    .replace(/[\u201C\u201D]/g, '"') // Unicode double quotes
    .replace(/[{}~`]/g, "") // Remove specific unwanted characters
    .replace(/\s+/g, " ") // Replace multiple spaces with a single space
    .trim(); // Trim leading and trailing whitespace

  return decodedString;
}
