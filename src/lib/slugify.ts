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
 * Matches recipe photos by their hyphenated slug filename, e.g.
 * "Fig & Walnut Honey Bowl" -> "fig-and-walnut-honey-bowl.jpg"
 * Files live directly in public/images/. Use rename-images.sh to normalize
 * uploaded files (which may have spaces/&/punctuation) into this format -
 * special characters in filenames were confirmed to break asset serving.
 */
export function recipeImageSrc(name: string): string {
  return `/images/${slugifyName(name)}.jpg`;
}
