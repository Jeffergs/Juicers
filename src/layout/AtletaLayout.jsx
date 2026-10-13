import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import '../style/atletaLayout.css'

export default function AtletaLayout() {
    const { pathname } = useLocation()
    const visualAtualizado = ['/perfil', '/perfil/dados-da-conta', '/perfil/historico-exames', '/perfil/acompanhamento'].includes(pathname.replace(/\/$/, ''))
    return (
        <div className={`atleta-layout${visualAtualizado ? ' atleta-layout--conta' : ''}`}>
            <Sidebar variant="atleta" showAccount={visualAtualizado} />
            <div className="atleta-layout-main">
                <Outlet />
            </div>
        </div>
    )
}
