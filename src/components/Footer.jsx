import { Link } from 'react-router-dom'
import '../style/footer.css'
import logoIcon from '../assets/juicers-optimized.png'
import { useTranslation } from '../context/language'

const T = {
    pt: {
        tagline: 'Seus exames e indicadores organizados para acompanhar sua saúde ao longo do tempo.',
        navigation: 'Navegação', tools: 'Ferramentas', account: 'Sua conta',
        navigationLinks: ['Início', 'Sobre o projeto', 'Como funciona', 'Planos'],
        toolLinks: ['Simulador', 'Mapa corporal', 'Referências', 'Feedback'],
        athlete: 'Entrar como atleta', doctor: 'Entrar como médico', start: 'Começar acompanhamento',
        disclaimer: 'A Juicers informa e acompanha. Não substitui orientação médica profissional.',
        rights: 'Todos os direitos reservados.', privacy: 'Privacidade', terms: 'Termos de uso', top: 'Voltar ao topo',
        unavailable: 'Em breve',
    },
    en: {
        tagline: 'Your exams and indicators organized to track your health over time.',
        navigation: 'Navigation', tools: 'Tools', account: 'Your account',
        navigationLinks: ['Home', 'About the project', 'How it works', 'Plans'],
        toolLinks: ['Simulator', 'Body map', 'References', 'Feedback'],
        athlete: 'Sign in as an athlete', doctor: 'Sign in as a doctor', start: 'Start tracking',
        disclaimer: 'Juicers provides information and tracking. It does not replace professional medical guidance.',
        rights: 'All rights reserved.', privacy: 'Privacy', terms: 'Terms of use', top: 'Back to top',
        unavailable: 'Coming soon',
    },
}
const navigationTargets = ['/#inicio', '/#sobre', '/#sol', '/#precos']
const toolTargets = ['/simulador', '/mapa-corporal', '/referencias', 'https://forms.gle/Px1jDZzcVkgYH9zD9']

export default function Footer() {
    const t = useTranslation(T, 'Footer.T')
    return (
        <footer className="footer">
            <div className="footer_container">
                <div className="footer_top">
                    <div className="footer_brand">
                        <Link className="footer_logo" to="/" aria-label="Juicers">
                            <img src={logoIcon} alt="Juicers" />
                        </Link>
                        <p className="footer_tagline">{t.tagline}</p>
                        <div className="footer_sociais">
                            <button className="footer_social_link" type="button" disabled title={`Instagram — ${t.unavailable}`} aria-label={`Instagram — ${t.unavailable}`}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" /></svg>
                            </button>
                            <button className="footer_social_link" type="button" disabled title={`LinkedIn — ${t.unavailable}`} aria-label={`LinkedIn — ${t.unavailable}`}>
                                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M4 9h4v12H4zM6 3a2 2 0 1 0 0 4 2 2 0 0 0 0-4M10 9h4v1.6c.8-1.2 1.8-1.8 3.2-1.8 3 0 3.8 2 3.8 4.7V21h-4v-6.6c0-1.6-.4-2.4-1.5-2.4-1.2 0-1.5 1-1.5 2.4V21h-4z" /></svg>
                            </button>
                        </div>
                    </div>
                    <nav className="footer_nav" aria-label={t.navigation}>
                        <h2>{t.navigation}</h2>
                        <ul>{t.navigationLinks.map((label, i) => <li key={navigationTargets[i]}><Link to={navigationTargets[i]}>{label}</Link></li>)}</ul>
                    </nav>
                    <nav className="footer_nav" aria-label={t.tools}>
                        <h2>{t.tools}</h2>
                        <ul>{t.toolLinks.map((label, i) => <li key={toolTargets[i]}>{i === 3 ? <a href={toolTargets[i]} target="_blank" rel="noopener noreferrer">{label}</a> : <Link to={toolTargets[i]}>{label}</Link>}</li>)}</ul>
                    </nav>
                    <nav className="footer_nav" aria-label={t.account}>
                        <h2>{t.account}</h2>
                        <ul>
                            <li><Link to="/login?role=atleta">{t.athlete}</Link></li>
                            <li><Link to="/login?role=medico">{t.doctor}</Link></li>
                        </ul>
                        <Link className="footer_start" to="/login">{t.start} <span aria-hidden="true">→</span></Link>
                    </nav>
                </div>
                <div className="footer_disclaimer">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 11v6M12 7v1" /></svg>
                    <p>{t.disclaimer}</p>
                </div>
                <div className="footer_bottom">
                    <p>© {new Date().getFullYear()} Juicers. {t.rights}</p>
                    <div className="footer_bottom_links">
                        <Link to="/privacidade">{t.privacy}</Link>
                        <Link to="/termos">{t.terms}</Link>
                        <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })}>{t.top} <span aria-hidden="true">↑</span></button>
                    </div>
                </div>
            </div>
        </footer>
    )
}
