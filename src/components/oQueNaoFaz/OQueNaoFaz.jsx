import { useTranslation } from "../../context/language";
import "../../style/OQueNaoFaz.css";

const X = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6 6 18M6 6l12 12" /></svg>
);

const T = {
  pt: {
    eyebrow: "Transparência",
    h2Pre: "O que a Juicers ",
    h2Not: "não",
    h2Post: " faz",
    pPre: "Acompanhar não é prescrever. A Juicers existe para dar clareza e reduzir danos — sempre incentivando a orientação profissional. ",
    pGreen: "Educação em saúde, do começo ao fim.",
    items: [
      "Não prescreve ciclos",
      "Não sugere doses ou substâncias",
      "Não incentiva o uso de anabolizantes",
      "Não substitui consulta, diagnóstico ou tratamento médico",
    ],
  },
  en: {
    eyebrow: "Transparency",
    h2Pre: "What Juicers ",
    h2Not: "doesn't",
    h2Post: " do",
    pPre: "Tracking is not prescribing. Juicers exists to bring clarity and reduce harm — always encouraging professional guidance. ",
    pGreen: "Health education, from start to finish.",
    items: [
      "Doesn't prescribe cycles",
      "Doesn't suggest doses or substances",
      "Doesn't encourage the use of anabolic steroids",
      "Doesn't replace a medical consultation, diagnosis or treatment",
    ],
  },
};

export default function OQueNaoFaz() {
  const t = useTranslation(T, "OQueNaoFaz.T");

  return (
    <section id="naofaz" className="section">
      <div className="wrap">
        <div className="notdo reveal">
          <div>
            <span className="eyebrow">{t.eyebrow}</span>
            <h2 style={{ marginTop: 12 }}>
              {t.h2Pre}<span style={{ color: "var(--j-red)" }}>{t.h2Not}</span>{t.h2Post}
            </h2>
            <p>
              {t.pPre}
              <span className="green">{t.pGreen}</span>
            </p>
          </div>
          <ul>
            {t.items.map((item) => (
              <li key={item}><X /> {item}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
