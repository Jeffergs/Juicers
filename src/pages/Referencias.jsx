import { useMemo, useState } from "react";
import referencias, { CATEGORIES } from "../data/referencias";
import { useLanguage, useTranslation } from "../context/language";
import "../style/referencias.css";

const T = {
  pt: {
    kicker: "BASE CIENTÍFICA • JUICERS",
    h1: "Referências que sustentam o projeto.",
    p: "Fontes institucionais e científicas usadas para orientar os conteúdos sobre riscos, acompanhamento de exames, redução de danos e sinais de alerta relacionados ao uso de esteroides anabolizantes.",
    searchPlaceholder: "Buscar por tema, fonte ou palavra-chave...",
    filtersAriaLabel: "Filtros de referências",
    todos: "Todos",
    countLabel: (n) => (n === 1 ? "referência encontrada" : "referências encontradas"),
    noResults: "Nenhuma referência encontrada para essa busca.",
    acessar: "Acessar →",
  },
  en: {
    kicker: "SCIENTIFIC BASIS • JUICERS",
    h1: "References that support the project.",
    p: "Institutional and scientific sources used to guide content on risks, exam tracking, harm reduction and warning signs related to anabolic steroid use.",
    searchPlaceholder: "Search by topic, source or keyword...",
    filtersAriaLabel: "Reference filters",
    todos: "All",
    countLabel: (n) => (n === 1 ? "reference found" : "references found"),
    noResults: "No references found for this search.",
    acessar: "View →",
  },
};

function localized(field, lang) {
  if (lang === "en" && field.en) return field.en;
  return field.pt;
}

export default function Referencias() {
  const { lang } = useLanguage();
  const t = useTranslation(T, "Referencias.T");
  const [busca, setBusca] = useState("");
  const [filtroAtivo, setFiltroAtivo] = useState("todos");

  const filtros = useMemo(
    () => [
      { id: "todos", label: t.todos },
      ...Object.entries(CATEGORIES).map(([id, cat]) => ({
        id,
        label: localized(cat.filterLabel, lang),
      })),
    ],
    [t, lang]
  );

  const referenciasFiltradas = useMemo(() => {
    return referencias
      .map((ref) => ({
        ...ref,
        tituloTxt: localized(ref.titulo, lang),
        descricaoTxt: localized(ref.descricao, lang),
        categoriaTxt: localized(CATEGORIES[ref.categoriaId].fullLabel, lang),
      }))
      .filter((ref) => {
        const textoBusca = busca.toLowerCase().trim();

        const combinaBusca =
          textoBusca === "" ||
          ref.tituloTxt.toLowerCase().includes(textoBusca) ||
          ref.categoriaTxt.toLowerCase().includes(textoBusca) ||
          ref.fonte.toLowerCase().includes(textoBusca) ||
          ref.descricaoTxt.toLowerCase().includes(textoBusca);

        const combinaFiltro = filtroAtivo === "todos" || ref.categoriaId === filtroAtivo;

        return combinaBusca && combinaFiltro;
      });
  }, [busca, filtroAtivo, lang]);

  return (
    <main className="referencias-page">
      <section className="referencias-hero">
        <span className="ref-kicker">{t.kicker}</span>

        <h1>{t.h1}</h1>

        <p>{t.p}</p>

        <div className="ref-controls">
          <label className="search-bar">
            <span>⌕</span>

            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={busca}
              onChange={(event) => setBusca(event.target.value)}
            />
          </label>

          <div className="filters" aria-label={t.filtersAriaLabel}>
            {filtros.map((filtro) => (
              <button
                key={filtro.id}
                type="button"
                className={`filter ${filtroAtivo === filtro.id ? "active" : ""}`}
                onClick={() => setFiltroAtivo(filtro.id)}
              >
                {filtro.label}
              </button>
            ))}
          </div>

          <p className="ref-count">
            <b>{referenciasFiltradas.length}</b>{" "}
            {t.countLabel(referenciasFiltradas.length)}
          </p>
        </div>
      </section>

      <section className="ref-grid-3">
        {referenciasFiltradas.length > 0 ? (
          referenciasFiltradas.map((ref) => (
            <article className="ref-card" key={ref.id}>
              <div className="ref-card__top">
                <span className="ref-card__category">{ref.categoriaTxt}</span>
                <span className="ref-card__year">{ref.ano}</span>
              </div>

              <h2>{ref.tituloTxt}</h2>

              <p>{ref.descricaoTxt}</p>

              <div className="ref-card__footer">
                <span>{ref.fonte}</span>

                <a href={ref.link} target="_blank" rel="noreferrer">
                  {t.acessar}
                </a>
              </div>
            </article>
          ))
        ) : (
          <p className="no-results">{t.noResults}</p>
        )}
      </section>
    </main>
  );
}
