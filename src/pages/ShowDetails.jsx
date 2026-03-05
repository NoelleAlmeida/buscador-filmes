import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getFavorites, toggleFavorite } from "../utils/favorites";

export default function ShowDetails() {
  const { id } = useParams();

  const [show, setShow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    setFavorites(getFavorites());
  }, []);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");

      try {
        const res = await fetch(`https://api.tvmaze.com/shows/${id}`);
        if (!res.ok) throw new Error("Não foi possível carregar os detalhes.");

        const data = await res.json();
        setShow(data);
      } catch (err) {
        setError(err.message || "Erro inesperado.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id]);

  const mappedForFavorites = useMemo(() => {
    if (!show) return null;
    return {
      id: show.id,
      title: show.name,
      year: show.premiered ? show.premiered.slice(0, 4) : "—",
      image: show.image?.medium || "",
      genres: show.genres || [],
      rating: show.rating?.average ?? null,
    };
  }, [show]);

  const isFav = useMemo(() => {
    return favorites.some((f) => String(f.id) === String(id));
  }, [favorites, id]);

  return (
    <main
      style={{
        maxWidth: 980,
        margin: "0 auto",
        padding: 24,
        fontFamily: "system-ui",
      }}
    >
      <div
        style={{ display: "flex", justifyContent: "space-between", gap: 12 }}
      >
        <Link to="/" style={{ textDecoration: "none" }}>
          ← Voltar
        </Link>

        <Link to="/favorites" style={{ textDecoration: "none" }}>
          ⭐ Favoritos ({favorites.length})
        </Link>
      </div>

      {loading && <p style={{ marginTop: 16 }}>Carregando...</p>}
      {error && <p style={{ marginTop: 16, color: "crimson" }}>{error}</p>}

      {!loading && !error && show && (
        <article
          style={{
            marginTop: 16,
            display: "grid",
            gap: 16,
            gridTemplateColumns: "260px 1fr",
            alignItems: "start",
          }}
        >
          <div>
            {show.image?.medium ? (
              <img
                src={show.image.medium}
                alt={`Poster de ${show.name}`}
                style={{ width: "100%", borderRadius: 12 }}
              />
            ) : (
              <div
                style={{
                  width: "100%",
                  aspectRatio: "2/3",
                  background: "#f2f2f2",
                  borderRadius: 12,
                  display: "grid",
                  placeItems: "center",
                }}
              >
                Sem imagem
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                if (!mappedForFavorites) return;
                const next = toggleFavorite(mappedForFavorites);
                setFavorites(next);
              }}
              style={{
                marginTop: 12,
                width: "100%",
                padding: "10px 12px",
                border: "1px solid #e3e3e3",
                borderRadius: 10,
                cursor: "pointer",
                background: "white",
              }}
            >
              {isFav ? "★ Remover dos favoritos" : "☆ Favoritar"}
            </button>
          </div>

          <div>
            <h1 style={{ margin: 0 }}>{show.name}</h1>

            <p style={{ opacity: 0.85, marginTop: 8 }}>
              ⭐ {show.rating?.average ?? "—"} •{" "}
              {show.premiered ? show.premiered.slice(0, 4) : "—"} •{" "}
              {show.genres?.length ? show.genres.join(" • ") : "Sem gênero"}
            </p>

            {show.summary ? (
              <div
                style={{ marginTop: 12, lineHeight: 1.5 }}
                dangerouslySetInnerHTML={{ __html: show.summary }}
              />
            ) : (
              <p style={{ marginTop: 12 }}>Sem descrição.</p>
            )}

            {show.officialSite && (
              <p style={{ marginTop: 12 }}>
                Site oficial:{" "}
                <a href={show.officialSite} target="_blank" rel="noreferrer">
                  {show.officialSite}
                </a>
              </p>
            )}
          </div>
        </article>
      )}
    </main>
  );
}
