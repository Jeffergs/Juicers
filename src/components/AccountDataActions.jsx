import { useUiText } from '../context/uiText'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { deleteAccount, exportAccountData, changePassword } from '../services/api'
import { notifySession } from '../services/session'
import '../style/accountDataActions.css'

export default function AccountDataActions() {
  const ui = useUiText()

    const navigate = useNavigate()
    const [confirmation, setConfirmation] = useState('')
    const [password, setPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [busy, setBusy] = useState('')
    const [error, setError] = useState('')
    const [showDelete, setShowDelete] = useState(false)
    const run = async (action, task) => {
        if (busy) return
        setBusy(action); setError('')
        try { await task() } catch (err) { setError(err.message) } finally { setBusy('') }
    }
    const download = () => run('export', async () => {
        const data = await exportAccountData()
        const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }))
        const link = document.createElement('a'); link.href = url; link.download = 'juicers-meus-dados.json'; link.click()
        setTimeout(() => URL.revokeObjectURL(url), 1000)
    })
    const remove = (event) => {
        event.preventDefault()
        run('delete', async () => {
            await deleteAccount({ confirmation, currentPassword: password })
            notifySession('deleted'); navigate('/login', { replace: true })
        })
    }
    return <section className="account-data-actions" aria-labelledby="account-data-title">
        <h2 id="account-data-title">{ui("Segurança e seus dados")}</h2>
        <p>{ui("Baixe uma cópia do seu cadastro, exames e conversas antes de excluir a conta.")}</p>
        <button type="button" onClick={download} disabled={Boolean(busy)}>{busy === 'export' ? ui("Preparando cópia…") : ui("Baixar meus dados")}</button>
        <form onSubmit={event => { event.preventDefault(); run('password', () => changePassword({ currentPassword: password, newPassword })) }}>
            <label>{ui("Senha atual")} <input type="password" autoComplete="current-password" value={password} onChange={event => setPassword(event.target.value)} /></label>
            <label>{ui("Nova senha")} <input type="password" autoComplete="new-password" minLength={8} value={newPassword} onChange={event => setNewPassword(event.target.value)} /></label>
            <button disabled={Boolean(busy) || !password || !newPassword}>{ui("Alterar senha e encerrar sessões")}</button>
            <p>{ui("Contas Google entram pelo Google e não possuem senha local.")}</p>
        </form>
        <button type="button" className="account-data-danger" onClick={() => setShowDelete(value => !value)} disabled={Boolean(busy)}>{ui("Excluir minha conta")}</button>
        {showDelete && <form onSubmit={remove}>
            <p><strong>{ui("A exclusão é definitiva.")}</strong> {ui("Cadastro, perfil, exames, mensagens, orientações e solicitações serão apagados. O médico perderá o acesso.")}</p>
            <p>{ui("Confirme sua senha atual acima. Se usa Google,")} <Link to="/login">{ui("entre novamente")}</Link> {ui("e conclua a exclusão em até 15 minutos.")}</p>
            <label>{ui("Digite EXCLUIR")} <input value={confirmation} onChange={event => setConfirmation(event.target.value)} autoComplete="off" /></label>
            <button className="account-data-danger" disabled={Boolean(busy) || confirmation !== 'EXCLUIR'}>{busy === 'delete' ? ui("Excluindo…") : ui("Confirmar exclusão definitiva")}</button>
            <button type="button" disabled={Boolean(busy)} onClick={() => { setShowDelete(false); setConfirmation('') }}>{ui("Cancelar")}</button>
        </form>}
        {error && <p role="alert">{error}</p>}
    </section>
}
