const KEY = "bf_favorites_v1";

function safeParse(raw) {
  try {
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function normalize(show) {
  return {
    id: show.id,
    title: show.title ?? show.name ?? "",
    year: show.year ?? "—",
    image: show.image ?? "",
    genres: Array.isArray(show.genres) ? show.genres : [],
    rating: show.rating ?? null,
  };
}

export function getFavorites() {
  const raw = localStorage.getItem(KEY);
  const parsed = safeParse(raw);
  return Array.isArray(parsed) ? parsed : [];
}

function setFavorites(next) {
  localStorage.setItem(KEY, JSON.stringify(next));
  return next;
}

export function toggleFavorite(show) {
  const current = getFavorites();
  const normalized = normalize(show);

  const exists = current.some((item) => item.id === normalized.id);
  const next = exists
    ? current.filter((item) => item.id !== normalized.id)
    : [...current, normalized];

  return setFavorites(next);
}

export function removeFavorite(id) {
  const current = getFavorites();
  const next = current.filter((item) => String(item.id) !== String(id));
  return setFavorites(next);
}

export function clearFavorites() {
  return setFavorites([]);
}
