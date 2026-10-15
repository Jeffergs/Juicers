import { useTranslation } from "../../../context/language";
import "../../../style/SecaoProjeto.css";

const T = {
  pt: {
    eyebrow: "Sobre o projeto",
    h2: "Acompanhar é cuidar.",
    p: "A Juicers é uma ferramenta de acompanhamento de saúde, educação e redução de danos para quem usa anabolizantes, e para os profissionais que os apoiam. A maioria das pessoas já conhece os riscos; o que costuma faltar é acompanhamento. Em vez de julgar, ajudamos a enxergar e a decidir melhor.",
    sealTitle: "Privado por padrão",
    sealP: "Seus dados ficam no nosso banco de dados e são compartilhados com o médico que você vincular. Você pode exportá-los ou excluir sua conta.",
  },
  en: {
    eyebrow: "About the project",
    h2: "Tracking is caring.",
    p: "Juicers is a health tracking, education and harm reduction tool for people who use anabolic steroids, and for the professionals who support them. Most people already know the risks; what's usually missing is tracking. Instead of judging, we help you see clearly and decide better.",
    sealTitle: "Private by default",
    sealP: "Your data is stored in our database and shared with the doctor you link. You can export it or delete your account.",
  },
};

export default function SecaoSobre() {
  const t = useTranslation(T, "SecaoSobre.T");

  return (
    <section id="sobre" className="section" style={{ background: "var(--j-surface)" }}>
      <div className="wrap">
        <div className="about-grid">
          <div className="reveal">
            <span className="eyebrow">{t.eyebrow}</span>
            <h2 style={{ fontSize: "clamp(1.8rem,3.5vw,2.6rem)", margin: "12px 0 16px" }}>
              {t.h2}
            </h2>
            <p>
              {t.p}
            </p>
          </div>
          <div className="seal reveal">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <h4>{t.sealTitle}</h4>
            <p>{t.sealP}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
