import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getFavorites, toggleFavorite } from "../utils/favorites";
import "./ShowDetails.css";

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
    <main className="detailsContainer">
      <div className="detailsTopbar">
        <Link to="/" className="detailsLink">
          ← Voltar
        </Link>

        <Link to="/favorites" className="detailsPillLink">
          ⭐ Favoritos ({favorites.length})
        </Link>
      </div>

      {loading && <p className="detailsLoading">Carregando...</p>}
      {error && <p className="detailsError">{error}</p>}

      {!loading && !error && show && (
        <article className="detailsGrid">
          <div>
            {show.image?.medium ? (
              <div className="detailsPoster">
                <img src={show.image.medium} alt={`Poster de ${show.name}`} />
              </div>
            ) : (
              <div className="detailsPosterEmpty">Sem imagem</div>
            )}

            <button
              type="button"
              className="detailsFavBtn"
              onClick={() => {
                if (!mappedForFavorites) return;
                const next = toggleFavorite(mappedForFavorites);
                setFavorites(next);
              }}
            >
              {isFav ? "★ Remover dos favoritos" : "☆ Favoritar"}
            </button>
          </div>

          <div>
            <h1 className="detailsTitle">{show.name}</h1>

            <p className="detailsMeta">
              ⭐ {show.rating?.average ?? "—"} •{" "}
              {show.premiered ? show.premiered.slice(0, 4) : "—"} •{" "}
              {show.genres?.length ? show.genres.join(" • ") : "Sem gênero"}
            </p>

            {show.summary ? (
              <div
                className="detailsSummary"
                dangerouslySetInnerHTML={{ __html: show.summary }}
              />
            ) : (
              <p className="detailsSummary">Sem descrição.</p>
            )}

            {show.officialSite && (
              <p className="detailsSummary">
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
