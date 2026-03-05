import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getFavorites, toggleFavorite } from "./utils/favorites";
import "./App.css";

const PAGE_SIZE = 12;

export default function App() {
  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState([]);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [sort, setSort] = useState("relevance"); // relevance | rating | year
  const [onlyFavs, setOnlyFavs] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    setFavorites(getFavorites());
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;

    setLoading(true);
    setError("");
    setMovies([]);
    setVisibleCount(PAGE_SIZE);

    const controller = new AbortController();

    try {
      const res = await fetch(
        `https://api.tvmaze.com/search/shows?q=${encodeURIComponent(q)}`,
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

      setMovies(mapped);
    } catch (err) {
      if (err?.name === "AbortError") return;
      setError(err.message || "Erro inesperado.");
    } finally {
      setLoading(false);
    }

    return () => controller.abort();
  }

  function handleClear() {
    setQuery("");
    setMovies([]);
    setError("");
    setLoading(false);
    setVisibleCount(PAGE_SIZE);
  }

  const hasQuery = query.trim().length > 0;

  const moviesFiltered = useMemo(() => {
    if (!onlyFavs) return movies;
    const favIds = new Set(favorites.map((f) => f.id));
    return movies.filter((m) => favIds.has(m.id));
  }, [movies, onlyFavs, favorites]);

  const moviesSorted = useMemo(() => {
    const copy = [...moviesFiltered];

    if (sort === "rating") {
      copy.sort((a, b) => (b.rating ?? -1) - (a.rating ?? -1));
    } else if (sort === "year") {
      copy.sort((a, b) => Number(b.year || 0) - Number(a.year || 0));
    }
    // relevance = ordem original (não mexe)
    return copy;
  }, [moviesFiltered, sort]);

  const total = moviesSorted.length;
  const shown = Math.min(visibleCount, total);
  const displayMovies = moviesSorted.slice(0, visibleCount);

  const showEmptyState = !loading && !error && !hasQuery && movies.length === 0;
  const showNoResults = !loading && !error && hasQuery && total === 0;

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
            disabled={loading || !hasQuery}
            type="submit"
          >
            {loading ? "Buscando..." : "Buscar"}
          </button>

          <button
            className="button buttonSecondary"
            type="button"
            onClick={handleClear}
            disabled={loading || (!hasQuery && movies.length === 0 && !error)}
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
              onClick={handleSubmit}
            >
              Tentar novamente
            </button>
          </div>
        )}

        {!error && !loading && hasQuery && (
          <div className="resultsBar">
            <p className="count">
              Resultados para <strong>{query.trim()}</strong>:{" "}
              <strong>{total}</strong> {total === 1 ? "item" : "itens"} •
              Mostrando <strong>{shown}</strong>
            </p>

            <div className="filters">
              <label className="label">
                Ordenar:
                <select
                  className="select"
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
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
                  onChange={(e) => setOnlyFavs(e.target.checked)}
                />
                Mostrar só favoritos
              </label>
            </div>
          </div>
        )}

        {showEmptyState && (
          <p className="muted">Faça uma busca para ver resultados.</p>
        )}
        {showNoResults && <p className="muted">Nenhum resultado encontrado.</p>}

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
