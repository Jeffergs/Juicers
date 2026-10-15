import { useTranslation } from "../../context/language";
import "../../style/ComoFunciona.css";

const ICONS = [
  <path d="M12 5v14M5 12h14" />,
  <><path d="M3 3v18h18" /><path d="M7 14l4-4 3 3 5-6" /></>,
  <><circle cx="12" cy="12" r="9" /><path d="M12 8v4l3 2" /></>,
  <path d="M12 21s-8-4.5-8-11a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 6.5-8 11-8 11z" />,
];

const T = {
  pt: {
    eyebrow: "A solução",
    h2: "Uma camada de organização e acompanhamento.",
    p: "A Juicers não diz o que fazer com o seu corpo. Ele transforma exames soltos em uma trajetória legível e te orienta a buscar ajuda na hora certa.",
    steps: [
      { num: "01", t: "Registre exames", p: "Anexe seu pdf. Lipidograma, hormônios, fígado, rim, hemograma e perfil hormonal." },
      { num: "02", t: "Visualize indicadores", p: "Cada marcador na sua faixa de referência, fácil de ler." },
      { num: "03", t: "Acompanhe a evolução", p: "A trajetória mostra o que melhora, estabiliza ou pede atenção." },
      { num: "04", t: "Busque orientação", p: "Nos sinais de alerta, a Juicers indica a busca de um profissional." },
    ],
  },
  en: {
    eyebrow: "The solution",
    h2: "A layer of organization and tracking.",
    p: "Juicers doesn't tell you what to do with your body. It turns scattered exams into a readable trajectory and guides you to seek help at the right time.",
    steps: [
      { num: "01", t: "Log your exams", p: "Attach your pdf. Lipid panel, hormones, liver, kidney, blood count and hormonal profile." },
      { num: "02", t: "View indicators", p: "Each marker in its reference range, easy to read." },
      { num: "03", t: "Track the evolution", p: "The trajectory shows what improves, stabilizes or needs attention." },
      { num: "04", t: "Seek guidance", p: "On warning signs, Juicers points you toward a professional." },
    ],
  },
};

export default function ComoFunciona() {
  const t = useTranslation(T, "ComoFunciona.T");

  return (
    <section className="section" id="sol">
      <div className="wrap">
        <div className="reveal" style={{ maxWidth: 640 }}>
          <span className="eyebrow sec-tag">{t.eyebrow}</span>
          <h2 className="sec-h">{t.h2}</h2>
          <p className="sec-lead">{t.p}</p>
        </div>
        <div className="flow reveal">
          {t.steps.map((s, i) => (
            <div className="step" key={s.num}>
              <div className="node">
                <span className="num">{s.num}</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">{ICONS[i]}</svg>
              </div>
              <h4>{s.t}</h4>
              <p>{s.p}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
