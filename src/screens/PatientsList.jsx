import { useState } from 'react'
import '../style/patientList.css'
import '../style/athletesDesign.css'
import '../style/doctorFollowupInbox.css'

const PAGE_SIZE = 8
const LABELS = { ok: 'Normal', atencao: 'Em atenção', risco: 'Risco alto', semExame: 'Sem exame' }
const statusOf = p => p.lastExam === 'Sem exame' ? 'semExame' : p.status === 'estavel' ? 'ok' : p.status || 'ok'

function Icon({ name, ...props }) {
  const paths = {
    people: <><circle cx="9" cy="7" r="3" /><path d="M3 21v-2a6 6 0 0 1 12 0v2M16 4a3 3 0 0 1 0 6M18 14a5 5 0 0 1 3 5v2" /></>,
    risk: <><path d="m12 3 10 18H2L12 3Z" /><path d="M12 9v5M12 17h.01" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    search: <><circle cx="10" cy="10" r="7" /><path d="m15 15 6 6" /></>,
    plus: <path d="M12 5v14M5 12h14" />,
    chart: <><path d="M4 20h16M5 16V9h3v7M11 16V4h3v12M17 16v-5h3v5" /></>,
    trash: <><path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7" /></>,
    check: <><circle cx="12" cy="12" r="9" /><path d="m8 12 3 3 5-6" /></>,
    message: <><path d="M4 4h16v13H9l-5 4V4Z" /><path d="M8 9h8M8 13h5" /></>,
  }
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{paths[name]}</svg>
}

export default function PatientsList({ patients, search, onSearch, onOpenPatient, onOpenMessages, onInvite, onRemovePatient, removingId }) {
  const [status, setStatus] = useState('all')
  const [pagination, setPagination] = useState({ page: 1, query: '', status: 'all' })
  const query = search.trim().toLocaleLowerCase('pt-BR')
  const filtered = patients.filter(p => p.name.toLocaleLowerCase('pt-BR').includes(query) && (status === 'all' || (status === 'messages' ? p.pendingMessageCount > 0 : statusOf(p) === status)))
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = pagination.query === query && pagination.status === status ? Math.min(pagination.page, pageCount) : 1
  const setPage = page => setPagination({ page, query, status })
  const start = (currentPage - 1) * PAGE_SIZE
  const highAlerts = patients.reduce((sum, p) => sum + (p.highAlerts || 0), 0)
  const attentionAlerts = patients.reduce((sum, p) => sum + (p.attentionAlerts || 0), 0)
  const pendingMessages = patients.reduce((sum, p) => sum + (p.pendingMessageCount || 0), 0)

  return <section className="jc-athletes" aria-labelledby="athletes-title">
    <header className="jc-athletes-header"><div><h1 id="athletes-title">Meus Atletas</h1><p>Acompanhe seus atletas e seus indicadores de saúde.</p></div><button type="button" className="jc-athletes-invite" onClick={onInvite}><Icon name="plus" />Adicionar paciente</button></header>
    <div className="jc-athletes-stats">
      {[['Total de atletas', patients.length, 'people', 'total'], ['Alertas de risco alto', highAlerts, 'risk', 'risk'], ['Alertas em atenção', attentionAlerts, 'clock', 'attention'], ['Mensagens pendentes', pendingMessages, 'message', 'messages']].map(([label, value, icon, tone]) => <div key={tone} className="jc-athletes-stat"><span className={`jc-athletes-stat-icon jc-athletes-stat-icon--${tone}`}><Icon name={icon} width="28" height="28" /></span><div><span>{label}</span><strong>{value}</strong></div></div>)}
    </div>
    <div className="jc-athletes-panel">
      <div className="jc-athletes-toolbar">
        <label className="jc-athletes-search"><Icon name="search" /><input type="search" value={search} onChange={e => { onSearch(e); setPagination({ page: 1, query: e.target.value.trim().toLocaleLowerCase('pt-BR'), status }) }} placeholder="Buscar atleta por nome..." aria-label="Buscar atleta por nome" /></label>
        <select value={status} onChange={e => { setStatus(e.target.value); setPagination({ page: 1, query, status: e.target.value }) }} aria-label="Filtrar atletas por status"><option value="all">Todos os status</option><option value="messages">Com mensagens pendentes</option><option value="ok">Normal</option><option value="atencao">Em atenção</option><option value="risco">Risco alto</option><option value="semExame">Sem exame</option></select>
      </div>
      <table className="jc-athletes-table"><caption className="jc-athletes-sr-only">Atletas vinculados à sua conta médica</caption><thead><tr><th scope="col">Atleta</th><th scope="col">Substâncias informadas</th><th scope="col">Último exame</th><th scope="col">Status</th><th scope="col">Ações</th></tr></thead><tbody>
        {filtered.slice(start, start + PAGE_SIZE).map(p => {
          const patientStatus = statusOf(p)
          return <tr key={p.id}>
            <th scope="row"><div className="jc-athletes-person"><span className="jc-athletes-avatar" aria-hidden="true">{p.initials}</span><div><strong>{p.name}</strong><span>{p.age === '-' ? 'Idade não informada' : `${p.age} anos`}</span></div></div></th>
            <td data-label="Substâncias informadas">{p.compounds?.length ? p.compounds.join(' · ') : 'Nenhuma substância informada'}</td>
            <td data-label="Último exame">{p.lastExam}</td>
            <td data-label="Status"><span className={`jc-athletes-badge jc-athletes-badge--${patientStatus}`}><Icon name={patientStatus === 'risco' ? 'risk' : patientStatus === 'ok' ? 'check' : 'clock'} width="16" height="16" />{LABELS[patientStatus] || LABELS.ok}</span></td>
            <td data-label="Ações"><div className="jc-athletes-actions">{onOpenMessages && <button type="button" className="jc-athletes-messages" onClick={() => onOpenMessages(p)} disabled={removingId === p.id} aria-label={`Abrir mensagens de ${p.name}`}><Icon name="message" width="17" height="17" />Mensagens{p.pendingMessageCount > 0 && <span className="dfi-count">{p.pendingMessageCount}</span>}</button>}<button type="button" className="jc-athletes-dashboard" onClick={() => onOpenPatient(p)} disabled={removingId === p.id} aria-label={`Ver dashboard de ${p.name}`}><Icon name="chart" width="17" height="17" />Ver dashboard</button>{onRemovePatient && <button type="button" className="jc-athletes-remove" onClick={() => onRemovePatient(p)} disabled={Boolean(removingId)} aria-label={`Excluir ${p.name} da lista de atletas`}><Icon name="trash" width="17" height="17" />{removingId === p.id ? 'Removendo...' : 'Excluir da lista'}</button>}</div></td>
          </tr>
        })}
      </tbody></table>
      {filtered.length === 0 && <p className="jc-athletes-empty" role="status">{patients.length ? 'Nenhum atleta encontrado para estes filtros.' : 'Você ainda não tem atletas vinculados. Adicione um paciente para começar.'}</p>}
      <footer className="jc-athletes-footer">
        <p role="status">{filtered.length ? `Mostrando ${start + 1}–${Math.min(start + PAGE_SIZE, filtered.length)} de ${filtered.length} atletas` : '0 atletas'}{filtered.length !== patients.length && ` · ${patients.length} no total`}</p>
        {pageCount > 1 && <nav className="jc-athletes-pagination" aria-label="Paginação dos atletas">
          <button type="button" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)} aria-label="Página anterior">‹</button>
          {pageCount <= 5 ? Array.from({ length: pageCount }, (_, index) => index + 1).map(number => <button key={number} type="button" onClick={() => setPage(number)} aria-label={`Página ${number}`} aria-current={number === currentPage ? 'page' : undefined}>{number}</button>) : <span>Página {currentPage} de {pageCount}</span>}
          <button type="button" disabled={currentPage === pageCount} onClick={() => setPage(currentPage + 1)} aria-label="Próxima página">›</button>
        </nav>}
      </footer>
    </div>
  </section>
}
