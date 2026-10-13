import { useState } from 'react'
import AthleteFollowup from '../screens/AthleteFollowup.jsx'
import { sendFollowupInteraction, submitFollowupResult } from '../services/api'
import { usePatientFollowup } from '../context/patientFollowup'

export default function Acompanhamento() {
    const { data, loading, error: loadError, refresh } = usePatientFollowup()
    const [error, setError] = useState('')
    const [busy, setBusy] = useState(false)
    const [success, setSuccess] = useState('')
    async function act(payload, file) {
        setBusy(true); setError(''); setSuccess('')
        try {
            if (file) await submitFollowupResult(payload, file)
            else await sendFollowupInteraction(payload)
            setSuccess(file ? 'Resultado enviado ao médico.' : payload.kind === 'reply-read' ? 'Resposta marcada como lida.' : payload.kind === 'read' ? 'Leitura confirmada.' : payload.kind === 'performed' ? 'Realização registrada.' : 'Enviado ao seu médico.')
            try { await refresh() } catch { setError('A ação foi salva, mas não foi possível atualizar a tela. Clique em Tentar novamente.') }
            return true
        } catch (err) { setError(err.message); return false }
        finally { setBusy(false) }
    }
    return <AthleteFollowup data={data} loading={loading} error={error || loadError} success={success} busy={busy} onAction={act} onRetry={async () => {
        setBusy(true); setError('')
        try { await refresh() } catch (err) { setError(err.message) } finally { setBusy(false) }
    }} />
}
