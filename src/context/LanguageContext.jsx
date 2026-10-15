import { useEffect, useState } from 'react'

import { LanguageContext } from './language.js'

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
