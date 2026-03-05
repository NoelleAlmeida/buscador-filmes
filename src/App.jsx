import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getFavorites, toggleFavorite } from "./utils/favorites";
import "./App.css";

const PAGE_SIZE = 12;
const SORTS = ["relevance", "rating", "year"];

export default function App() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [query, setQuery] = useState(""); // texto do input
  const [activeQuery, setActiveQuery] = useState(""); // última busca “valendo”
  const [movies, setMovies] = useState([]);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const [sort, setSort] = useState("relevance"); // relevance | rating | year
  const [onlyFavs, setOnlyFavs] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [favorites, setFavorites] = useState([]);

  const abortRef = useRef(null);
  const lastFetchedRef = useRef("");

  useEffect(() => {
    setFavorites(getFavorites());
  }, []);

  function updateUrl(nextQ, nextSort, nextFavs) {
    const params = new URLSearchParams();

    if (nextQ) params.set("q", nextQ);
    if (nextSort && nextSort !== "relevance") params.set("sort", nextSort);
    if (nextFavs) params.set("favs", "1");

    setSearchParams(params);
  }

  async function runSearch(q) {
    const cleaned = (q || "").trim();
    if (!cleaned) return;

    // cancela a busca anterior (se existir)
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError("");
    setMovies([]);
    setVisibleCount(PAGE_SIZE);

    try {
      const res = await fetch(
        `https://api.tvmaze.com/search/shows?q=${encodeURIComponent(cleaned)}`,
        { signal: controller.signal },
      );

      if (!res.ok) throw new Error("Falha ao buscar. Tente novamente.");

      const data = await res.json();

      const mapped = data.map((item) => {
        const show = item.show;
        return {
          id: show.id,
          title: show.name,
          year: show.premiered ? show.premiered.slice(0, 4) : "—",
          image: show.image?.medium || "",
          genres: show.genres || [],
          rating: show.rating?.average ?? null,
        };
      });

      lastFetchedRef.current = cleaned;
      setMovies(mapped);
    } catch (err) {
      if (err?.name === "AbortError") return;
      setError(err.message || "Erro inesperado.");
    } finally {
      setLoading(false);
    }
  }

  // ✅ Ao abrir link com ?q=... (ou mudar filtros pelo URL), o app se ajusta sozinho
  useEffect(() => {
    const q = (searchParams.get("q") || "").trim();
    const spSort = searchParams.get("sort") || "relevance";
    const spFavs = searchParams.get("favs") === "1";

    const safeSort = SORTS.includes(spSort) ? spSort : "relevance";

    setQuery(q);
    setActiveQuery(q);
    setSort(safeSort);
    setOnlyFavs(spFavs);

    // se o URL tem busca e ainda não foi carregada, carrega
    if (q && q !== lastFetchedRef.current) {
      runSearch(q);
    }

    // se limpar q no URL, limpa a lista
    if (!q) {
      lastFetchedRef.current = "";
      setMovies([]);
      setError("");
      setLoading(false);
      setVisibleCount(PAGE_SIZE);
    }
  }, [searchParams]);

  function handleSubmit(e) {
    e.preventDefault();

    const q = query.trim();
    if (!q) return;

    setActiveQuery(q);

    // atualiza URL com a busca e filtros atuais
    updateUrl(q, sort, onlyFavs);

    // busca de verdade
    runSearch(q);
  }

  function handleClear() {
    setQuery("");
    setActiveQuery("");
    setMovies([]);
    setError("");
    setLoading(false);
    setVisibleCount(PAGE_SIZE);

    // limpa o q do URL (mantém sort/favs se você quiser; aqui mantemos)
    updateUrl("", sort, onlyFavs);
  }

  const active = activeQuery.trim();
  const hasActiveQuery = active.length > 0;

  const moviesFiltered = useMemo(() => {
    if (!onlyFavs) return movies;
    const favIds = new Set(favorites.map((f) => f.id));
    return movies.filter((m) => favIds.has(m.id));
  }, [movies, onlyFavs, favorites]);

  const moviesSorted = useMemo(() => {
    const copy = [...moviesFiltered];
    if (sort === "rating")
      copy.sort((a, b) => (b.rating ?? -1) - (a.rating ?? -1));
    if (sort === "year")
      copy.sort((a, b) => Number(b.year || 0) - Number(a.year || 0));
    return copy; // relevance = ordem original
  }, [moviesFiltered, sort]);

  const total = moviesSorted.length;
  const shown = Math.min(visibleCount, total);
  const displayMovies = moviesSorted.slice(0, visibleCount);

  const showEmptyState =
    !loading && !error && !hasActiveQuery && movies.length === 0;
  const showNoResults = !loading && !error && hasActiveQuery && total === 0;

  return (
    <main className="container">
      <header className="header">
        <div>
          <h1 className="title">Buscador de Filmes 🎬</h1>
          <p className="subtitle">React + Vite + API</p>
        </div>

        <Link to="/favorites" className="favoritesLink">
          ⭐ Favoritos ({favorites.length})
        </Link>
      </header>

      <form onSubmit={handleSubmit} className="form">
        <input
          className="input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Digite um filme/série..."
        />

        <div className="actions">
          <button
            className="button"
            disabled={loading || query.trim().length === 0}
            type="submit"
          >
            {loading ? "Buscando..." : "Buscar"}
          </button>

          <button
            className="button buttonSecondary"
            type="button"
            onClick={handleClear}
            disabled={
              loading || (!query.trim() && movies.length === 0 && !error)
            }
          >
            Limpar
          </button>
        </div>
      </form>

      <section className="section">
        {error && (
          <div className="errorBox">
            <p className="error">{error}</p>
            <button
              className="button buttonSecondary"
              type="button"
              onClick={() => {
                const q = (activeQuery || query).trim();
                if (!q) return;
                updateUrl(q, sort, onlyFavs);
                runSearch(q);
              }}
            >
              Tentar novamente
            </button>
          </div>
        )}

        {!error && !loading && hasActiveQuery && (
          <div className="resultsBar">
            <p className="count">
              Resultados para <strong>{active}</strong>:{" "}
              <strong>{total}</strong> {total === 1 ? "item" : "itens"} •
              Mostrando <strong>{shown}</strong>
            </p>

            <div className="filters">
              <label className="label">
                Ordenar:
                <select
                  className="select"
                  value={sort}
                  onChange={(e) => {
                    const nextSort = e.target.value;
                    setSort(nextSort);
                    updateUrl(active, nextSort, onlyFavs);
                  }}
                >
                  <option value="relevance">Relevância</option>
                  <option value="rating">Nota</option>
                  <option value="year">Ano</option>
                </select>
              </label>

              <label className="checkbox">
                <input
                  type="checkbox"
                  checked={onlyFavs}
                  onChange={(e) => {
                    const nextFavs = e.target.checked;
                    setOnlyFavs(nextFavs);
                    updateUrl(active, sort, nextFavs);
                  }}
                />
                Mostrar só favoritos
              </label>
            </div>
          </div>
        )}

        {showEmptyState && (
          <p className="muted">Faça uma busca para ver resultados.</p>
        )}
        {showNoResults && (
          <p className="muted">
            Nenhum resultado encontrado
            {onlyFavs ? " (com filtro de favoritos)" : ""}.
          </p>
        )}

        {loading && (
          <ul className="grid">
            {Array.from({ length: PAGE_SIZE }).map((_, idx) => (
              <li key={idx} className="card skeletonCard">
                <div className="posterWrap skeleton" />
                <div className="cardBody">
                  <div className="skeletonLine skeleton" />
                  <div className="skeletonLine small skeleton" />
                  <div className="skeletonBtn skeleton" />
                </div>
              </li>
            ))}
          </ul>
        )}

        {!loading && displayMovies.length > 0 && (
          <>
            <ul className="grid">
              {displayMovies.map((m) => {
                const isFav = favorites.some((f) => f.id === m.id);

                return (
                  <li key={m.id} className="card">
                    <Link to={`/show/${m.id}`} className="cardLink">
                      <div className="posterWrap">
                        {isFav && <span className="favBadge">★ Favorito</span>}

                        {m.image ? (
                          <img
                            className="poster"
                            src={m.image}
                            alt={`Poster de ${m.title}`}
                          />
                        ) : (
                          <div className="posterPlaceholder">Sem imagem</div>
                        )}
                      </div>

                      <div className="cardBody">
                        <div className="cardTop">
                          <strong className="cardTitle">{m.title}</strong>
                          <span className="pill">{m.year}</span>
                        </div>

                        <div className="meta">
                          <span className="metaItem">
                            ⭐ {m.rating !== null ? m.rating : "—"}
                          </span>
                          <span className="metaItem">
                            {m.genres.length
                              ? m.genres.slice(0, 2).join(" • ")
                              : "Sem gênero"}
                          </span>
                        </div>

                        <button
                          type="button"
                          className="favBtn"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            const next = toggleFavorite(m);
                            setFavorites(next);
                          }}
                        >
                          {isFav ? "★ Favoritado" : "☆ Favoritar"}
                        </button>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>

            {shown < total && (
              <div className="loadMoreWrap">
                <button
                  type="button"
                  className="button loadMoreBtn"
                  onClick={() => setVisibleCount((v) => v + PAGE_SIZE)}
                >
                  Carregar mais
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}
