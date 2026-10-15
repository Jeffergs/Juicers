import { useEffect, useRef, useState } from 'react'
import '../style/historicoExames.css'
import ExamFileActions from './ExamFileActions'
import { uploadPatientExamPdf, deleteExam, getMyExams } from '../services/api'

const RISK_LABELS = {
    high: 'Risco alto',
    warn: 'Atenção',
    normal: 'Normal',
    processing: 'Processando…',
}

function RiskBadge({ risk }) {
    return (
        <span className={`he-badge he-badge--${risk || 'processing'}`}>
            {RISK_LABELS[risk] || 'Processando…'}
        </span>
    )
}

function PdfIcon() {
    return (
        <div className="he-pdf-icon">
            <svg viewBox="0 0 16 16" fill="none" stroke="#c0392b" strokeWidth="1.4">
                <path d="M3 2h10a1 1 0 011 1v10a1 1 0 01-1 1H3a1 1 0 01-1-1V3a1 1 0 011-1z" />
                <path d="M5 6h6M5 8.5h6M5 11h4" />
            </svg>
        </div>
    )
}

function StatCard({ label, value, sub, modifier }) {
    return (
        <div className="he-stat-card">
            <div className="he-stat-label">{label}</div>
            <div className={`he-stat-val${modifier ? ` he-stat-val--${modifier}` : ''}`}>
                {value}
            </div>
            {sub && <div className="he-stat-sub">{sub}</div>}
        </div>
    )
}

function Toast({ msg, show, warn }) {
    return (
        <div className={`he-toast${show ? ' he-toast--show' : ''}`}>
            <div className={`he-toast-dot${warn ? ' he-toast-dot--warn' : ''}`} />
            {msg}
        </div>
    )
}

function formatarData(data) {
    if (!data) return '—'

    const dataCorrigida = new Date(`${data}T00:00:00`)

    return dataCorrigida
        .toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        })
        .replace('.', '')
}

function mapRiskLevel(riskLevel) {
    if (riskLevel === 'high') return 'high'
    if (riskLevel === 'attention') return 'warn'
    if (riskLevel === 'normal') return 'normal'
    return 'processing'
}

export default function HistoricoExames() {
    const [exams, setExams] = useState([])
    const [loading, setLoading] = useState(true)
    const [uploading, setUploading] = useState(false)
    const [loadError, setLoadError] = useState('')
    const [nextCursor, setNextCursor] = useState(null)
    const [stats, setStats] = useState(null)
    const [loadingMore, setLoadingMore] = useState(false)
    const [dragging, setDragging] = useState(false)
    const [toast, setToast] = useState({ show: false, msg: '', warn: false })

    const fileRef = useRef()

    const showToast = (msg, warn = false) => {
        setToast({ show: true, msg, warn })
        setTimeout(() => setToast(t => ({ ...t, show: false })), 3200)
    }

    useEffect(() => {
        async function carregarExames() {
            try {
                const data = await getMyExams({ limit: 50 })
                setExams(data.exams || [])
                setNextCursor(data.nextCursor); setStats(data.stats)
            } catch (error) {
                setLoadError(error.message || 'Não foi possível carregar os exames.')
                showToast(error.message || 'Erro ao carregar exames', true)
            } finally {
                setLoading(false)
            }
        }

        carregarExames()
    }, [])

    const addExam = async (file) => {
        if (uploading) return
        if (!file || file.type !== 'application/pdf') {
            showToast('Apenas arquivos PDF são aceitos', true)
            return
        }
        if (file.size > 5 * 1024 * 1024) { showToast('O PDF deve ter até 5 MB.', true); return }

        try {
            setUploading(true)
            const data = await uploadPatientExamPdf(file)
            setExams(prev => [data.exam, ...prev.filter(exam => exam._id !== data.exam._id)].sort((a, b) => b.examDate.localeCompare(a.examDate)))
            const refreshed = await getMyExams({ limit: 50 }); setStats(refreshed.stats)
            showToast(data.message)
        } catch (error) {
            showToast(error.message || 'Erro ao importar exame', true)
        } finally { setUploading(false); if (fileRef.current) fileRef.current.value = '' }
    }

    const removeExam = async (id, e) => {
        e.stopPropagation()
        if (!window.confirm('Excluir este exame do histórico?')) return

        try {
            await deleteExam(id)
            setExams(prev => prev.filter(ex => ex._id !== id))
            const refreshed = await getMyExams({ limit: 50 }); setStats(refreshed.stats)
            showToast('Exame removido', true)
        } catch (error) {
            showToast(error.message || 'Erro ao remover exame', true)
        }
    }

    const handleDrop = (e) => {
        e.preventDefault()
        setDragging(false)
        addExam(e.dataTransfer.files[0])
    }

    const highCount = stats?.highCount ?? exams.filter(e => e.riskLevel === 'high').length
    const lastDate = stats?.lastDate ? formatarData(stats.lastDate) : exams[0]?.examDate ? formatarData(exams[0].examDate) : '—'

    return (
        <div className="he-wrap">
            {nextCursor && <button disabled={loadingMore} onClick={async () => {
                setLoadingMore(true)
                try { const data = await getMyExams({ limit: 50, cursor: nextCursor }); setExams(current => [...current, ...data.exams.filter(exam => !current.some(existing => existing._id === exam._id))]); setNextCursor(data.nextCursor) }
                catch (error) { showToast(error.message, true) } finally { setLoadingMore(false) }
            }}>{loadingMore ? 'Carregando…' : 'Carregar mais exames'}</button>}
            {loadError && <div role="alert"><p>{loadError}</p><button onClick={() => window.location.reload()}>Tentar novamente</button></div>}
            {uploading && <p role="status">Importando PDF… Confira os valores extraídos com o laudo original.</p>}
            <div className="he-page">
                <div className="he-page-header">
                    <h1>Histórico de Exames</h1>
                    <p>Upload e gestão dos seus laudos laboratoriais</p>
                </div>

                <div className="he-stats">
                    <StatCard
                        label="Total de exames"
                        value={stats?.total ?? exams.length}
                        sub="laudos importados"
                    />

                    <StatCard
                        label="Último exame"
                        value={lastDate}
                        sub="exame mais recente"
                        modifier="muted"
                    />

                    <StatCard
                        label="Alertas ativos"
                        value={highCount}
                        sub="exames com risco alto"
                        modifier={highCount > 0 ? 'red' : 'green'}
                    />
                </div>

                <div
                    className={`he-upload-zone${dragging ? ' he-upload-zone--dragging' : ''}`}
                    role="button"
                    tabIndex={0}
                    aria-label="Selecionar PDF de exame"
                    onClick={e => { if (e.target !== fileRef.current) fileRef.current.click() }}
                    onKeyDown={e => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            fileRef.current.click()
                        }
                    }}
                    onDragOver={e => {
                        e.preventDefault()
                        setDragging(true)
                    }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={handleDrop}
                >
                    <div className="he-upload-icon">
                        <svg viewBox="0 0 20 20" fill="none" stroke="#262121" strokeWidth="1.5">
                            <path d="M10 13V7M7 10l3-3 3 3" />
                            <path d="M3 14v2a1 1 0 001 1h12a1 1 0 001-1v-2" />
                        </svg>
                    </div>

                    <div className="he-upload-title">Arrastar PDF de exame aqui</div>

                    <div className="he-upload-sub">
                        ou clique para selecionar arquivo · PDF, até 5 MB
                    </div>

                    <div className="he-upload-btn">Selecionar arquivo</div>

                    <input
                        ref={fileRef}
                        type="file"
                        accept=".pdf"
                        style={{ display: 'none' }}
                        onChange={e => {
                            addExam(e.target.files[0])
                            e.target.value = ''
                        }}
                    />
                </div>

                <div className="he-section-title">Exames importados</div>

                <div className="he-exam-list">
                    {loading && (
                        <div className="he-exam-empty">
                            Carregando exames...
                        </div>
                    )}

                    {!loading && exams.length === 0 && (
                        <div className="he-exam-empty">
                            Nenhum exame importado ainda.
                        </div>
                    )}

                    {!loading && exams.map(exam => (
                        <div key={exam._id} className="he-exam-card">
                            <PdfIcon />

                            <div>
                                <div className="he-exam-name">
                                    {exam.alerts?.[0] || 'Exame laboratorial'}
                                </div>

                                <div className="he-exam-meta">
                                    {formatarData(exam.examDate)} ·{' '}
                                    {exam.source === 'manual' ? 'Importado manualmente' : 'PDF'}
                                </div>
                                <ExamFileActions examId={exam._id} fileName={exam.originalFileName} available={exam.hasOriginalPdf} />
                            </div>

                            <div className="he-exam-badges">
                                <RiskBadge risk={mapRiskLevel(exam.riskLevel)} />

                                <span className="he-badge he-badge--pdf">
                                    PDF
                                </span>

                                <button
                                    type="button"
                                    className="he-btn-remove"
                                    title="Excluir exame"
                                    onClick={e => removeExam(exam._id, e)}
                                >
                                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                        <path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7" />
                                    </svg>
                                    Excluir exame
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <Toast msg={toast.msg} show={toast.show} warn={toast.warn} />
        </div>
    )
}
