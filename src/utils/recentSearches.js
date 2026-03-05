const KEY = "bf_recent_v1";
const MAX = 8;

function safeParse(raw) {
  try {
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function getRecentSearches() {
  return safeParse(localStorage.getItem(KEY));
}

export function addRecentSearch(term) {
  const t = (term || "").trim();
  if (!t) return getRecentSearches();

  const current = getRecentSearches();

  const next = [
    t,
    ...current.filter((x) => x.toLowerCase() !== t.toLowerCase()),
  ].slice(0, MAX);

  localStorage.setItem(KEY, JSON.stringify(next));
  return next;
}

export function clearRecentSearches() {
  localStorage.setItem(KEY, JSON.stringify([]));
  return [];
}
