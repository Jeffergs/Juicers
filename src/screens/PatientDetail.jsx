import React, { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import Dashboard from '../components/perfilDoUsuario/Dashboard.jsx'
import UploadZone from '../components/perfilDoUsuario/UploadZone.jsx'
import { SectionLabel, NoteCard } from '../components/perfilDoUsuario/Primitives.jsx'
import { STATUS } from '../theme.js'
import '../style/patientDetail.css'
import DoctorFollowupInbox from '../components/DoctorFollowupInbox.jsx'
import ExamFileActions from '../components/ExamFileActions.jsx'

const TABS = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'comunicacao', label: 'Comunicação' },
  { key: 'notas', label: 'Anotações Clínicas' },
  { key: 'exames', label: 'Próximos Exames' },
  { key: 'historico', label: 'Histórico + Upload' },
]

function formatDateBR(dateString) {
  if (!dateString) return ''

  const date = new Date(dateString)

  if (Number.isNaN(date.getTime())) return dateString

  return date
    .toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
    .replace('.', '')
}

function getRiskLabel(riskLevel) {
  if (riskLevel === 'high') return 'Risco alto'
  if (riskLevel === 'attention') return 'Atenção'
  return 'Normal'
}

function getRiskColor(riskLevel) {
  if (riskLevel === 'high') return '#f04747'
  if (riskLevel === 'attention') return '#e0a82e'
  return '#3fb950'
}

export default function PatientDetail({
  patient,
  data,
  followup = { notes: [], requestedExams: [] },
  importedExams = [],
  today,
  onBack,
  onSelectMarker,
  onAddNote,
  onUpdateNote,
  onDeleteNote,
  onToggleExam,
  onUpload,
  onDeleteExam,
  onRefreshFollowup,
}) {
  const [searchParams, setSearchParams] = useSearchParams()
  const requestedTab = searchParams.get('tab')
  const tab = TABS.some(item => item.key === requestedTab) ? requestedTab : 'dashboard'
  const setTab = value => setSearchParams(current => { const next = new URLSearchParams(current); next.set('tab', value); return next }, { replace: true })
  const [draft, setDraft] = useState('')
  const [outroExame, setOutroExame] = useState('')
  const [salvandoNota, setSalvandoNota] = useState(false)
  const [editandoNotaId, setEditandoNotaId] = useState(null)
  const [textoEdicao, setTextoEdicao] = useState('')
  const [salvandoEdicaoId, setSalvandoEdicaoId] = useState(null)
  const [apagandoNotaId, setApagandoNotaId] = useState(null)
  const [acaoExame, setAcaoExame] = useState('')
  const [apagandoExameId, setApagandoExameId] = useState(null)

  const pStatus = patient.status || 'estavel'
  const meta = `${patient.age} anos · ${patient.compounds.join(', ')} · Último exame: ${patient.lastExam}`

  const notes = followup.notes || []
  const requestedExams = followup.requestedExams || []

  const requestedMap = requestedExams.reduce((acc, exam) => {
    acc[exam.label] = exam
    return acc
  }, {})

  const suggestedLabels = data.suggestedExams || []

  const customRequestedExams = requestedExams.filter(
    exam => !suggestedLabels.includes(exam.label)
  )

  const reqCount = requestedExams.length
  const pendingMessages = (followup.interactions || []).filter(item => !item.reply).length

  const saveNote = async () => {
    if (!draft.trim()) return

    try {
      setSalvandoNota(true)
      await onAddNote(draft.trim())
      setDraft('')
    } finally {
      setSalvandoNota(false)
    }
  }

  const startEditNote = (note) => {
    setEditandoNotaId(note._id)
    setTextoEdicao(note.text || '')
  }

  const cancelEditNote = () => {
    setEditandoNotaId(null)
    setTextoEdicao('')
  }

  const saveEditNote = async (noteId) => {
    if (!textoEdicao.trim()) return

    try {
      setSalvandoEdicaoId(noteId)
      await onUpdateNote(noteId, textoEdicao.trim())
      setEditandoNotaId(null)
      setTextoEdicao('')
    } finally {
      setSalvandoEdicaoId(null)
    }
  }

  const deleteNote = async (noteId) => {
    const confirmar = window.confirm('Tem certeza que deseja excluir esta anotação?')

    if (!confirmar) return

    try {
      setApagandoNotaId(noteId)
      await onDeleteNote(noteId)
    } finally {
      setApagandoNotaId(null)
    }
  }

  const handleToggleExam = async (label) => {
    if (!label.trim()) return

    try {
      setAcaoExame(label)
      await onToggleExam(label)
    } finally {
      setAcaoExame('')
    }
  }

  const handleAddOutroExame = async () => {
    const label = outroExame.trim()

    if (!label) return

    if (requestedMap[label]) {
      setOutroExame('')
      return
    }

    await handleToggleExam(label)
    setOutroExame('')
  }

  const handleDeleteExam = async (examId) => {
    const confirmar = window.confirm('Tem certeza que deseja excluir este exame?')

    if (!confirmar) return

    try {
      setApagandoExameId(examId)
      await onDeleteExam(examId)
    } finally {
      setApagandoExameId(null)
    }
  }

  return (
    <div className="jc-fade jc-doctor-patient-detail" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <button
        onClick={onBack}
        className="jc-btn-ghost teal"
        style={{
          alignSelf: 'flex-start',
          display: 'flex',
          alignItems: 'center',
          gap: 7,
          background: 'transparent',
          border: '1px solid var(--ad-border)',
          color: 'var(--ad-text)',
          fontSize: 'var(--ui-small, 12px)',
          fontWeight: 600,
          fontFamily: 'inherit',
          borderRadius: 8,
          padding: '8px 14px',
          cursor: 'pointer',
        }}
      >
        ← Voltar para lista
      </button>

      <section
        style={{
          background: 'var(--ad-surface)',
          border: '1px solid var(--ad-border)',
          borderRadius: 14,
          padding: '18px 22px',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
        }}
      >
        <div
          style={{
            width: 50,
            height: 50,
            borderRadius: '50%',
            background: 'var(--ad-accent-soft)',
            color: 'var(--ad-accent-text)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 'var(--ui-body, 14px)',
            fontWeight: 700,
            flex: 'none',
          }}
        >
          {patient.initials}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 3, flex: 1, minWidth: 0 }}>
          <span className="jc-patient-page-title" style={{ fontSize: 19, fontWeight: 700, color: 'var(--ad-text)', letterSpacing: '-.01em' }}>
            {patient.name}
          </span>

          <span style={{ fontSize: 'var(--ui-small, 12px)', color: 'var(--ad-muted)' }}>
            {meta}
          </span>
        </div>

        <span
          style={{
            fontSize: 'var(--ui-small, 12px)',
            fontWeight: 650,
            color: STATUS.color[pStatus],
            background: STATUS.bg[pStatus],
            border: `1px solid ${STATUS.border[pStatus]}`,
            borderRadius: 20,
            padding: '5px 13px',
            flex: 'none',
          }}
        >
          {STATUS.label[pStatus]}
        </span>
      </section>

      <div style={{ display: 'flex', gap: 2, borderBottom: '1px solid var(--ad-border)', flexWrap: 'wrap' }}>
        {TABS.map((t) => {
          const on = tab === t.key

          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                background: 'transparent',
                border: 'none',
                borderBottom: `2px solid ${on ? 'var(--ad-accent-text)' : 'transparent'}`,
                color: on ? 'var(--ad-accent-text)' : 'var(--ad-muted)',
                fontSize: 'var(--ui-body, 14px)',
                fontWeight: 600,
                fontFamily: 'inherit',
                padding: '11px 16px',
                cursor: 'pointer',
                marginBottom: -1,
              }}
            >
              {t.label}
              {t.key === 'comunicacao' && pendingMessages > 0 && <span className="dfi-count">{pendingMessages}</span>}
            </button>
          )
        })}
      </div>

      {tab === 'dashboard' && (
        <div className="jc-fade-fast">
          <Dashboard
            accent="var(--ad-accent-text)"
            hideHeader
            summary={data.summary}
            alerts={data.alerts}
            categories={data.categories}
            examDates={data.examDates}
            unknownKeys={data.unknownKeys}
            onSelect={onSelectMarker}
          />
        </div>
      )}

      {tab === 'comunicacao' && <DoctorFollowupInbox followup={followup} patientId={patient.id} onRefresh={onRefreshFollowup} />}

      {tab === 'notas' && (
        <div className="jc-fade-fast" style={{ display: 'flex', flexDirection: 'column', gap: 18, maxWidth: 780 }}>
          <section
            style={{
              background: 'var(--ad-surface)',
              border: '1px solid var(--ad-border)',
              borderRadius: 14,
              padding: '22px 24px',
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
            }}
          >
            <h2 style={{ margin: 0, fontSize: 'var(--ui-body, 14px)', fontWeight: 700 }}>
              Nova Anotação Clínica
            </h2>

            <textarea
              className="jc-textarea teal"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Adicione observações desta consulta..."
              style={{
                minHeight: 140,
                resize: 'vertical',
                background: 'var(--ad-field)',
                border: '1px solid var(--ad-border)',
                borderRadius: 10,
                padding: '13px 14px',
                color: 'var(--ad-text)',
                fontSize: 'var(--ui-body, 14px)',
                lineHeight: 1.55,
                fontFamily: 'inherit',
                outline: 'none',
              }}
            />

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 'var(--ui-small, 12px)', color: 'var(--ad-muted)' }}>
                Consulta de {today}
              </span>

              <button
                onClick={saveNote}
                disabled={salvandoNota}
                className="jc-btn-teal"
                style={{
                  background: 'var(--ad-accent-text)',
                  color: '#fff',
                  border: 'none',
                  fontSize: 'var(--ui-small, 12px)',
                  fontWeight: 700,
                  fontFamily: 'inherit',
                  borderRadius: 9,
                  padding: '9px 18px',
                  cursor: salvandoNota ? 'not-allowed' : 'pointer',
                  opacity: salvandoNota ? 0.7 : 1,
                }}
              >
                {salvandoNota ? 'Salvando...' : 'Salvar anotação'}
              </button>
            </div>
          </section>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <SectionLabel>Histórico de anotações</SectionLabel>

            {notes.length > 0 ? (
              notes.map((note) => {
                const isEditing = editandoNotaId === note._id
                const isSaving = salvandoEdicaoId === note._id
                const isDeleting = apagandoNotaId === note._id

                return (
                  <div
                    key={note._id}
                    style={{
                      background: 'var(--ad-surface)',
                      border: '1px solid var(--ad-border)',
                      borderRadius: 10,
                      padding: 16,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 12,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                      <span style={{ fontSize: 'var(--ui-small, 12px)', color: 'var(--ad-muted)', fontWeight: 600 }}>
                        {formatDateBR(note.createdAt)}
                        {note.readAt && ` · Leitura confirmada em ${formatDateBR(note.readAt)}`}
                      </span>

                      {!isEditing && (
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button
                            onClick={() => startEditNote(note)}
                            disabled={isDeleting}
                            style={{
                              background: 'var(--ad-accent-soft)',
                              border: '1px solid #bce9e5',
                              color: 'var(--ad-accent-text)',
                              fontSize: 'var(--ui-small, 12px)',
                              fontWeight: 700,
                              fontFamily: 'inherit',
                              borderRadius: 8,
                              padding: '6px 10px',
                              cursor: 'pointer',
                            }}
                          >
                            Editar
                          </button>

                          <button
                            onClick={() => deleteNote(note._id)}
                            disabled={isDeleting}
                            style={{
                              background: 'rgba(240,71,71,.12)',
                              border: '1px solid rgba(240,71,71,.35)',
                              color: '#f04747',
                              fontSize: 'var(--ui-small, 12px)',
                              fontWeight: 700,
                              fontFamily: 'inherit',
                              borderRadius: 8,
                              padding: '6px 10px',
                              cursor: isDeleting ? 'not-allowed' : 'pointer',
                              opacity: isDeleting ? 0.7 : 1,
                            }}
                          >
                            {isDeleting ? 'Excluindo...' : 'Excluir'}
                          </button>
                        </div>
                      )}
                    </div>

                    {isEditing ? (
                      <>
                        <textarea
                          value={textoEdicao}
                          onChange={(e) => setTextoEdicao(e.target.value)}
                          style={{
                            minHeight: 110,
                            resize: 'vertical',
                            background: 'var(--ad-field)',
                            border: '1px solid var(--ad-border)',
                            borderRadius: 10,
                            padding: '12px 13px',
                            color: 'var(--ad-text)',
                            fontSize: 'var(--ui-body, 14px)',
                            lineHeight: 1.5,
                            fontFamily: 'inherit',
                            outline: 'none',
                          }}
                        />

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                          <button
                            onClick={cancelEditNote}
                            disabled={isSaving}
                            style={{
                              background: 'transparent',
                              border: '1px solid var(--ad-border)',
                              color: 'var(--ad-muted)',
                              fontSize: 'var(--ui-small, 12px)',
                              fontWeight: 700,
                              fontFamily: 'inherit',
                              borderRadius: 8,
                              padding: '8px 12px',
                              cursor: isSaving ? 'not-allowed' : 'pointer',
                            }}
                          >
                            Cancelar
                          </button>

                          <button
                            onClick={() => saveEditNote(note._id)}
                            disabled={isSaving || !textoEdicao.trim()}
                            style={{
                              background: 'var(--ad-accent-text)',
                              border: 'none',
                              color: '#fff',
                              fontSize: 'var(--ui-small, 12px)',
                              fontWeight: 800,
                              fontFamily: 'inherit',
                              borderRadius: 8,
                              padding: '8px 12px',
                              cursor: isSaving || !textoEdicao.trim() ? 'not-allowed' : 'pointer',
                              opacity: isSaving || !textoEdicao.trim() ? 0.7 : 1,
                            }}
                          >
                            {isSaving ? 'Salvando...' : 'Salvar edição'}
                          </button>
                        </div>
                      </>
                    ) : (
                      <p style={{ margin: 0, fontSize: 'var(--ui-body, 14px)', color: 'var(--ad-text)', lineHeight: 1.55 }}>
                        {note.text}
                      </p>
                    )}
                  </div>
                )
              })
            ) : (
              <div
                style={{
                  background: 'var(--ad-surface)',
                  border: '1px solid var(--ad-border)',
                  borderRadius: 10,
                  padding: 16,
                  textAlign: 'center',
                  fontSize: 'var(--ui-small, 12px)',
                  color: 'var(--ad-muted)',
                }}
              >
                Nenhuma anotação registrada ainda.
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'exames' && (
        <section
          className="jc-fade-fast"
          style={{
            background: 'var(--ad-surface)',
            border: '1px solid var(--ad-border)',
            borderRadius: 14,
            padding: '22px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
            maxWidth: 780,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ margin: 0, fontSize: 'var(--ui-body, 14px)', fontWeight: 700 }}>
              Próximos Exames Sugeridos
            </h2>

            <span
              style={{
                fontSize: 'var(--ui-small, 12px)',
                fontWeight: 650,
                color: 'var(--ad-accent-text)',
                background: 'var(--ad-accent-soft)',
                borderRadius: 20,
                padding: '3px 10px',
              }}
            >
              {reqCount} solicitados
            </span>
          </div>

          <p style={{ margin: 0, fontSize: 'var(--ui-small, 12px)', color: 'var(--ad-muted)', lineHeight: 1.45 }}>
            Recomendados com base no ciclo e nos alertas ativos do paciente. Marque para solicitar.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {suggestedLabels.map((label) => {
              const on = !!requestedMap[label]
              const loading = acaoExame === label

              return (
                <label
                  key={label}
                  onClick={() => !loading && handleToggleExam(label)}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 11,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontSize: 'var(--ui-body, 14px)',
                    color: 'var(--ad-text)',
                    padding: '8px 0',
                    lineHeight: 1.4,
                    opacity: loading ? 0.7 : 1,
                  }}
                >
                  <span
                    style={{
                      width: 19,
                      height: 19,
                      borderRadius: 5,
                      border: `1.5px solid ${on ? 'var(--ad-accent-text)' : 'var(--ad-border)'}`,
                      background: on ? 'var(--ad-accent-text)' : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flex: 'none',
                      marginTop: 1,
                    }}
                  >
                    {on && <span style={{ color: '#fff', fontWeight: 900 }}>✓</span>}
                  </span>

                  {label}
                </label>
              )
            })}
          </div>

          <div
            style={{
              marginTop: 12,
              borderTop: '1px solid var(--ad-border)',
              paddingTop: 16,
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}
          >
            <span
              style={{
                fontSize: 'var(--ui-small, 12px)',
                fontWeight: 700,
                color: 'var(--ad-muted)',
                textTransform: 'uppercase',
                letterSpacing: '.08em',
              }}
            >
              Solicitar outro exame
            </span>

            <div
              style={{
                display: 'flex',
                gap: 10,
                alignItems: 'center',
                flexWrap: 'wrap',
              }}
            >
              <input
                type="text"
                value={outroExame}
                onChange={(e) => setOutroExame(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddOutroExame()
                }}
                placeholder="Ex.: TSH, T4 livre, PSA, Ferritina..."
                style={{
                  flex: 1,
                  minWidth: 240,
                  background: 'var(--ad-field)',
                  border: '1px solid var(--ad-border)',
                  borderRadius: 9,
                  padding: '10px 12px',
                  color: 'var(--ad-text)',
                  fontSize: 'var(--ui-body, 14px)',
                  fontFamily: 'inherit',
                  outline: 'none',
                }}
              />

              <button
                onClick={handleAddOutroExame}
                disabled={!outroExame.trim() || acaoExame === outroExame.trim()}
                style={{
                  background: 'var(--ad-accent-text)',
                  color: '#fff',
                  border: 'none',
                  fontSize: 'var(--ui-small, 12px)',
                  fontWeight: 800,
                  fontFamily: 'inherit',
                  borderRadius: 9,
                  padding: '10px 15px',
                  cursor: !outroExame.trim() ? 'not-allowed' : 'pointer',
                  opacity: !outroExame.trim() ? 0.6 : 1,
                }}
              >
                Adicionar exame
              </button>
            </div>

            {customRequestedExams.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 6 }}>
                <span
                  style={{
                    fontSize: 'var(--ui-small, 12px)',
                    color: 'var(--ad-muted)',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '.06em',
                  }}
                >
                  Outros exames solicitados
                </span>

                {customRequestedExams.map((exam) => {
                  const loading = acaoExame === exam.label

                  return (
                    <div
                      key={exam._id || exam.label}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        background: 'var(--ad-field)',
                        border: '1px solid var(--ad-border)',
                        borderRadius: 9,
                        padding: '10px 12px',
                      }}
                    >
                      <span
                        style={{
                          width: 19,
                          height: 19,
                          borderRadius: 5,
                          background: 'var(--ad-accent-text)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#fff',
                          fontWeight: 900,
                          flex: 'none',
                        }}
                      >
                        ✓
                      </span>

                      <span style={{ flex: 1, color: 'var(--ad-text)', fontSize: 'var(--ui-body, 14px)' }}>
                        {exam.label}
                      </span>

                      <button
                        onClick={() => !loading && handleToggleExam(exam.label)}
                        disabled={loading}
                        style={{
                          background: 'rgba(240,71,71,.12)',
                          border: '1px solid rgba(240,71,71,.35)',
                          color: '#f04747',
                          fontSize: 'var(--ui-small, 12px)',
                          fontWeight: 700,
                          fontFamily: 'inherit',
                          borderRadius: 8,
                          padding: '7px 10px',
                          cursor: loading ? 'not-allowed' : 'pointer',
                          opacity: loading ? 0.7 : 1,
                        }}
                      >
                        {loading ? 'Removendo...' : 'Remover'}
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </section>
      )}

      {tab === 'historico' && (
        <div className="jc-fade-fast" style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 880 }}>
          <section
            style={{
              background: 'var(--ad-surface)',
              border: '1px solid var(--ad-border)',
              borderRadius: 14,
              padding: '22px 24px',
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ color: 'var(--ad-accent-text)', fontSize: 20 }}>↥</span>

              <h2 style={{ margin: 0, fontSize: 'var(--ui-body, 14px)', fontWeight: 700 }}>
                Importar Novo Exame
              </h2>
            </div>

            <UploadZone
              accent="var(--ad-accent-text)"
              label={`Importar exame para ${patient.name.split(' ')[0]}`}
              onUpload={onUpload}
            />
          </section>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <SectionLabel>Exames importados</SectionLabel>

            {importedExams.length === 0 && (
              <div
                style={{
                  background: 'var(--ad-surface)',
                  border: '1px solid var(--ad-border)',
                  borderRadius: 10,
                  padding: 16,
                  textAlign: 'center',
                  fontSize: 'var(--ui-small, 12px)',
                  color: 'var(--ad-muted)',
                }}
              >
                Nenhum exame importado ainda.
              </div>
            )}

            {importedExams.map((exam) => {
              const color = getRiskColor(exam.riskLevel)
              const deleting = apagandoExameId === exam.id

              return (
                <div
                  key={exam.id}
                  style={{
                    background: 'var(--ad-surface)',
                    border: '1px solid var(--ad-border)',
                    borderLeft: `3px solid ${color}`,
                    borderRadius: 10,
                    padding: '14px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                  }}
                >
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <span style={{ fontSize: 'var(--ui-body, 14px)', fontWeight: 700, color: 'var(--ad-text)' }}>
                      {exam.name}
                    </span>

                    <span style={{ fontSize: 'var(--ui-small, 12px)', color: 'var(--ad-muted)' }}>
                      Data do exame: {exam.date} · Fonte: {exam.source === 'pdf' ? 'PDF' : 'Manual'}
                    </span>

                    <span style={{ fontSize: 'var(--ui-small, 12px)', color: 'var(--ad-muted)' }}>
                      Marcadores extraídos: {Object.keys(exam.markers).length}
                    </span>
                    <ExamFileActions examId={exam.id} patientId={patient.id} fileName={exam.name} available={exam.hasOriginalPdf} />
                  </div>

                  <span
                    style={{
                      fontSize: 'var(--ui-small, 12px)',
                      fontWeight: 700,
                      color,
                      background: `${color}22`,
                      border: `1px solid ${color}55`,
                      borderRadius: 20,
                      padding: '4px 12px',
                      flex: 'none',
                    }}
                  >
                    {getRiskLabel(exam.riskLevel)}
                  </span>

                  <button
                    onClick={() => handleDeleteExam(exam.id)}
                    disabled={deleting}
                    style={{
                      background: 'rgba(240,71,71,.12)',
                      border: '1px solid rgba(240,71,71,.35)',
                      color: '#f04747',
                      fontSize: 'var(--ui-small, 12px)',
                      fontWeight: 700,
                      fontFamily: 'inherit',
                      borderRadius: 8,
                      padding: '8px 12px',
                      cursor: deleting ? 'not-allowed' : 'pointer',
                      opacity: deleting ? 0.7 : 1,
                    }}
                  >
                    {deleting ? 'Excluindo...' : 'Excluir'}
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

