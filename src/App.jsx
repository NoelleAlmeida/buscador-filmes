import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getFavorites, toggleFavorite } from "./utils/favorites";
import {
  addRecentSearch,
  clearRecentSearches,
  getRecentSearches,
} from "./utils/recentSearches";
import "./App.css";

const PAGE_SIZE = 12;
const SORTS = ["relevance", "rating", "year"];

export default function App() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [query, setQuery] = useState("");
  const [activeQuery, setActiveQuery] = useState("");

  const [movies, setMovies] = useState([]);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const [sort, setSort] = useState("relevance");
  const [onlyFavs, setOnlyFavs] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [favorites, setFavorites] = useState([]);
  const [recent, setRecent] = useState([]);

  const abortRef = useRef(null);
  const lastFetchedRef = useRef("");
  const prevUrlQRef = useRef("");
  const selfUrlUpdateRef = useRef(false);
  const skipDebounceRef = useRef(false);

  const inputRef = useRef(null);
  const resultsRef = useRef(null);

  useEffect(() => {
    setFavorites(getFavorites());
    setRecent(getRecentSearches());
  }, []);

  function updateUrl(nextQ, nextSort, nextFavs) {
    selfUrlUpdateRef.current = true;

    const params = new URLSearchParams();
    if (nextQ) params.set("q", nextQ);
    if (nextSort && nextSort !== "relevance") params.set("sort", nextSort);
    if (nextFavs) params.set("favs", "1");

    setSearchParams(params);
  }

  async function runSearch(q) {
    const cleaned = (q || "").trim();
    if (!cleaned) return;

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
      setTimeout(() => resultsRef.current?.focus?.(), 0);
    }
  }

  function startSearch(q) {
    const cleaned = (q || "").trim();
    if (!cleaned) return;

    setActiveQuery(cleaned);

    const nextRecent = addRecentSearch(cleaned);
    setRecent(nextRecent);

    updateUrl(cleaned, sort, onlyFavs);
    runSearch(cleaned);
  }

  useEffect(() => {
    const q = (searchParams.get("q") || "").trim();
    const spSort = searchParams.get("sort") || "relevance";
    const spFavs = searchParams.get("favs") === "1";
    const safeSort = SORTS.includes(spSort) ? spSort : "relevance";

    skipDebounceRef.current = true;

    setQuery(q);
    setActiveQuery(q);
    setSort(safeSort);
    setOnlyFavs(spFavs);

    const qChanged = q !== prevUrlQRef.current;
    prevUrlQRef.current = q;

    if (selfUrlUpdateRef.current) {
      selfUrlUpdateRef.current = false;
      return;
    }

    if (qChanged) {
      if (!q) {
        lastFetchedRef.current = "";
        setMovies([]);
        setError("");
        setLoading(false);
        setVisibleCount(PAGE_SIZE);
      } else if (q !== lastFetchedRef.current) {
        runSearch(q);
      }
    }
  }, [searchParams]);

  useEffect(() => {
    if (skipDebounceRef.current) {
      skipDebounceRef.current = false;
      return;
    }

    const q = query.trim();
    if (q.length < 2) return;
    if (q === activeQuery.trim()) return;

    const t = setTimeout(() => startSearch(q), 450);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, sort, onlyFavs]);

  function handleSubmit(e) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    startSearch(q);
  }

  function handleClear({ focusInput = true } = {}) {
    if (abortRef.current) abortRef.current.abort();

    setQuery("");
    setActiveQuery("");
    setMovies([]);
    setError("");
    setLoading(false);
    setVisibleCount(PAGE_SIZE);
    lastFetchedRef.current = "";

    updateUrl("", sort, onlyFavs);

    if (focusInput) setTimeout(() => inputRef.current?.focus(), 0);
  }

  useEffect(() => {
    inputRef.current?.focus();

    function onKeyDown(e) {
      const tag = (e.target?.tagName || "").toLowerCase();
      const typing =
        tag === "input" || tag === "textarea" || e.target?.isContentEditable;

      if (e.key === "/" && !typing) {
        e.preventDefault();
        inputRef.current?.focus();
        return;
      }

      if (e.key === "Escape") {
        const hasSomething = query.trim() || movies.length || error;
        if (hasSomething) {
          e.preventDefault();
          handleClear({ focusInput: true });
        }
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, movies.length, error]);

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
    return copy;
  }, [moviesFiltered, sort]);

  const total = moviesSorted.length;
  const shown = Math.min(visibleCount, total);
  const displayMovies = moviesSorted.slice(0, visibleCount);

  const showEmptyState =
    !loading && !error && !hasActiveQuery && movies.length === 0;
  const showNoResults = !loading && !error && hasActiveQuery && total === 0;

  const yearNow = new Date().getFullYear();

  return (
    <main className="container">
      <a href="#results" className="skipLink">
        Pular para resultados
      </a>

      <header className="header">
        <div>
          <h1 className="title">Buscador de Filmes 🎬</h1>
          <p className="subtitle">
            React + Vite + API • <span className="kbd">/</span> foca •{" "}
            <span className="kbd">Esc</span> limpa
          </p>
        </div>

        <div className="topLinks">
          <Link
            to="/about"
            className="pillLink"
            aria-label="Abrir página Sobre"
          >
            ℹ️ Sobre
          </Link>

          <Link
            to="/favorites"
            className="pillLink"
            aria-label="Abrir página de favoritos"
          >
            ⭐ Favoritos ({favorites.length})
          </Link>
        </div>
      </header>

      <form
        onSubmit={handleSubmit}
        className="form"
        role="search"
        aria-label="Buscar filmes e séries"
      >
        <input
          ref={inputRef}
          className="input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Digite um filme/série..."
          aria-label="Campo de busca"
          autoComplete="off"
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
            onClick={() => handleClear({ focusInput: true })}
            disabled={
              loading || (!query.trim() && movies.length === 0 && !error)
            }
            aria-label="Limpar busca"
          >
            Limpar
          </button>
        </div>
      </form>

      {recent.length > 0 && (
        <div className="recentRow" aria-label="Buscas recentes">
          <div className="recentLeft">
            <span className="recentLabel">Recentes:</span>

            <div className="chips">
              {recent.map((term) => (
                <button
                  key={term}
                  type="button"
                  className="chip"
                  onClick={() => {
                    skipDebounceRef.current = true;
                    setQuery(term);
                    startSearch(term);
                  }}
                  aria-label={`Buscar novamente por ${term}`}
                >
                  {term}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            className="chip chipDanger"
            onClick={() => {
              const next = clearRecentSearches();
              setRecent(next);
            }}
            aria-label="Limpar histórico de buscas"
          >
            Limpar histórico
          </button>
        </div>
      )}

      <section className="section" id="results">
        <div
          ref={resultsRef}
          tabIndex={-1}
          className="resultsFocus"
          aria-live="polite"
          aria-atomic="true"
        >
          {loading ? "Carregando resultados..." : ""}
        </div>

        {error && (
          <div className="errorBox" role="alert">
            <p className="error">{error}</p>
            <button
              className="button buttonSecondary"
              type="button"
              onClick={() => {
                const q = (activeQuery || query).trim();
                if (!q) return;
                startSearch(q);
              }}
            >
              Tentar novamente
            </button>
          </div>
        )}

        {!error && !loading && hasActiveQuery && (
          <div className="resultsBar">
            <p className="count" aria-live="polite">
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
                  aria-label="Ordenar resultados"
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
                  aria-label="Mostrar apenas favoritos"
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
          <ul className="grid" aria-label="Carregando lista de resultados">
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
            <ul className="grid" aria-label="Resultados da busca">
              {displayMovies.map((m) => {
                const isFav = favorites.some((f) => f.id === m.id);

                return (
                  <li key={m.id} className="card">
                    <Link
                      to={`/show/${m.id}`}
                      className="cardLink"
                      aria-label={`Abrir detalhes de ${m.title}`}
                    >
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
                          aria-label={
                            isFav
                              ? `Remover ${m.title} dos favoritos`
                              : `Adicionar ${m.title} aos favoritos`
                          }
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
                  aria-label="Carregar mais resultados"
                >
                  Carregar mais
                </button>
              </div>
            )}
          </>
        )}
      </section>

      <footer className="footer">
        <div className="footerLeft">
          <span>© {yearNow} Noelle Almeida</span>
          <span className="footerDot">•</span>
          <Link to="/about" className="footerLink">
            Sobre
          </Link>
        </div>

        <div className="footerRight">
          <a
            className="footerLink"
            href="https://github.com/NoelleAlmeida/buscador-filmes"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
          <span className="footerDot">•</span>
          <a
            className="footerLink"
            href="https://buscador-filmes-navy.vercel.app"
            target="_blank"
            rel="noreferrer"
          >
            Vercel
          </a>
        </div>
      </footer>
    </main>
  );
}
