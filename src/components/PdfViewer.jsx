import { useEffect, useRef, useState } from 'react'
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist'
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import { useTranslation } from '../context/language'

GlobalWorkerOptions.workerSrc = workerUrl
const T = {
  pt: { previous: 'Página anterior', next: 'Próxima página', page: 'Página', of: 'de', loading: 'Carregando página…', failure: 'Não foi possível exibir o PDF. Você ainda pode baixá-lo e abrir no seu dispositivo.', text: 'Ler texto da página' },
  en: { previous: 'Previous page', next: 'Next page', page: 'Page', of: 'of', loading: 'Loading page…', failure: 'Unable to display the PDF. You can still download it and open it on your device.', text: 'Read page text' },
}

export default function PdfViewer({ url }) {
  const t = useTranslation(T, 'PdfViewer.T')
  const failure = t.failure
  const canvas = useRef(null)
  const viewport = useRef(null)
  const [pdf, setPdf] = useState(null)
  const [page, setPage] = useState(1)
  const [width, setWidth] = useState(800)
  const [busy, setBusy] = useState(true)
  const [error, setError] = useState('')
  const [text, setText] = useState('')
  useEffect(() => {
    let active = true
    const task = getDocument({ url, isEvalSupported: false })
    task.promise.then(document => { if (active) setPdf(document) }).catch(() => { if (active) { setError(failure); setBusy(false) } })
    return () => { active = false; task.destroy().catch(() => {}) }
  }, [url, failure])
  useEffect(() => {
    const observer = new ResizeObserver(entries => setWidth(Math.max(180, Math.min(1000, entries[0].contentRect.width - 32))))
    observer.observe(viewport.current)
    return () => observer.disconnect()
  }, [])
  useEffect(() => {
    if (!pdf) return
    let active = true
    let rendering
    async function render() {
      try {
        setBusy(true); setError(''); setText('')
        const documentPage = await pdf.getPage(page)
        if (!active) return
        const view = documentPage.getViewport({ scale: width / documentPage.getViewport({ scale: 1 }).width })
        const ratio = Math.min(window.devicePixelRatio || 1, 2)
        const target = canvas.current
        target.width = Math.floor(view.width * ratio); target.height = Math.floor(view.height * ratio)
        target.style.width = `${view.width}px`; target.style.height = `${view.height}px`
        rendering = documentPage.render({ canvasContext: target.getContext('2d'), viewport: view, transform: ratio === 1 ? null : [ratio, 0, 0, ratio, 0, 0] })
        await rendering.promise
        const content = await documentPage.getTextContent()
        if (active) setText(content.items.map(item => item.str || '').join(' '))
      } catch { if (active) setError(failure) }
      finally { if (active) setBusy(false) }
    }
    render()
    return () => { active = false; rendering?.cancel() }
  }, [pdf, page, width, failure])
  return <div className="exam-pdf-content" ref={viewport}>
    {pdf && <div className="exam-pdf-pages"><button type="button" disabled={busy || page === 1} onClick={() => setPage(current => current - 1)}>{t.previous}</button><span aria-live="polite">{t.page} {page} {t.of} {pdf.numPages}</span><button type="button" disabled={busy || page === pdf.numPages} onClick={() => setPage(current => current + 1)}>{t.next}</button></div>}
    {busy && <p role="status">{t.loading}</p>}
    {error && <p role="alert">{error}</p>}
    <canvas ref={canvas} aria-hidden="true" />
    {text && <details className="exam-pdf-text"><summary>{t.text}</summary><p>{text}</p></details>}
  </div>
}
