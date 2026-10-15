import { useEffect, useState } from 'react'
import { endSession, getSession } from '../services/api'
import { clearLegacyData, notifySession, rememberSession, SESSION_EVENT } from '../services/session'

import { AuthContext } from './auth.js'
function mapRole(role) { return role === 'doctor' ? 'medico' : role === 'patient' ? 'atleta' : role }
export function AuthProvider({ children }) {
    const [usuario, setUsuario] = useState(null)
    const [loading, setLoading] = useState(true)
    const [sessionReason, setSessionReason] = useState('')
    const [sessionError, setSessionError] = useState('')
    useEffect(() => {
        let active = true
        let version = 0
        let timer
        clearLegacyData()
        const receive = (event) => {
            version += 1
            window.clearTimeout(timer)
            setUsuario(event.detail.user ? { ...event.detail.user, role: mapRole(event.detail.user.role) } : null)
            setSessionReason(event.detail.reason)
            setLoading(false)
            if (event.detail.reason === 'login') refresh()
        }
        window.addEventListener(SESSION_EVENT, receive)
        const refresh = async () => {
            const current = version
            try {
                const data = await getSession()
                if (active && current === version) {
                    setUsuario({ ...data.user, role: mapRole(data.user.role) }); setSessionError('')
                    rememberSession()
                    window.clearTimeout(timer)
                    if (data.expiresAt) timer = window.setTimeout(() => notifySession('expired'), Math.max(0, data.expiresAt - Date.now()))
                }
            } catch (error) {
                if (active && current === version && error.status !== 401) setSessionError('Não foi possível validar sua sessão. Tente recarregar a página.')
            } finally { if (active) setLoading(false) }
        }
        refresh()
        window.addEventListener('focus', refresh)
        return () => { active = false; window.clearTimeout(timer); window.removeEventListener(SESSION_EVENT, receive); window.removeEventListener('focus', refresh) }
    }, [])
    const loginComToken = (_token, user) => { setSessionError(''); notifySession('login', user) }
    const atualizarUsuario = (data) => setUsuario(current => ({ ...current, ...data, role: mapRole(data.role || current.role) }))
    const logout = async () => {
        await endSession()
        notifySession('logout')
    }
    return <AuthContext.Provider value={{ usuario, loading, sessionReason, sessionError, loginComToken, atualizarUsuario, logout }}>{children}</AuthContext.Provider>
}
