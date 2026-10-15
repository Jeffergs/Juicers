import { Component, lazy, Suspense, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { fetchExamPdf } from '../services/api'
import { SESSION_EVENT } from '../services/session'
import { useTranslation } from '../context/language'
import '../style/examFileActions.css'
const PdfViewer = lazy(() => import('./PdfViewer'))
class PdfPreviewBoundary extends Component {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  render() { return this.state.failed ? <p role="alert">{this.props.message}</p> : this.props.children }
}

const T = {
  pt: { view: 'Visualizar PDF', download: 'Baixar PDF', loading: 'Carregando PDF…', close: 'Fechar PDF', unavailable: 'PDF original indisponível. Reenvie o arquivo para disponibilizá-lo.', title: 'Exame original', failure: 'Não foi possível carregar o PDF.' },
  en: { view: 'View PDF', download: 'Download PDF', loading: 'Loading PDF…', close: 'Close PDF', unavailable: 'Original PDF unavailable. Upload the file again to make it available.', title: 'Original exam', failure: 'Unable to load the PDF.' },
}

export default function ExamFileActions({ examId, patientId, fileName, available }) {
  const t = useTranslation(T, 'ExamFileActions.T')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [preview, setPreview] = useState('')
  const dialog = useRef(null)
  const mounted = useRef(true)
  const urls = useRef(new Set())
  const downloadTimers = useRef(new Set())
  useEffect(() => {
    mounted.current = true
    const ownedUrls = urls.current
    const timers = downloadTimers.current
    const sessionChanged = () => { ownedUrls.forEach(url => URL.revokeObjectURL(url)); ownedUrls.clear(); setPreview('') }
    window.addEventListener(SESSION_EVENT, sessionChanged)
    return () => { mounted.current = false; window.removeEventListener(SESSION_EVENT, sessionChanged); ownedUrls.forEach(url => URL.revokeObjectURL(url)); timers.forEach(timer => window.clearTimeout(timer)); ownedUrls.clear(); timers.clear() }
  }, [])
  useEffect(() => { if (preview && dialog.current && !dialog.current.open) dialog.current.showModal() }, [preview])
  const close = () => { if (preview) { URL.revokeObjectURL(preview); urls.current.delete(preview) }; setPreview('') }
  async function open(download) {
    if (busy) return
    setBusy(true); setError('')
    try {
      const blob = await fetchExamPdf(examId, patientId)
      if (!mounted.current) return
      const url = URL.createObjectURL(blob); urls.current.add(url)
      if (download) {
        const anchor = document.createElement('a')
        const leaf = String(fileName || 'exame.pdf').split(/[\\/]/).at(-1)
        const safeName = Array.from(leaf).filter(char => char.charCodeAt(0) >= 32 && char.charCodeAt(0) !== 127).join('').slice(0, 150) || 'exame.pdf'
        anchor.href = url; anchor.download = /\.pdf$/i.test(safeName) ? safeName : `${safeName}.pdf`
        document.body.appendChild(anchor); anchor.click(); anchor.remove()
        const timer = window.setTimeout(() => { URL.revokeObjectURL(url); urls.current.delete(url); downloadTimers.current.delete(timer) }, 10000)
        downloadTimers.current.add(timer)
      } else setPreview(url)
    } catch (err) { if (mounted.current) setError(err.message || t.failure) }
    finally { if (mounted.current) setBusy(false) }
  }
  return <div className="exam-file-actions">
    {available ? <>
      <button type="button" disabled={busy} onClick={() => open(false)}>{t.view}</button>
      <button type="button" disabled={busy} onClick={() => open(true)}>{t.download}</button>
      {busy && <span role="status">{t.loading}</span>}
    </> : <span className="exam-file-unavailable">{t.unavailable}</span>}
    {error && <p role="alert">{error}</p>}
    {preview && createPortal(<dialog className="exam-pdf-dialog" ref={dialog} aria-label={t.title} onCancel={event => { event.preventDefault(); close() }}>
      <div className="exam-pdf-toolbar"><strong>{fileName || t.title}</strong><button type="button" onClick={() => open(true)} disabled={busy}>{t.download}</button><button type="button" autoFocus onClick={close}>{t.close}</button></div>
      <PdfPreviewBoundary message={t.failure}><Suspense fallback={<p role="status">{t.loading}</p>}><PdfViewer url={preview} /></Suspense></PdfPreviewBoundary>
    </dialog>, document.body)}
  </div>
}
