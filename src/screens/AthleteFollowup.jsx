import { useUiText } from '../context/uiText'
import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import '../style/athleteFollowup.css'

export function FollowupIcon({ type = 'message' }) {
  const paths = {
    message: <><path d="M4 4h16v13H9l-5 4V4Z" /><path d="M8 9h8M8 13h5" /></>,
    exam: <><path d="M9 3h6M10 3v7L6 20h12l-4-10V3M9 15h6" /></>,
    calendar: <><rect x="4" y="5" width="16" height="16" rx="2" /><path d="M8 3v4M16 3v4M4 11h16M8 15h8" /></>,
    document: <><path d="M6 3h9l4 4v14H6V3ZM15 3v5h4M9 12h7M9 16h5" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l4 2" /></>,
    heart: <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z" />,
    check: <path d="m5 12 4 4L19 6" />,
    upload: <><path d="M12 16V3m-5 5 5-5 5 5M4 15v6h16v-6" /></>,
    arrow: <path d="M4 12h16m-6-6 6 6-6 6" />,
    info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v6M12 7h.01" /></>,
  }
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[type] || paths.message}</svg>
}
const date = value => value ? new Date(/^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T12:00:00` : value).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).replaceAll(' de ', ' ').replace('.', '') : 'Sem data definida'
const initials = name => (name || '').replace(/^(Dra?\.?\s+)/i, '').split(' ').filter(Boolean).slice(0, 2).map(part => part[0]).join('').toUpperCase()

function FollowupDialog({ children, ...props }) {
  const ref = useRef(null)
  useEffect(() => { const dialog = ref.current; dialog.showModal(); return () => dialog.close() }, [])
  return <dialog ref={ref} {...props}>{children}</dialog>
}
function SectionHeading({ icon, title, subtitle, children }) {
  return <div className="af-panel-heading"><span className="af-small-icon"><FollowupIcon type={icon} /></span><div><h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div>{children}</div>
}
export default function AthleteFollowup({ data, loading, error, success, busy, onAction, onRetry }) {
  const ui = useUiText()

  const { doctor, notes = [], requestedExams = [], interactions = [] } = data
  const name = doctor?.userId?.name || 'Profissional responsável'
  const [question, setQuestion] = useState(null)
  const [text, setText] = useState('')
  const [upload, setUpload] = useState(null)
  const [file, setFile] = useState(null)
  const [fileError, setFileError] = useState('')
  const [performed, setPerformed] = useState(null)
  const [performedDate, setPerformedDate] = useState('')
  const [allHistory, setAllHistory] = useState(false)
  const location = useLocation()
  useEffect(() => {
    if (!loading && new URLSearchParams(location.search).get('respostas') === 'novas') {
      document.getElementById('af-communication')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [loading, location.key, location.search])



  const pending = requestedExams.filter(exam => !exam.submittedAt)
  const next = pending[0]
  const events = [
    ...notes.map(note => ({ id: `n-${note._id}`, title: 'Nova orientação registrada', detail: note.text, date: note.createdAt, icon: 'document' })),
    ...requestedExams.flatMap(exam => [{ id: `e-${exam._id}`, title: `${exam.label} solicitado`, detail: 'Exame solicitado para acompanhamento.', date: exam.createdAt, icon: 'calendar' }, ...(exam.submittedAt ? [{ id: `r-${exam._id}`, title: 'Novo resultado de exame', detail: exam.label, date: exam.submittedAt, icon: 'exam' }] : []), ...(exam.reviewedAt ? [{ id: `v-${exam._id}`, title: 'Seu profissional revisou o resultado', detail: exam.label, date: exam.reviewedAt, icon: 'check' }] : [])]),
    ...interactions.map(item => ({ id: item._id, title: item.reply ? 'Resposta do profissional' : item.kind === 'checkin' ? 'Check-in enviado' : 'Mensagem enviada', detail: item.reply || item.text || item.mood, date: item.repliedAt || item.createdAt, icon: 'message' })),
  ].sort((a, b) => new Date(a.date) - new Date(b.date))
  const lastUpdate = events.at(-1)?.date
  const visibleEvents = allHistory ? events : events.slice(-4)
  const scroll = id => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  const openQuestion = context => { setText(''); setQuestion(context) }
  const empty = label => <p className="af-empty">{loading ? 'Carregando acompanhamento…' : label}</p>
  const stats = [
    { label: 'Próximo exame', value: loading ? 'Carregando…' : next ? next.dueDate ? date(next.dueDate.slice(0, 10)) : 'Prazo a definir' : 'Sem solicitação', detail: next?.label || 'Nenhum exame pendente', icon: 'calendar', tone: 'teal', action: () => scroll('af-plan') },
    { label: 'Última revisão', value: notes[0] ? date(notes[0].updatedAt || notes[0].createdAt) : 'Sem orientação', detail: notes.length ? 'Orientações atualizadas' : 'Aguardando seu profissional', icon: 'document', tone: 'blue', action: () => document.getElementById('af-orientations')?.scrollIntoView({ behavior: 'smooth' }) },
    { label: 'Pendências', value: `${pending.length} ${pending.length === 1 ? 'ação' : 'ações'}`, detail: pending.length ? 'Exames a realizar ou enviar' : 'Nenhuma ação pendente', icon: 'info', tone: 'orange', action: () => scroll('af-plan') },
    { label: 'Status do acompanhamento', value: doctor ? 'Ativo' : 'Sem vínculo', detail: doctor ? `Com ${name}` : 'Nenhum profissional vinculado', icon: 'heart', tone: 'green', action: () => scroll('af-communication') },
  ]
  return <div className="af-page" aria-busy={loading || busy}>
    <header className="af-header"><div><h1>{ui("Meu acompanhamento")}</h1><p>Profissionais, orientações e ações relacionadas à sua saúde.</p></div>{lastUpdate && <span className="af-updated"><FollowupIcon type="calendar" /> Última atualização em {date(lastUpdate)}</span>}</header>
    {error && <div className="af-feedback af-feedback--error" role="alert">{error} <button disabled={busy || loading} onClick={onRetry}>{ui("Tentar novamente")}</button></div>}
    {success && <p className="af-feedback" role="status">{success}</p>}
    <div className="af-stats">{stats.map(stat => <button className={`af-stat af-stat--${stat.tone}`} key={stat.label} onClick={stat.action}><span className="af-stat-icon"><FollowupIcon type={stat.icon} /></span><span className="af-stat-copy"><span className="af-stat-label">{stat.label}</span><strong>{stat.value}</strong><span>{stat.detail}</span></span></button>)}</div>
    <section className="af-doctor-card" aria-label={ui("Profissional responsável")}><span className="af-doctor-avatar">{doctor ? initials(name) : '—'}</span><div className="af-doctor-info"><span>{ui("Profissional responsável")}</span><h2>{loading ? 'Carregando profissional…' : doctor ? name : ui("Nenhum profissional vinculado ainda")}</h2>{doctor && <p>{doctor.specialty || 'Especialidade não informada'} · {doctor.crm ? `CRM ${doctor.crm}` : 'CRM não informado'}</p>}</div>{doctor && <span className="af-doctor-badge"><FollowupIcon type="check" /> {ui("Vinculado")}</span>}<button className="af-doctor-chevron" aria-label="Ir para comunicação com o profissional" disabled={!doctor} onClick={() => scroll('af-communication')}>›</button></section>
    <div className="af-main-grid">
      <section className="af-panel af-plan" id="af-plan" tabIndex="-1"><SectionHeading icon="calendar" title={ui("Plano de acompanhamento")} subtitle="Exames solicitados e plano definido pelo seu profissional."><Link className="af-soft-link" to="/perfil/historico-exames">{ui("Ver todos os exames")} <FollowupIcon type="arrow" /></Link></SectionHeading><div className="af-plan-list">{requestedExams.length ? requestedExams.map(exam => {
        const step = exam.submittedAt ? 4 : exam.performedAt ? 3 : exam.scheduledAt ? 2 : 1
        return <article className="af-plan-exam" key={exam._id}><div className="af-exam-heading"><span className="af-exam-icon"><FollowupIcon type="exam" /></span><div><h3>{exam.label}</h3><p>{exam.reason || 'Solicitado pelo seu profissional'}</p></div><div className="af-exam-deadline"><span className="af-small-icon"><FollowupIcon type="calendar" /></span><div><small>Realizar até</small><strong>{exam.dueDate ? date(exam.dueDate.slice(0, 10)) : 'Prazo a definir'}</strong></div></div></div>
          <ol className="af-steps">{[{ label: 'Solicitado', value: exam.createdAt }, { label: 'Agendado', value: exam.scheduledAt }, { label: 'Realizado', value: exam.performedAt }, { label: 'Resultado disponível', value: exam.submittedAt }].map((stage, index) => <li key={stage.label} className={index + 1 <= step ? 'af-step af-step--done' : 'af-step'}><span>{index + 1}</span><strong>{stage.label}</strong><small>{stage.value ? date(stage.value) : 'Aguardando'}</small></li>)}</ol>
          <div className="af-reason"><FollowupIcon type="info" /><div><strong>{ui("Motivo do acompanhamento")}</strong><p>{exam.reason || 'Seu profissional ainda não detalhou o motivo desta solicitação.'}</p></div></div><div className="af-plan-actions">{!exam.performedAt && !exam.submittedAt && <button className="af-button" disabled={busy} onClick={() => { setPerformed(exam); setPerformedDate('') }}><FollowupIcon type="check" /> {ui("Registrar exame realizado")}</button>}{!exam.submittedAt && <button className={`af-button ${!exam.performedAt ? 'af-button--secondary' : ''}`} disabled={busy} onClick={() => { setUpload(exam); setFile(null); setFileError('') }}><FollowupIcon type="upload" /> {ui("Enviar resultado")}</button>}{exam.submittedAt && <span className="af-status">{exam.reviewedAt ? 'Resultado revisado' : 'Aguardando revisão do profissional'}</span>}</div></article>
      }) : empty('Nenhum exame solicitado no momento.')}</div></section>
      <div className="af-right-column"><section className="af-panel" id="af-orientations"><SectionHeading icon="document" title={ui("Orientações do profissional")} subtitle="Últimas orientações e recomendações registradas." /><div className="af-notes-list">{notes.length ? notes.map(note => <article className="af-note" key={note._id}><span className="af-doctor-avatar af-avatar--small">{initials(name)}</span><div className="af-note-content"><div className="af-note-meta"><strong>{name}</strong><time> · {date(note.createdAt)}</time></div><h3>Orientação do profissional</h3><p>{note.text}</p></div><div className="af-note-footer"><button className="af-text-button" disabled={busy} onClick={() => openQuestion({ noteId: note._id, label: 'Sobre a orientação do profissional' })}>Tirar dúvida</button><button className="af-read-button" disabled={busy || !!note.readAt} onClick={() => onAction({ kind: 'read', noteId: note._id })}><FollowupIcon type="check" /> {note.readAt ? `Visualizado por você em ${date(note.readAt)}` : 'Confirmar leitura'}</button></div></article>) : empty('Nenhuma orientação registrada ainda.')}</div></section>
      <section className="af-panel" id="af-communication" tabIndex="-1"><SectionHeading icon="message" title={ui("Comunicação")} subtitle="Converse com seu profissional pela plataforma."><button className="af-soft-link" disabled={busy || loading} onClick={onRetry}>Atualizar conversa</button></SectionHeading><div className={interactions.length ? 'af-messages af-messages--populated' : 'af-messages'}>{interactions.length ? interactions.map(item => <article className="af-message" key={item._id}><details open={!item.reply} className="af-message-patient"><summary>{ui("Sua mensagem")}</summary><strong>{item.kind === 'checkin' ? `Seu check-in: ${item.mood}` : 'Você'}</strong><time> · {date(item.createdAt)}</time><p>{item.text || item.mood}</p></details>{item.reply ? <div className="af-message-reply"><span className="af-doctor-avatar af-avatar--small">{initials(name)}</span><div><strong>{name}</strong><time> · {date(item.repliedAt)}</time>{!item.replyReadAt && <span className="af-new-reply">Nova resposta</span>}<p>{item.reply}</p>{!item.replyReadAt && <button className="af-read-button" disabled={busy} onClick={() => onAction({ kind: 'reply-read', interactionId: item._id, repliedAt: item.repliedAt })}>Marcar como lida</button>}</div></div> : <small className="af-message-status">Aguardando resposta do profissional</small>}</article>) : empty('Suas mensagens e respostas aparecerão aqui.')}</div><button className="af-communication-button" disabled={!doctor || busy || loading} onClick={() => openQuestion({})}><FollowupIcon /> {ui("Enviar mensagem")}</button></section></div>
    </div>
    <section className="af-panel af-history" id="af-history" tabIndex="-1"><SectionHeading icon="clock" title={ui("Histórico do acompanhamento")} subtitle="Linha do tempo das principais ações, resultados e orientações."><button className="af-soft-link" onClick={() => setAllHistory(value => !value)}>{allHistory ? 'Mostrar recentes' : ui("Ver histórico completo")} <FollowupIcon type="arrow" /></button></SectionHeading>{events.length ? <ol className="af-history-events">{visibleEvents.map(item => <li key={item.id}><span className="af-history-icon"><FollowupIcon type={item.icon} /></span><div><time>{date(item.date)}</time><h3>{item.title}</h3><p>{item.detail}</p></div></li>)}</ol> : empty('O histórico aparecerá quando houver atualizações.')}</section>
    <p className="af-disclaimer">{ui("Este canal não é destinado a emergências.")}</p>
    {performed && <div className="af-modal-backdrop"><FollowupDialog className="af-modal" aria-labelledby="af-performed-title" onCancel={event => { event.preventDefault(); if (!busy) setPerformed(null) }}><form onSubmit={async event => { event.preventDefault(); if (await onAction({ kind: 'performed', requestedExamId: performed._id, performedDate })) setPerformed(null) }}><h2 id="af-performed-title">{ui("Registrar exame realizado")}</h2><p>{performed.label}</p><label htmlFor="af-performed-date">Data da realização</label><input autoFocus id="af-performed-date" type="date" required value={performedDate} onChange={event => setPerformedDate(event.target.value)} />{error && <p role="alert">{error}</p>}<div className="af-actions"><button type="button" className="af-button af-button--secondary" disabled={busy} onClick={() => setPerformed(null)}>{ui("Cancelar")}</button><button className="af-button" disabled={busy || !performedDate}>{busy ? 'Salvando…' : 'Registrar realização'}</button></div></form></FollowupDialog></div>}
    {question && <div className="af-modal-backdrop"><FollowupDialog className="af-modal" aria-labelledby="af-question-title" onCancel={event => { event.preventDefault(); if (!busy) setQuestion(null) }}><form onSubmit={async event => { event.preventDefault(); const { noteId, requestedExamId } = question; if (await onAction({ kind: 'question', text, noteId, requestedExamId })) setQuestion(null) }}><h2 id="af-question-title">{ui("Enviar dúvida")}</h2>{question.label && <p>{question.label}</p>}<label htmlFor="af-question">{ui("Sua mensagem")}</label><textarea autoFocus id="af-question" required maxLength={500} value={text} onChange={event => setText(event.target.value)} /><small>{text.length}/500</small>{error && <p role="alert">{error}</p>}<div className="af-actions"><button type="button" className="af-button af-button--secondary" disabled={busy} onClick={() => setQuestion(null)}>{ui("Cancelar")}</button><button className="af-button" disabled={busy || !text.trim()}>{busy ? ui("Enviando…") : ui("Enviar dúvida")}</button></div></form></FollowupDialog></div>}
    {upload && <div className="af-modal-backdrop"><FollowupDialog className="af-modal" aria-labelledby="af-upload-title" onCancel={event => { event.preventDefault(); if (!busy) setUpload(null) }}><form onSubmit={async event => { event.preventDefault(); if (file && await onAction(upload._id, file)) setUpload(null) }}><h2 id="af-upload-title">{ui("Enviar resultado")}</h2><p>{upload.label}</p><label htmlFor="af-pdf">Laudo original em PDF com texto selecionável (até 5 MB)</label><input id="af-pdf" type="file" accept="application/pdf,.pdf" required onChange={event => { const selected = event.target.files[0]; const invalid = selected && (selected.size > 5 * 1024 * 1024 || !selected.name.toLowerCase().endsWith('.pdf')); setFile(invalid ? null : selected); setFileError(invalid ? 'Selecione um PDF de até 5 MB.' : '') }} />{(fileError || error) && <p role="alert">{fileError || error}</p>}<div className="af-actions"><button type="button" className="af-button af-button--secondary" disabled={busy} onClick={() => setUpload(null)}>{ui("Cancelar")}</button><button className="af-button" disabled={busy || !file}>{busy ? ui("Enviando…") : ui("Enviar resultado")}</button></div></form></FollowupDialog></div>}
  </div>
}
