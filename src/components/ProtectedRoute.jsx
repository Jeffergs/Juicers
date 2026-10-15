import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/auth'

export default function ProtectedRoute({ children, role }) {
    const { usuario, loading, sessionReason, sessionError } = useAuth()
    if (loading) return <p role="status">Validando sessão…</p>
    if (sessionError) return <div role="alert"><p>{sessionError}</p><button onClick={() => window.location.reload()}>Tentar novamente</button></div>

    if (!usuario) {
        return <Navigate to={`/login${['expired', 'password-changed'].includes(sessionReason) ? `?session=${sessionReason}` : ''}`} replace />
    }

    if (role && usuario.role !== role) {
        const redirecionar = usuario.role === 'medico' ? '/medico' : '/perfil'
        return <Navigate to={redirecionar} replace />
    }

    return children
}
