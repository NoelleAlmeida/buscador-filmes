import { Link } from "react-router-dom";
import "./About.css";

export default function About() {
  const repo = "https://github.com/NoelleAlmeida/buscador-filmes";
  const live = "https://buscador-filmes-navy.vercel.app";

  return (
    <main className="aboutPage">
      <div className="aboutTop">
        <Link to="/" className="aboutPill">
          ← Voltar
        </Link>

        <Link to="/favorites" className="aboutPill">
          ⭐ Favoritos
        </Link>
      </div>

      <section className="aboutCard">
        <h1 className="aboutTitle">Sobre o CineBusca</h1>
        <p className="aboutMuted" style={{ marginTop: 10 }}>
          O <strong>CineBusca</strong> é um app feito para praticar React de
          forma bem próxima do mundo real: consumo de API, rotas, estados,
          persistência e deploy.
        </p>

        <div className="aboutLinks">
          <a className="aboutBtn" href={live} target="_blank" rel="noreferrer">
            🔗 Ver online (Vercel)
          </a>
          <a className="aboutBtn" href={repo} target="_blank" rel="noreferrer">
            💻 Ver código (GitHub)
          </a>
        </div>

        <div className="aboutGrid">
          <div>
            <h2 style={{ margin: "12px 0 0" }}>O que ele faz</h2>
            <ul className="aboutList">
              <li>Busca filmes/séries via API</li>
              <li>Exibe cards com imagem, nota e gêneros</li>
              <li>
                Página de detalhes (<code>/show/:id</code>)
              </li>
              <li>Favoritos com LocalStorage</li>
              <li>Ordenação, “carregar mais”, histórico de buscas</li>
              <li>
                URL compartilhável (ex: <code>?q=batman</code>)
              </li>
              <li>
                Atalhos: <code>/</code> foca, <code>Esc</code> limpa
              </li>
              <li>Testes com Vitest</li>
            </ul>
          </div>

          <div>
            <h2 style={{ margin: "12px 0 0" }}>Tecnologias</h2>
            <div className="aboutTagRow">
              <span className="aboutTag">React</span>
              <span className="aboutTag">Vite</span>
              <span className="aboutTag">React Router</span>
              <span className="aboutTag">Fetch API</span>
              <span className="aboutTag">LocalStorage</span>
              <span className="aboutTag">Vitest</span>
              <span className="aboutTag">Vercel</span>
            </div>

            <h2 style={{ margin: "14px 0 0" }}>Próximas melhorias</h2>
            <ul className="aboutList">
              <li>Cache de resultados por termo buscado</li>
              <li>Testes E2E (Playwright/Cypress)</li>
              <li>Modo claro/escuro</li>
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}
