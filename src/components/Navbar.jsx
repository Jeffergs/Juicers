import { useState, useEffect, useRef } from 'react'
import '../style/navbar.css'
import { Link } from 'react-router-dom'
import { useLanguage, useTranslation } from '../context/LanguageContext'
import logoIcon from '../assets/juicers.png'

const MENU_LINKS = {
    pt: [
        { label: 'INÍCIO',        href: '#inicio'    },
        { label: 'CONHEÇA',       href: '#entenda'   },
        { label: 'SOBRE',         href: '#sobre'     },
        { label: 'SOLUÇÃO',       href: '#sol'       },
        { label: 'SINAIS',        href: '#monitorar' },
        { label: 'PÚBLICO',       href: '#pub'       },
        { label: 'TRANSPARÊNCIA', href: '#naofaz'    },
        { label: 'PLANOS',        href: '#precos'    },
    ],
    en: [
        { label: 'HOME',          href: '#inicio'    },
        { label: 'LEARN',         href: '#entenda'   },
        { label: 'ABOUT',         href: '#sobre'     },
        { label: 'SOLUTION',      href: '#sol'       },
        { label: 'SIGNALS',       href: '#monitorar' },
        { label: 'AUDIENCE',      href: '#pub'       },
        { label: 'TRANSPARENCY',  href: '#naofaz'    },
        { label: 'PRICING',       href: '#precos'    },
    ],
}

const NAV_LINKS = {
    pt: [
        { label: 'SIMULADOR',     to: '/simulador'     },
        { label: 'MAPA CORPORAL', to: '/mapa-corporal' },
        { label: 'REFERÊNCIA',    to: '/referencias'   },
        { label: 'FEEDBACK',      href: '#feedback'    },
    ],
    en: [
        { label: 'SIMULATOR',  to: '/simulador'     },
        { label: 'BODY MAP',   to: '/mapa-corporal' },
        { label: 'REFERENCE',  to: '/referencias'   },
        { label: 'FEEDBACK',   href: '#feedback'    },
    ],
}

const ENTRAR = { pt: 'Entrar', en: 'Sign in' }
const MENU_UI = { pt: { open: 'Abrir menu', close: 'Fechar menu' }, en: { open: 'Open menu', close: 'Close menu' } }

export default function Navbar() {
    const { lang, setLang } = useLanguage()
    const menuLinks = useTranslation(MENU_LINKS, 'Navbar.MENU_LINKS')
    const navLinks = useTranslation(NAV_LINKS, 'Navbar.NAV_LINKS')
    const entrar = useTranslation(ENTRAR, 'Navbar.ENTRAR')
    const menuUi = useTranslation(MENU_UI, 'Navbar.MENU_UI')
    const [menuOpen, setMenuOpen] = useState(false)
    const [mobileOpen, setMobileOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)
    const menuRef = useRef(null)
    const mobileRef = useRef(null)

    useEffect(() => {
        const onKeyDown = (event) => {
            if (event.key === 'Escape') {
                setMenuOpen(false)
                setMobileOpen(false)
            }
        }
        document.addEventListener('keydown', onKeyDown)
        return () => document.removeEventListener('keydown', onKeyDown)
    }, [])

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 40)

        onScroll()
        window.addEventListener('scroll', onScroll, { passive: true })

        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    useEffect(() => {
        if (!menuOpen) return
        const onClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setMenuOpen(false)
            }
        }
        document.addEventListener('mousedown', onClickOutside)
        return () => document.removeEventListener('mousedown', onClickOutside)
    }, [menuOpen])

    useEffect(() => {
        if (!mobileOpen) return
        const onClickOutside = (e) => {
            if (mobileRef.current && !mobileRef.current.contains(e.target)) {
                setMobileOpen(false)
            }
        }
        document.addEventListener('mousedown', onClickOutside)
        return () => document.removeEventListener('mousedown', onClickOutside)
    }, [mobileOpen])

    const close = () => setMenuOpen(false)
    const closeMobile = () => setMobileOpen(false)

    return (
        <nav className={`navbar${scrolled ? ' scrolled' : ''}`}>
            <div className="nav-start">
                <a className="navbar-brand" href="/">
                    <img src={logoIcon} alt="Juicers" className="logo-icon" />
                </a>

                <div className="lang-switch">
                    <svg className="lang-globe" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                        <circle cx="12" cy="12" r="9" />
                        <path d="M3 12h18M12 3c2.4 2.5 3.8 5.6 3.8 9s-1.4 6.5-3.8 9c-2.4-2.5-3.8-5.6-3.8-9s1.4-6.5 3.8-9z" />
                    </svg>
                    <button
                        type="button"
                        className={lang === 'pt' ? 'active' : ''}
                        onClick={() => setLang('pt')}
                    >
                        PT
                    </button>
                    <span className="lang-sep">/</span>
                    <button
                        type="button"
                        className={lang === 'en' ? 'active' : ''}
                        onClick={() => setLang('en')}
                    >
                        EN
                    </button>
                </div>
            </div>

            <div className="nav-end">
                <div className="menu-wrap" ref={menuRef}>
                    <button
                        type="button"
                        className={`menu-btn${menuOpen ? ' open' : ''}`}
                        onClick={() => setMenuOpen(!menuOpen)}
                        aria-expanded={menuOpen}
                    >
                        MENU
                        <svg className="menu-btn-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M6 9l6 6 6-6" />
                        </svg>
                    </button>

                    <div className={`nav-dropdown${menuOpen ? ' open' : ''}`}>
                        {menuLinks.map(l => (
                            <Link key={l.href} to={`/${l.href}`} onClick={close}>{l.label}</Link>
                        ))}
                    </div>
                </div>

                {navLinks.map(l => (
                    <Link
                        key={l.label}
                        className="nav-link"
                        to={l.to ?? `/${l.href}`}
                        onClick={close}
                    >
                        {l.label}
                    </Link>
                ))}

                <Link className="btn-login" to="/login">{entrar}</Link>

                <div className="hamburger-wrap" ref={mobileRef}>
                    <button
                        type="button"
                        className={`hamburger-btn${mobileOpen ? ' open' : ''}`}
                        onClick={() => setMobileOpen(!mobileOpen)}
                        aria-expanded={mobileOpen}
                        aria-controls="mobile-navigation"
                        aria-label={mobileOpen ? menuUi.close : menuUi.open}
                    >
                        <span /><span /><span />
                    </button>

                    <div id="mobile-navigation" className={`mobile-panel${mobileOpen ? ' open' : ''}`}>
                        {menuLinks.map(l => (
                            <Link key={l.href} to={`/${l.href}`} onClick={closeMobile}>{l.label}</Link>
                        ))}
                        <div className="mobile-divider" />
                        {navLinks.map(l => (
                            <Link key={l.label} to={l.to ?? `/${l.href}`} onClick={closeMobile}>{l.label}</Link>
                        ))}
                        <Link className="btn-login mobile" to="/login" onClick={closeMobile}>{entrar}</Link>
                    </div>
                </div>
            </div>
        </nav>
    )
}
