import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getFavorites } from "../utils/favorites";

export default function Favorites() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    setItems(getFavorites());
  }, []);

  return (
    <main
      style={{
        maxWidth: 980,
        margin: "0 auto",
        padding: 24,
        fontFamily: "system-ui",
      }}
    >
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
        }}
      >
        <h1 style={{ margin: 0 }}>⭐ Favoritos</h1>
        <Link to="/" style={{ textDecoration: "none" }}>
          ← Voltar
        </Link>
      </header>
      <div style={{ marginTop: 12 }}>
        <button
          onClick={() => setItems(getFavorites())}
          style={{
            padding: "10px 12px",
            border: "1px solid #e3e3e3",
            borderRadius: 10,
            cursor: "pointer",
            background: "white",
          }}
        >
          🔄 Atualizar lista
        </button>
      </div>

      <section style={{ marginTop: 16 }}>
        {items.length === 0 ? (
          <p style={{ opacity: 0.8 }}>Você ainda não favoritou nada.</p>
        ) : (
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              display: "grid",
              gap: 12,
              gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
            }}
          >
            {items.map((m) => (
              <li
                key={m.id}
                style={{
                  border: "1px solid #e3e3e3",
                  borderRadius: 14,
                  overflow: "hidden",
                  background: "white",
                }}
              >
                <Link
                  to={`/show/${m.id}`}
                  style={{
                    display: "block",
                    textDecoration: "none",
                    color: "inherit",
                  }}
                >
                  <div
                    style={{
                      width: "100%",
                      aspectRatio: "16 / 9",
                      background: "#f2f2f2",
                    }}
                  >
                    {m.image ? (
                      <img
                        src={m.image}
                        alt={`Poster de ${m.title}`}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <div style={{ padding: 12, opacity: 0.7 }}>
                        Sem imagem
                      </div>
                    )}
                  </div>

                  <div style={{ padding: 12 }}>
                    <strong>{m.title}</strong>
                    <div style={{ opacity: 0.8, marginTop: 6 }}>
                      ⭐ {m.rating ?? "—"} • {m.year ?? "—"}
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
