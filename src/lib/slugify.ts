/**
 * Converts a recipe name into a filename-safe slug - kept for reference /
 * potential future use, but recipe photos currently use recipeImageSrc below
 * instead, matching the naming convention actually used for uploaded files.
 */
export function slugifyName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Matches the real naming convention used for uploaded recipe photos:
 * the exact recipe title, lowercased, spaces/punctuation kept as-is.
 * e.g. "Fig & Walnut Honey Bowl" -> "fig & walnut honey bowl.jpg"
 * Files live directly in public/images/ (not a subfolder).
 */
export function recipeImageSrc(name: string): string {
  const filename = `${name.toLowerCase()}.jpg`;
  return `/images/${encodeURIComponent(filename)}`;
}
