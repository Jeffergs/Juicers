import { useUiText } from '../context/uiText'
import { useState } from 'react'
import { respondToPatientFollowup } from '../services/api'
import '../style/doctorFollowupInbox.css'

function PlanForm({ item, patientId, onRefresh }) {
  const ui = useUiText()

  const [reason, setReason] = useState(item.reason || '')
  const [dueDate, setDueDate] = useState(item.dueDate?.slice(0, 10) || '')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  return <details className="dfi-item"><summary>Plano: {item.label}</summary><form onSubmit={async event => {
    event.preventDefault(); setBusy(true); setMessage('')
    try { await respondToPatientFollowup(patientId, item._id, { kind: 'plan', reason, dueDate }); await onRefresh(); setMessage('Plano atualizado.') }
    catch (error) { setMessage(error.message) } finally { setBusy(false) }
  }}><label htmlFor={`reason-${item._id}`}>{ui("Motivo do acompanhamento")}</label><textarea id={`reason-${item._id}`} maxLength={2000} value={reason} onChange={event => setReason(event.target.value)} /><label htmlFor={`due-${item._id}`}>Realizar até (opcional)</label><input id={`due-${item._id}`} type="date" value={dueDate} onChange={event => setDueDate(event.target.value)} /><div><button disabled={busy}>{busy ? 'Salvando…' : 'Salvar plano'}</button></div>{message && <p role="status">{message}</p>}</form></details>
}

function ReplyForm({ item, patientId, onRefresh }) {
  const ui = useUiText()

  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [sentReply, setSentReply] = useState('')
  return <article className="dfi-item"><div className="dfi-item-heading"><strong>{item.kind === 'checkin' ? `Check-in: ${item.mood}` : 'Mensagem do paciente'}</strong><time>{new Date(item.createdAt).toLocaleDateString('pt-BR')}</time></div><p>{item.text}</p>{item.context && <small>{item.context}</small>}{(item.reply || sentReply) ? <p><strong>Sua resposta:</strong> {item.reply || sentReply}</p> : <form onSubmit={async event => {
    event.preventDefault(); setBusy(true); setError('')
    try { await respondToPatientFollowup(patientId, item._id, { reply: text }); setSentReply(text.trim()); try { await onRefresh() } catch { setError('Resposta enviada. Atualize a conversa para sincronizar os dados.') } }
    catch (err) { setError(err.message) } finally { setBusy(false) }
  }}><label htmlFor={`reply-${item._id}`}>Responder ao paciente</label><textarea id={`reply-${item._id}`} value={text} required maxLength={2000} onChange={event => setText(event.target.value)} /><button disabled={busy || !text.trim()}>{busy ? ui("Enviando…") : 'Enviar resposta'}</button></form>}{error && <p role="alert">{error}</p>}</article>
}

export default function DoctorFollowupInbox({ followup, patientId, onRefresh }) {
  const ui = useUiText()

  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('pending')
  const results = (followup.requestedExams || []).filter(item => item.submittedAt)
  const interactions = followup.interactions || []
  const pending = interactions.filter(item => !item.reply).length
  const visible = interactions.filter(item => filter === 'all' || (filter === 'pending' ? !item.reply : !!item.reply))
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
  return <section className="dfi" aria-labelledby="dfi-title">
    <header className="dfi-header"><div><h2 id="dfi-title">Comunicação com o paciente</h2><p>Mensagens enviadas pelo acompanhamento do atleta. Sua resposta aparece na mesma conversa para ele.</p></div><button disabled={busy} onClick={async () => {
      setBusy(true); setError('')
      try { await onRefresh() } catch (err) { setError(err.message) } finally { setBusy(false) }
    }}>{busy ? 'Atualizando…' : ui("Atualizar mensagens")}</button></header>
    <div className="dfi-filters" role="group" aria-label="Filtrar mensagens">
      {[['pending', `Aguardando resposta (${pending})`], ['answered', 'Respondidas'], ['all', 'Todas']].map(([value, label]) => <button key={value} className={value === filter ? 'dfi-filter dfi-filter--active' : 'dfi-filter'} aria-pressed={filter === value} onClick={() => setFilter(value)}>{label}</button>)}
    </div>
    <div className="dfi-conversations">{visible.length ? visible.map(item => <ReplyForm key={item._id} item={{ ...item, context: item.noteId ? `Sobre a orientação: ${followup.notes?.find(note => note._id === item.noteId)?.text || 'Orientação removida'}` : item.requestedExamId ? `Sobre o exame: ${followup.requestedExams?.find(exam => exam._id === item.requestedExamId)?.label || 'Solicitação encerrada'}` : '' }} patientId={patientId} onRefresh={onRefresh} />) : <p className="dfi-empty" role="status">{filter === 'pending' ? 'Nenhuma mensagem aguardando resposta.' : 'Nenhuma mensagem neste filtro.'}</p>}</div>
    <details className="dfi-plan"><summary>Plano e resultados de exames</summary>
      {(followup.requestedExams || []).map(item => <PlanForm key={item._id} item={item} patientId={patientId} onRefresh={onRefresh} />)}
      {!followup.requestedExams?.length && <p>Nenhum exame solicitado.</p>}
      {results.map(item => <article className="dfi-item" key={item._id}><strong>{item.label}</strong><p>Resultado enviado em {new Date(item.submittedAt).toLocaleDateString('pt-BR')}. Consulte os indicadores na aba Histórico + Upload.</p><button disabled={busy || !!item.reviewedAt} onClick={async () => {
        setBusy(true); setError('')
        try { await respondToPatientFollowup(patientId, item._id, { kind: 'review' }); await onRefresh() }
        catch (err) { setError(err.message) } finally { setBusy(false) }
      }}>{item.reviewedAt ? 'Revisado' : 'Confirmar revisão'}</button></article>)}
    </details>
    {error && <p role="alert">{error}</p>}
  </section>
}

