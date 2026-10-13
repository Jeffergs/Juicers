import '../style/legal.css'
import { useEffect } from 'react'
import { useLanguage } from '../context/LanguageContext'

/**
 * Casca compartilhada das páginas legais (Privacidade e Termos).
 * Recebe o conteúdo como dados e cuida só da marcação e do estilo.
 *
 * conteudo = {
 *   titulo, subtitulo, atualizado,
 *   resumo: [string],                              // caixa "em resumo"
 *   secoes: [{ h, p?: [string], lista?: [string], destaque?: string }]
 * }
 */
export default function PaginaLegal({ conteudo }) {
    const { titulo, subtitulo, atualizado, resumo, secoes } = conteudo
    const { lang } = useLanguage()
    const summaryLabel = lang === 'en' ? 'In summary' : 'Em resumo'
    const updatedLabel = lang === 'en' ? 'Last updated' : 'Última atualização'
    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    }, [titulo])

    return (
        <main className="legal">
            <header className="legal_head">
                <h1>{titulo}</h1>
                {subtitulo && <p className="legal_sub">{subtitulo}</p>}
                <p className="legal_data">{updatedLabel}: {atualizado}</p>
            </header>

            {resumo?.length > 0 && (
                <section className="legal_resumo" aria-label={summaryLabel}>
                    <h2>{summaryLabel}</h2>
                    <ul>
                        {resumo.map((item) => <li key={item}>{item}</li>)}
                    </ul>
                </section>
            )}

            {secoes.map((sec, i) => (
                <section className="legal_sec" key={sec.h}>
                    <h2><span className="legal_num">{String(i + 1).padStart(2, '0')}</span>{sec.h}</h2>
                    {sec.p?.map((texto) => <p key={texto}>{texto}</p>)}
                    {sec.lista && (
                        <ul className="legal_lista">
                            {sec.lista.map((item) => <li key={item}>{item}</li>)}
                        </ul>
                    )}
                    {sec.destaque && <p className="legal_destaque">{sec.destaque}</p>}
                </section>
            ))}
        </main>
    )
}
