import { Link } from "react-router-dom";
import { useTranslation } from "../../context/language";
import "../../style/cta.css";

const T = {
  pt: {
    h2: "Acompanhe sua saúde com mais clareza.",
    p: "Organize seus exames e entenda a evolução dos seus indicadores.",
    primary: "Começar agora",
  },
  en: {
    h2: "Track your health with greater clarity.",
    p: "Organize your exams and understand how your indicators change over time.",
    primary: "Start now",
  },
};

export default function CTAFinal() {
  const t = useTranslation(T, "CTAFinal.T");

  return (
    <section className="cta" id="feedback">
      <div className="wrap">
        <div className="cta-card reveal">
          <div className="cta-inner">
            <div>
              <h2>{t.h2}</h2>
              <p>{t.p}</p>
            </div>
            <div className="cta-actions">
              <Link className="btn-j btn-primary-j" to="/login">{t.primary}</Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
