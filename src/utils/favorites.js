const KEY = "bf_favorites_v1";

export function getFavorites() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function toggleFavorite(show) {
  const current = getFavorites();
  const exists = current.some((item) => item.id === show.id);

  const next = exists
    ? current.filter((item) => item.id !== show.id)
    : [...current, show];

  localStorage.setItem(KEY, JSON.stringify(next));
  return next;
}
