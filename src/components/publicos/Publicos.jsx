import { useTranslation } from "../../context/language";
import "../../style/Publicos.css";

const ICONS = [
  [<><path d="M3 3v18h18"/><path d="M7 14l4-4 3 3 5-6"/></>, <path d="M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/>],
  [<><circle cx="12" cy="12" r="9"/><path d="M12 8v4l3 2"/></>, <path d="M4 19V5l8 4 8-4v14"/>],
  [<path d="M20 7 9 18l-5-5"/>, <path d="M12 21s-8-4.5-8-11a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 6.5-8 11-8 11z"/>],
];

const T = {
  pt: {
    eyebrow: "Para quem é",
    h2: "Uma plataforma, três frentes de cuidado.",
    cards: [
      {
        num: "01", role: "Para você", title: "Quem usa anabolizantes",
        p: "Você decide sobre o seu corpo e merece fazer isso com informação de verdade. Reúna seus exames, veja seus números evoluírem e saiba quando algo merece atenção. Sem sermão, sem julgamento.",
        feats: [
          { t: "Linha do tempo", p: "Todos os exames numa trajetória única." },
          { t: "Alertas discretos", p: "Avisa quando um marcador sai da faixa." },
        ],
      },
      {
        num: "02", role: "Apoio clínico", title: "Profissionais de saúde",
        p: "Acompanhe o histórico e a evolução dos indicadores dos seus pacientes em um só lugar. Identifique tendências mais cedo e baseie a conduta em dados organizados ao longo do tempo. A Juicers amplia o seu trabalho, não substitui sua avaliação.",
        feats: [
          { t: "Visão longitudinal", p: "Tendências em vez de exames isolados." },
          { t: "Histórico organizado", p: "Tudo do paciente, pronto para a consulta." },
        ],
      },
      {
        num: "03", role: "Na academia", title: "Profissionais do fitness",
        p: "Coach seus alunos confiam em você. Acompanhe sinais e indicadores, reconheça quando é hora de recomendar avaliação médica e atue com responsabilidade no seu papel. Cuidar e orientar na hora certa.",
        feats: [
          { t: "Sinais de atenção", p: "Saiba quando encaminhar a um médico." },
          { t: "Cuidado responsável", p: "Apoio sem prescrever, dentro do seu papel." },
        ],
      },
    ],
  },
  en: {
    eyebrow: "Who it's for",
    h2: "One platform, three fronts of care.",
    cards: [
      {
        num: "01", role: "For you", title: "People who use anabolic steroids",
        p: "You decide about your own body and deserve to do it with real information. Bring your exams together, watch your numbers evolve and know when something deserves attention. No lecture, no judgment.",
        feats: [
          { t: "Timeline", p: "All your exams in a single trajectory." },
          { t: "Discreet alerts", p: "Notifies you when a marker leaves its range." },
        ],
      },
      {
        num: "02", role: "Clinical support", title: "Healthcare professionals",
        p: "Track the history and evolution of your patients' indicators in one place. Spot trends earlier and base your approach on organized data over time. Juicers extends your work, it doesn't replace your assessment.",
        feats: [
          { t: "Longitudinal view", p: "Trends instead of isolated exams." },
          { t: "Organized history", p: "Everything about the patient, ready for the appointment." },
        ],
      },
      {
        num: "03", role: "At the gym", title: "Fitness professionals",
        p: "Your clients trust you. Track signals and indicators, recognize when it's time to recommend a medical evaluation and act responsibly within your role. Caring and guiding at the right time.",
        feats: [
          { t: "Warning signs", p: "Know when to refer someone to a doctor." },
          { t: "Responsible care", p: "Support without prescribing, within your role." },
        ],
      },
    ],
  },
};

export default function Publicos() {
  const t = useTranslation(T, "Publicos.T");

  return (
    <section className="section" id="pub">
      <div className="wrap">
        <div className="reveal" style={{ maxWidth: 640 }}>
          <span className="eyebrow sec-tag">{t.eyebrow}</span>
          <h2 className="sec-h">{t.h2}</h2>
        </div>
        <div className="aud-grid">
          {t.cards.map((c, i) => (
            <div className="aud-card reveal" key={c.num}>
              <span className="aud-num">{c.num}</span>
              <span className="ap-role">{c.role}</span>
              <h3>{c.title}</h3>
              <p>{c.p}</p>
              <div className="aud-feats">
                {c.feats.map((f, j) => (
                  <div className="aud-feat" key={f.t}>
                    <div className="af-t">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">{ICONS[i][j]}</svg> {f.t}
                    </div>
                    <p>{f.p}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
