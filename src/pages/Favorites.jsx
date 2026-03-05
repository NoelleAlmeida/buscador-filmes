import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  clearFavorites,
  getFavorites,
  removeFavorite,
} from "../utils/favorites";
import "./Favorites.css";

export default function Favorites() {
  const [items, setItems] = useState([]);

  function refresh() {
    setItems(getFavorites());
  }

  useEffect(() => {
    refresh();
  }, []);

  return (
    <main className="favPage">
      <div className="favTop">
        <h1 style={{ margin: 0 }}>⭐ Favoritos</h1>
        <Link to="/" className="favPill">
          ← Voltar
        </Link>
      </div>

      <div className="favActions">
        <button className="favBtn" onClick={refresh} type="button">
          🔄 Atualizar
        </button>

        <button
          className="favBtn favBtnDanger"
          type="button"
          disabled={items.length === 0}
          onClick={() => {
            const ok = confirm(
              "Tem certeza que deseja limpar todos os favoritos?",
            );
            if (!ok) return;
            clearFavorites();
            refresh();
          }}
        >
          🗑 Limpar tudo
        </button>
      </div>

      {items.length === 0 ? (
        <p className="favMuted">Você ainda não favoritou nada.</p>
      ) : (
        <ul className="favGrid">
          {items.map((m) => (
            <li key={m.id} className="favCard">
              <Link to={`/show/${m.id}`} className="favCardLink">
                <div className="favPoster">
                  {m.image ? (
                    <img src={m.image} alt={`Poster de ${m.title}`} />
                  ) : (
                    <div style={{ opacity: 0.8 }}>Sem imagem</div>
                  )}
                </div>

                <div className="favBody">
                  <div className="favRow">
                    <strong className="favTitle">{m.title}</strong>
                    <span className="favPillSmall">{m.year ?? "—"}</span>
                  </div>

                  <div className="favMeta">
                    ⭐ {m.rating ?? "—"} •{" "}
                    {m.genres?.length
                      ? m.genres.slice(0, 2).join(" • ")
                      : "Sem gênero"}
                  </div>

                  <button
                    type="button"
                    className="favRemove"
                    onClick={(e) => {
                      e.preventDefault(); // não navegar
                      removeFavorite(m.id);
                      refresh();
                    }}
                  >
                    Remover dos favoritos
                  </button>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
