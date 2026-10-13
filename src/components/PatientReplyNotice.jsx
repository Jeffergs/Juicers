import { Link } from 'react-router-dom'
import { usePatientFollowup } from '../context/patientFollowup'

export default function PatientReplyNotice() {
    const { unreadReplies, error } = usePatientFollowup()
    if (!unreadReplies.length) return null
    return <aside className="patient-reply-notice" aria-label="Novas respostas do profissional">
        <div role="status"><strong>{unreadReplies.length === 1 ? 'Seu profissional respondeu à sua mensagem.' : `Você tem ${unreadReplies.length} respostas não lidas do seu profissional.`}</strong><p>{error ? 'A atualização automática falhou. Abra o acompanhamento para atualizar.' : 'Confira a resposta na conversa do seu acompanhamento.'}</p></div>
        <Link to="/perfil/acompanhamento?respostas=novas">Ver respostas</Link>
    </aside>
}
