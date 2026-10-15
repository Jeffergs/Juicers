import { useCallback, useEffect, useRef, useState } from 'react'
import { DATA_EVENT, getMyFollowup } from '../services/api'
import { PatientFollowupContext } from './patientFollowup'

const EMPTY = { doctor: null, notes: [], requestedExams: [], interactions: [] }

export function PatientFollowupProvider({ children, fetchFollowup = getMyFollowup }) {
    const [data, setData] = useState(EMPTY)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const active = useRef(false)
    const requestVersion = useRef(null)
    const refresh = useCallback(async () => {
        const version = Symbol('followup-request')
        requestVersion.current = version
        try {
            const response = await fetchFollowup()
            if (active.current && version === requestVersion.current) { setData(response); setError('') }
            return response
        } catch (err) {
            if (active.current && version === requestVersion.current) setError(err.message || 'Não foi possível atualizar o acompanhamento.')
            throw err
        } finally {
            if (active.current && version === requestVersion.current) setLoading(false)
        }
    }, [fetchFollowup])
    useEffect(() => {
        active.current = true
        let fetching = false
        const reload = async () => {
            if (fetching || document.hidden) return
            fetching = true
            try { await refresh() } catch { /* Keep the last data and expose the error through context. */ }
            finally { fetching = false }
        }
        Promise.resolve().then(reload)
        const timer = window.setInterval(reload, 15000)
        window.addEventListener('focus', reload)
        window.addEventListener(DATA_EVENT, reload)
        document.addEventListener('visibilitychange', reload)
        return () => {
            active.current = false
            requestVersion.current = null
            window.clearInterval(timer)
            window.removeEventListener('focus', reload)
            window.removeEventListener(DATA_EVENT, reload)
            document.removeEventListener('visibilitychange', reload)
        }
    }, [refresh])
    const unreadReplies = (data.interactions || []).filter(item => item.reply && !item.replyReadAt)
    return <PatientFollowupContext.Provider value={{ data, loading, error, refresh, unreadReplies }}>{children}</PatientFollowupContext.Provider>
}

