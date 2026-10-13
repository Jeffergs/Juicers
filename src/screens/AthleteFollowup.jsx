import '../style/athleteFollowup.css'

function getInitials(name = '') {
  return name.split(' ').filter(Boolean).slice(0, 2).map(part => part[0]).join('').toUpperCase()
}

function SectionIcon({ notes = false }) {
  return (
    <span className="af-section-icon" aria-hidden="true">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        {notes ? <><path d="M5 4h14v16H5z" /><path d="M9 8h6M9 12h6M9 16h4" /></> : <><rect x="4" y="5" width="16" height="16" rx="2" /><path d="M8 3v4M16 3v4M4 11h16M9 16h6" /></>}
      </svg>
    </span>
  )
}

export default function AthleteFollowup({ doctor, loadingDoctor, requestedList, notesHistory }) {
  return (
    <div className="af-page">
      <header className="af-header">
        <h1>Acompanhamento Médico</h1>
        <p>Anotações e solicitações do seu médico responsável.</p>
      </header>

      <section className="af-doctor-card" aria-label="Médico responsável">
        <span className="af-doctor-avatar" aria-hidden="true">{doctor?.name ? getInitials(doctor.name) : '—'}</span>
        <div className="af-doctor-info">
          <span className="af-eyebrow">Médico responsável</span>
          {loadingDoctor ? <p role="status">Carregando médico responsável...</p> : doctor ? <>
            <h2>{doctor.name}</h2>
            <p>{doctor.specialty || 'Especialidade não informada'} · {doctor.crm ? `CRM ${doctor.crm}` : 'CRM não informado'}</p>
          </> : <p>Nenhum médico vinculado ainda.</p>}
        </div>
        {doctor && <span className="af-doctor-badge">Vinculado</span>}
      </section>

      <div className="af-grid">
        <section className="af-panel" aria-labelledby="af-exams-title">
          <div className="af-panel-heading">
            <SectionIcon />
            <div><h2 id="af-exams-title">Próximos exames solicitados</h2><p>Confira as solicitações do seu médico.</p></div>
          </div>
          <div className="af-list">
            {loadingDoctor ? <p className="af-empty" role="status">Carregando solicitações...</p> : requestedList.length > 0 ? requestedList.map((exam, index) => (
              <article key={index} className="af-request">
                <SectionIcon />
                <div><h3>{exam.label}</h3><p>Solicitado em {exam.date || 'data não informada'}</p></div>
              </article>
            )) : <p className="af-empty">Nenhum exame solicitado no momento.</p>}
          </div>
        </section>

        <section className="af-panel" aria-labelledby="af-notes-title">
          <div className="af-panel-heading">
            <SectionIcon notes />
            <div><h2 id="af-notes-title">Anotações do seu médico</h2><p>Orientações registradas no seu acompanhamento.</p></div>
          </div>
          <div className="af-list">
            {loadingDoctor ? <p className="af-empty" role="status">Carregando anotações...</p> : notesHistory.length > 0 ? notesHistory.map((note, index) => (
              <article key={index} className="af-note">
                <span className="af-note-date">{note.date || 'Data não informada'}</span>
                <p>{note.text}</p>
              </article>
            )) : <p className="af-empty">Seu médico ainda não registrou anotações.</p>}
          </div>
        </section>
      </div>
    </div>
  )
}
