import { useTranslation } from "../../context/language";
import "../../style/oQueAcompanhar.css";

const HeartIco = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 1 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8z"/></svg>);
const HormonIco = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>);
const LiverIco = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 4h10l-1 7a5 5 0 0 1-8 0L7 4z"/><path d="M9 20h6"/></svg>);

const ICONS = [HeartIco, HormonIco, LiverIco];

const T = {
  pt: {
    eyebrow: "O que vale acompanhar",
    h2: "Cada parte do corpo dá sinais.",
    p: "A Juicers ajuda você a enxergá-los a tempo com exames de rotina, fáceis de acompanhar.",
    cards: [
      { t: "Coração", p: "Pressão e colesterol podem se alterar de forma silenciosa é o que menos se vê e mais importa acompanhar.", track: "pressão arterial, HDL, LDL e triglicérides." },
      { t: "Hormônios", p: "A produção natural de testosterona pode oscilar. Acompanhar mostra como o corpo está respondendo ao longo do tempo.", track: "testosterona total e livre, LH e FSH." },
      { t: "Fígado e rim", p: "Marcadores hepáticos e renais contam muito sobre como o organismo está lidando com a rotina.", track: "ALT, AST, GGT, ureia e creatinina." },
    ],
    trackLabel: "O que acompanhar:",
  },
  en: {
    eyebrow: "What's worth tracking",
    h2: "Every part of the body gives signals.",
    p: "Juicers helps you spot them in time with routine exams, easy to track.",
    cards: [
      { t: "Heart", p: "Blood pressure and cholesterol can change silently — it's what you see the least and matters the most to track.", track: "blood pressure, HDL, LDL and triglycerides." },
      { t: "Hormones", p: "Natural testosterone production can fluctuate. Tracking shows how your body is responding over time.", track: "total and free testosterone, LH and FSH." },
      { t: "Liver and kidney", p: "Liver and kidney markers say a lot about how your body is handling the routine.", track: "ALT, AST, GGT, urea and creatinine." },
    ],
    trackLabel: "What to track:",
  },
};

export default function OQueAcompanhar() {
  const t = useTranslation(T, "OQueAcompanhar.T");

  return (
    <section id="monitorar" className="section" style={{ background: "var(--j-surface)" }}>
      <div className="wrap">
        <div className="sec-head">
          <span className="eyebrow">{t.eyebrow}</span>
          <h2>{t.h2}</h2>
          <p>{t.p}</p>
        </div>
        <div className="mon-grid">
          {t.cards.map(({ t: title, p, track }, i) => {
            const Ico = ICONS[i];
            return (
              <div className="mon" key={i}>
                <div className="mon-head"><div className="mon-ico"><Ico /></div><h3>{title}</h3></div>
                <p>{p}</p>
                <div className="mon-track"><span>📋</span><div>{t.trackLabel} {track}</div></div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
