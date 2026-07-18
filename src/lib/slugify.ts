/**
 * Converts a recipe name into a filename-safe slug for matching against
 * uploaded photo files, e.g. "Beef Burger Glow Bowl" -> "beef-burger-glow-bowl".
 *
 * Photos should be named to match this exactly (before the extension):
 * public/images/recipes/beef-burger-glow-bowl.jpg
 */
export function slugifyName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
