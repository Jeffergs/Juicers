import { createContext, useContext, useEffect, useState } from 'react'

const LanguageContext = createContext(null)

export function LanguageProvider({ children }) {
    const [lang, setLang] = useState(() => localStorage.getItem('juicers-lang') || 'pt')

    useEffect(() => {
        localStorage.setItem('juicers-lang', lang)
        document.documentElement.lang = lang === 'en' ? 'en' : 'pt-BR'
    }, [lang])

    return (
        <LanguageContext.Provider value={{ lang, setLang }}>
            {children}
        </LanguageContext.Provider>
    )
}

export function useLanguage() {
    const ctx = useContext(LanguageContext)
    if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
    return ctx
}

function warnMissing(label, detail) {
    if (import.meta.env?.DEV) {
        console.warn(`[i18n] Tradução em EN incompleta (${label}): ${detail}. Usando fallback em PT — revise esse componente.`)
    }
}

/**
 * Resolve um dicionário { pt, en } para o idioma atual.
 * Se faltar a versão em inglês (chave inteira, item de array ou propriedade
 * de objeto), cai de volta para o texto em PT em vez de quebrar a tela —
 * e avisa no console (em dev) para alguém revisar a tradução.
 */
export function useTranslation(dict, label = 'dicionário') {
    const { lang } = useLanguage()
    const pt = dict.pt

    if (lang !== 'en') return pt

    const en = dict.en
    if (en === undefined || en === null) {
        warnMissing(label, 'chave "en" ausente')
        return pt
    }

    if (Array.isArray(pt)) {
        if (!Array.isArray(en) || en.length !== pt.length) {
            warnMissing(label, 'array "en" ausente ou com tamanho diferente do "pt"')
        }
        return Array.isArray(en) && en.length ? en : pt
    }

    if (typeof pt === 'object') {
        const missing = Object.keys(pt).filter((k) => en[k] === undefined)
        if (missing.length) {
            warnMissing(label, `chaves ausentes em "en": ${missing.join(', ')}`)
        }
        return { ...pt, ...en }
    }

    return en
}
