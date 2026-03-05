import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getFavorites, toggleFavorite } from "./utils/favorites";
import "./App.css";

export default function App() {
  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState([]);
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

    try {
      const res = await fetch(
        `https://api.tvmaze.com/search/shows?q=${encodeURIComponent(q)}`,
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
      setError(err.message || "Erro inesperado.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="container">
      <header className="header">
        <div className="headerRow">
          <div>
            <h1 className="title">Buscador de Filmes 🎬</h1>
            <p className="subtitle">React + Vite + API</p>
          </div>

          <Link to="/favorites" className="favoritesLink">
            ⭐ Favoritos ({favorites.length})
          </Link>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="form">
        <input
          className="input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Digite um filme/série..."
        />
        <button className="button" disabled={loading}>
          {loading ? "Buscando..." : "Buscar"}
        </button>
      </form>

      <section className="section">
        {error && <p className="error">{error}</p>}

        {!error && !loading && movies.length === 0 && (
          <p className="muted">Faça uma busca para ver resultados.</p>
        )}

        {!error && !loading && query.trim() && movies.length === 0 && (
          <p className="muted">Nenhum resultado encontrado.</p>
        )}

        {movies.length > 0 && (
          <ul className="grid">
            {movies.map((m) => {
              const isFav = favorites.some((f) => f.id === m.id);

              return (
                <li key={m.id} className="card">
                  <Link to={`/show/${m.id}`} className="cardLink">
                    <div className="posterWrap">
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
                          e.preventDefault(); // não navegar
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
        )}
      </section>
    </main>
  );
}
