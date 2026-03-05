import { useState } from "react";

export default function App() {
  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
    <main
      style={{
        padding: 24,
        fontFamily: "system-ui",
        maxWidth: 900,
        margin: "0 auto",
      }}
    >
      <h1>Buscador de Filmes 🎬</h1>

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", gap: 12, marginTop: 16 }}
      >
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Digite um filme/série..."
          style={{ flex: 1, padding: 12, fontSize: 16 }}
        />
        <button
          disabled={loading}
          style={{ padding: "12px 16px", fontSize: 16 }}
        >
          {loading ? "Buscando..." : "Buscar"}
        </button>
      </form>

      <section style={{ marginTop: 24 }}>
        {error && <p style={{ color: "crimson" }}>{error}</p>}

        {!error && !loading && movies.length === 0 && (
          <p>Faça uma busca para ver resultados.</p>
        )}

        {movies.length > 0 && (
          <ul
            style={{ listStyle: "none", padding: 0, display: "grid", gap: 12 }}
          >
            {movies.map((m) => (
              <li
                key={m.id}
                style={{
                  border: "1px solid #ddd",
                  borderRadius: 8,
                  padding: 12,
                }}
              >
                <strong>{m.title}</strong>
                <div style={{ opacity: 0.8 }}>Ano: {m.year}</div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
