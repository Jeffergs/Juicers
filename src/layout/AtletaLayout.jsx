import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import { PatientFollowupProvider } from '../context/PatientFollowupContext'
import PatientReplyNotice from '../components/PatientReplyNotice'
import '../style/atletaLayout.css'

export default function AtletaLayout() {
    const { pathname } = useLocation()
    const followup = pathname.replace(/\/$/, '') === '/perfil/acompanhamento'
    const visualAtualizado = ['/perfil', '/perfil/dados-da-conta', '/perfil/historico-exames', '/perfil/acompanhamento'].includes(pathname.replace(/\/$/, ''))
    return (
        <PatientFollowupProvider><div className={`atleta-layout${visualAtualizado ? ' atleta-layout--conta' : ''}${followup ? ' atleta-layout--followup' : ''}`}>
            <Sidebar variant="atleta" showAccount={visualAtualizado} />
            <div className="atleta-layout-main">
                <PatientReplyNotice />
                <Outlet />
            </div>
        </div></PatientFollowupProvider>
    )
}
