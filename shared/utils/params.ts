export function getCleanSlug(slug: string | string[] | undefined): string {
  if (Array.isArray(slug)) {
    if (slug.length > 0) {
      return slug[0].split("?")[0].toLowerCase();
    }
    return "";
  }
  if (typeof slug === "string") {
    return slug.split("?")[0].toLowerCase();
  }
  return "";
}
