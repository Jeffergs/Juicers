import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import logoIcon from '../assets/juicers.png'
import '../style/sidebarAtleta.css'
import '../style/sidebarMedico.css'

const ICON_DASHBOARD = (
    <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
        <rect x="1" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
        <rect x="10" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
        <rect x="1" y="10" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
        <rect x="10" y="10" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
    </svg>
)

const ICON_EXAMES = (
    <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
        <rect x="3" y="1.5" width="11" height="14" rx="2" stroke="currentColor" strokeWidth="1.4" />
        <line x1="6" y1="6" x2="11" y2="6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        <line x1="6" y1="9" x2="11" y2="9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        <line x1="6" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
)

const ICON_ACOMP = (
    <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
        <path d="M1.5 8.5h3l1.7 5 2.8-10 1.7 5h3.3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
)

const ICON_CONTA = (
    <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
        <circle cx="8.5" cy="6" r="3" stroke="currentColor" strokeWidth="1.4" />
        <path d="M2 15.5c0-3.6 2.9-6.5 6.5-6.5s6.5 2.9 6.5 6.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
)

const ICON_ATLETAS = (
    <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
        <circle cx="6" cy="5" r="2.6" stroke="currentColor" strokeWidth="1.4" />
        <path d="M1.5 15C1.5 11.5 4 10 6 10C8 10 10.5 11.5 10.5 15" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        <circle cx="12" cy="5.5" r="2" stroke="currentColor" strokeWidth="1.3" />
        <path d="M11 10C12.5 10 14.5 11 14.5 14" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
)

// Configuração por perfil: prefixo de classe CSS + itens de navegação
const VARIANTS = {
    atleta: {
        prefix: 'sa',
        items: [
            { to: '/perfil', end: true, label: 'Dashboard', icon: ICON_DASHBOARD },
            { to: '/perfil/historico-exames', end: false, label: 'Histórico de Exames', icon: ICON_EXAMES },
            { to: '/perfil/acompanhamento', end: false, label: 'Acompanhamento Médico', icon: ICON_ACOMP },
            { to: '/perfil/dados-da-conta', end: false, label: 'Dados da Conta', icon: ICON_CONTA },
        ],
    },
    medico: {
        prefix: 'sm',
        items: [
            { to: '/medico', end: true, label: 'Meus Atletas', icon: ICON_ATLETAS },
            { to: '/medico/dados-da-conta', end: false, label: 'Dados da Conta', icon: ICON_CONTA },
        ],
    },
}

export default function Sidebar({ variant = 'atleta', showAccount = false }) {
    const [open, setOpen] = useState(false)
    const { logout, usuario } = useAuth()
    const navigate = useNavigate()

    const { prefix, items } = VARIANTS[variant]
    const handleSair = () => { logout(); navigate('/login') }

    return (
        <>
            <button className={`${prefix}-hamburger`} onClick={() => setOpen(v => !v)} aria-label="Menu">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
                    {open
                        ? <path d="M4 4l12 12M16 4L4 16" />
                        : <path d="M3 5h14M3 10h14M3 15h14" />}
                </svg>
            </button>

            {open && <div className={`${prefix}-overlay`} onClick={() => setOpen(false)} />}

            <aside className={`${prefix}-sidebar${open ? ` ${prefix}-sidebar--open` : ''}`}>
                <div className={`${prefix}-logo`}>
                    <img src={logoIcon} alt="Juicers" className={`${prefix}-logo-img`} />
                </div>

                <nav className={`${prefix}-nav`}>
                    {items.map(item => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.end}
                            className={({ isActive }) => `${prefix}-link${isActive ? ` ${prefix}-link--active` : ''}`}
                            onClick={() => setOpen(false)}
                        >
                            <span className={`${prefix}-link-icon`}>{item.icon}</span>
                            <span className={`${prefix}-link-label`}>{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className={`${prefix}-footer`}>
                    {variant === 'atleta' && showAccount && <NavLink to="/perfil/dados-da-conta" className="sa-account" onClick={() => setOpen(false)}>
                        <span className="sa-account-avatar" aria-hidden="true">{(usuario?.name || 'Atleta').split(' ').filter(Boolean).slice(0, 2).map(part => part[0]).join('').toUpperCase()}</span>
                        <span className="sa-account-name">{usuario?.name || 'Atleta'}</span>
                    </NavLink>}
                    {variant === 'medico' && <NavLink to="/medico/dados-da-conta" className="sm-account" onClick={() => setOpen(false)}>
                        <span className="sm-account-avatar" aria-hidden="true">{(usuario?.name || 'Conta médica').split(' ').filter(Boolean).slice(0, 2).map(part => part[0]).join('').toUpperCase()}</span>
                        <span className="sm-account-name">{usuario?.name || 'Conta médica'}</span>
                        <span aria-hidden="true">›</span>
                    </NavLink>}
                    <button className={`${prefix}-sair`} onClick={handleSair}>
                        <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
                            <path d="M7 1.5H3a1.5 1.5 0 00-1.5 1.5v11A1.5 1.5 0 003 15.5h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                            <path d="M10 5L13.5 8.5 10 12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                            <line x1="13" y1="8.5" x2="6" y2="8.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                        </svg>
                        Sair
                    </button>
                </div>
            </aside>
        </>
    )
}
