import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

export default function ShowDetails() {
  const { id } = useParams();

  const [show, setShow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  return (
    <main
      style={{
        maxWidth: 980,
        margin: "0 auto",
        padding: 24,
        fontFamily: "system-ui",
      }}
    >
      <Link to="/" style={{ textDecoration: "none" }}>
        ← Voltar
      </Link>

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
