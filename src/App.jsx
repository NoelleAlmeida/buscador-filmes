import { useState } from "react";

export default function App() {
  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState([]);

  function handleSubmit(e) {
    e.preventDefault();
    // depois a gente busca na API aqui
    setMovies([
      { id: 1, title: "Exemplo de Filme 1", year: "2024" },
      { id: 2, title: "Exemplo de Filme 2", year: "2023" },
    ]);
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
          placeholder="Digite o nome de um filme..."
          style={{ flex: 1, padding: 12, fontSize: 16 }}
        />
        <button style={{ padding: "12px 16px", fontSize: 16 }}>Buscar</button>
      </form>

      <section style={{ marginTop: 24 }}>
        {movies.length === 0 ? (
          <p>Faça uma busca para ver resultados.</p>
        ) : (
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
