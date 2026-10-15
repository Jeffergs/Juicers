import React from 'react';
import '../../style/primitive.css';

/** Campo de formulário (label + input controlado). accent: 'amber' | 'teal'. */
export function Field({ label, value, onChange, type = 'text', accent = 'amber', placeholder, style }) {
  return (
    <div className="jc-field" style={style}>
      <label className="jc-field-label">{label}</label>
      <input
        className={`jc-input ${accent}`}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
    </div>
  );
}

/** Cartão de seção de formulário. */
export function SectionCard({ title, desc, children, style }) {
  return (
    <section className="jc-section-card" style={style}>
      {title && (
        <div className="jc-section-card-heading">
          <h2 className="jc-section-card-title">{title}</h2>
          {desc && <p className="jc-section-card-desc">{desc}</p>}
        </div>
      )}
      {children}
    </section>
  );
}

/** Linha de exame importado. */
export function ExamRow({ exam, accent = 'amber', onDetails }) {
  return (
    <div className="jc-exam-row">
      <div className="jc-exam-row-meta">
        <span className="jc-exam-row-date">{exam.date}</span>
        <span className="jc-exam-row-lab">{exam.lab}</span>
      </div>
      <span className="jc-exam-row-markers">{exam.markers} marcadores</span>
      <span
        className="jc-exam-row-status"
        style={{
          color: exam.statusColor,
          background: exam.statusBg,
          borderColor: exam.statusBorder,
        }}
      >
        {exam.statusLabel}
      </span>
      <button onClick={onDetails} className={`jc-btn-ghost ${accent}`}>
        Ver detalhes
      </button>
    </div>
  );
}

/** Cartão de anotação clínica (data + texto). */
export function NoteCard({ note }) {
  return (
    <div className="jc-note-card">
      <span className="jc-note-card-date">{note.date}</span>
      <p className="jc-note-card-text">{note.text}</p>
    </div>
  );
}

/** Cabeçalho de página (título + subtítulo). */
export function PageHeader({ title, sub }) {
  return (
    <div className="jc-page-header">
      <h1 className="jc-page-header-title">{title}</h1>
      {sub && <p className="jc-page-header-sub">{sub}</p>}
    </div>
  );
}

/** Rótulo de seção (caixa-alta). */
export function SectionLabel({ children, style }) {
  return (
    <h2 className="jc-section-label" style={style}>
      {children}
    </h2>
  );
}
