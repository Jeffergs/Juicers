const API_URL = import.meta.env.DEV ? '/api' : `${window.location.origin}/api`
import { hasSession, notifySession, sessionRevision } from './session'
const revisions = new WeakMap()
async function apiFetch(url, options = {}) {
    const revision = sessionRevision()
    const controller = new AbortController()
    const timeout = window.setTimeout(() => controller.abort(), options.body instanceof FormData ? 90000 : 20000)
    try {
        const response = await fetch(url, { ...options, credentials: 'same-origin', signal: options.signal || controller.signal })
        revisions.set(response, revision)
        return response
    } catch (error) {
        throw new Error(error.name === 'AbortError' ? 'O serviço demorou a responder. Atualize os dados antes de tentar novamente.' : 'Não foi possível conectar ao servidor. Confira sua conexão e tente novamente.')
    } finally { window.clearTimeout(timeout) }
}


async function handleResponse(response, defaultMessage) {
    const data = await response.json().catch(() => ({}))
    if (revisions.get(response) === sessionRevision() && (data.code === 'SESSION_EXPIRED' || (data.code === 'AUTH_REQUIRED' && hasSession()) || data.sessionExpired)) notifySession(data.sessionExpired ? 'password-changed' : 'expired')

    if (!response.ok) {
        const error = new Error(data.message || defaultMessage)
        error.code = data.code
        error.status = response.status
        error.data = data
        throw error
    }

    return data
}

export const DATA_EVENT = 'juicers-data-updated'
export function notifyDataChanged() { window.dispatchEvent(new Event(DATA_EVENT)) }
export async function fetchExamPdf(examId, patientId) {
    const path = patientId ? `/doctors/patients/${encodeURIComponent(patientId)}/exams/${encodeURIComponent(examId)}/file` : `/exams/${encodeURIComponent(examId)}/file`
    const response = await apiFetch(`${API_URL}${path}`)
    if (!response.ok) await handleResponse(response, 'Não foi possível carregar o PDF.')
    if (revisions.get(response) !== sessionRevision()) throw new Error('Sua sessão mudou. Abra o exame novamente após entrar.')
    if (!response.headers.get('content-type')?.includes('application/pdf')) throw new Error('O servidor não retornou um PDF válido.')
    const blob = await response.blob()
    if (revisions.get(response) !== sessionRevision()) throw new Error('Sua sessão mudou. Abra o exame novamente após entrar.')
    return blob
}
export async function uploadPatientExamPdf(file) {
    const body = new FormData(); body.append('examPdf', file)
    const data = await handleResponse(await apiFetch(`${API_URL}/exams/upload`, { method: 'POST', body }), 'Não foi possível importar o PDF.')
    notifyDataChanged()
    return data
}

function authHeaders() {
    return {}
}

function jsonAuthHeaders() {
    return {
        'Content-Type': 'application/json',
    }
}

export async function getSession() { return handleResponse(await apiFetch(`${API_URL}/users/profile`), 'Não foi possível validar sua sessão.') }
export async function endSession() { return handleResponse(await apiFetch(`${API_URL}/users/logout`, { method: 'POST' }), 'Não foi possível encerrar a sessão.') }
export async function exportAccountData() { return handleResponse(await apiFetch(`${API_URL}/users/me/data`), 'Não foi possível exportar seus dados.') }
export async function deleteAccount(payload) { return handleResponse(await apiFetch(`${API_URL}/users/me`, { method: 'DELETE', headers: jsonAuthHeaders(), body: JSON.stringify(payload) }), 'Não foi possível excluir a conta.') }

export async function registerUser({ name, email, password, role = 'patient', doctorVerification }) {
    const response = await apiFetch(`${API_URL}/users`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password, role, doctorVerification }),
    })

    return handleResponse(response, 'Erro ao cadastrar usuário.')
}

export async function loginUser({ email, password }) {
    const response = await apiFetch(`${API_URL}/users/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
    })

    return handleResponse(response, 'Erro ao fazer login.')
}

export async function loginWithGoogle({ credential, inviteToken }) {
    const response = await apiFetch(`${API_URL}/users/google`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ credential, inviteToken }),
    })

    return handleResponse(response, 'Erro ao entrar com o Google.')
}

export async function savePatientProfile(patientData) {
    const response = await apiFetch(`${API_URL}/patients`, {
        method: 'POST',
        headers: jsonAuthHeaders(),
        body: JSON.stringify(patientData),
    })

    return handleResponse(response, 'Erro ao salvar perfil do paciente.')
}

export async function getMyPatientProfile() {
    const response = await apiFetch(`${API_URL}/patients/me`, {
        method: 'GET',
        headers: authHeaders(),
    })

    return handleResponse(response, 'Erro ao buscar perfil do paciente.')
}

export async function updateUserProfile(userData) {
    const response = await apiFetch(`${API_URL}/users/profile`, {
        method: 'PUT',
        headers: jsonAuthHeaders(),
        body: JSON.stringify(userData),
    })

    return handleResponse(response, 'Erro ao atualizar usuário.')
}

export async function changePassword({ currentPassword, newPassword }) {
    const response = await apiFetch(`${API_URL}/users/password`, {
        method: 'PUT',
        headers: jsonAuthHeaders(),
        body: JSON.stringify({ currentPassword, newPassword }),
    })

    return handleResponse(response, 'Erro ao alterar senha.')
}

export async function getMyExams({ limit, cursor } = {}) {
    const query = new URLSearchParams()
    if (limit) query.set('limit', String(limit))
    if (cursor) query.set('cursor', cursor)
    const response = await apiFetch(`${API_URL}/exams${query.size ? `?${query}` : ''}`, {
        method: 'GET',
        headers: authHeaders(),
    })

    return handleResponse(response, 'Erro ao buscar exames.')
}

export async function createExam(examData) {
    const response = await apiFetch(`${API_URL}/exams`, {
        method: 'POST',
        headers: jsonAuthHeaders(),
        body: JSON.stringify(examData),
    })

    return handleResponse(response, 'Erro ao criar exame.')
}

export async function deleteExam(id) {
    const response = await apiFetch(`${API_URL}/exams/${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
    })

    const data = await handleResponse(response, 'Erro ao deletar exame.'); notifyDataChanged(); return data
}

export async function createDoctorInvite({ patientName, patientEmail }) {
    const response = await apiFetch(`${API_URL}/doctors/invites`, {
        method: 'POST',
        headers: jsonAuthHeaders(),
        body: JSON.stringify({ patientName, patientEmail }),
    })

    return handleResponse(response, 'Erro ao criar convite.')
}

export async function getDoctorPatients({ summary = true } = {}) {
    const response = await apiFetch(`${API_URL}/doctors/patients${summary ? '?summary=1' : ''}`, {
        method: 'GET',
        headers: authHeaders(),
    })

    return handleResponse(response, 'Erro ao buscar pacientes do médico.')
}

export async function getDoctorPatientById(id) {
    const response = await apiFetch(`${API_URL}/doctors/patients/${id}`, {
        method: 'GET',
        headers: authHeaders(),
    })

    return handleResponse(response, 'Erro ao buscar paciente.')
}

export async function removeDoctorPatient(id) {
    const response = await apiFetch(`${API_URL}/doctors/patients/${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
    })

    return handleResponse(response, 'Erro ao remover atleta da lista.')
}

export async function getDoctorPatientExams(id) {
    const response = await apiFetch(`${API_URL}/doctors/patients/${id}/exams`, {
        method: 'GET',
        headers: authHeaders(),
    })

    return handleResponse(response, 'Erro ao buscar exames do paciente.')
}

export async function uploadDoctorPatientExamPdf(id, file) {
    const formData = new FormData()
    formData.append('examPdf', file)

    const response = await apiFetch(`${API_URL}/doctors/patients/${id}/exams/upload`, {
        method: 'POST',
        headers: authHeaders(),
        body: formData,
    })

    return handleResponse(response, 'Erro ao importar PDF do exame.')
}

export async function getInviteByToken(inviteToken) {
    const response = await apiFetch(`${API_URL}/doctors/invites/${inviteToken}`)

    return handleResponse(response, 'Erro ao buscar convite.')
}

export async function acceptDoctorInvite(inviteToken) {
    const response = await apiFetch(`${API_URL}/doctors/invites/${inviteToken}/accept`, {
        method: 'POST',
        headers: authHeaders(),
    })

    return handleResponse(response, 'Erro ao aceitar convite.')
}

export async function getMyFollowup() {
    const response = await apiFetch(`${API_URL}/patients/me/followup`, {
        method: 'GET',
        headers: authHeaders(),
    })

    return handleResponse(response, 'Erro ao buscar acompanhamento médico.')
}

export async function sendFollowupInteraction(payload) {
    return handleResponse(await apiFetch(`${API_URL}/patients/me/followup/interactions`, {
        method: 'POST', headers: jsonAuthHeaders(), body: JSON.stringify(payload),
    }), 'Erro ao enviar mensagem.')
}

export async function respondToPatientFollowup(patientId, itemId, payload) {
    return handleResponse(await apiFetch(`${API_URL}/doctors/patients/${patientId}/followup/${itemId}`, {
        method: 'POST', headers: jsonAuthHeaders(), body: JSON.stringify(payload),
    }), 'Erro ao atualizar acompanhamento.')
}

export async function submitFollowupResult(id, file) {
    const body = new FormData()
    body.append('examPdf', file)
    const data = await handleResponse(await apiFetch(`${API_URL}/patients/me/followup/requests/${id}/result`, {
        method: 'POST', headers: authHeaders(), body,
    }), 'Erro ao enviar resultado.')
    notifyDataChanged()
    return data
}

export async function getDoctorPatientFollowup(patientId) {
    const response = await apiFetch(`${API_URL}/doctors/patients/${patientId}/followup`, {
        method: 'GET',
        headers: authHeaders(),
    })

    return handleResponse(response, 'Erro ao buscar acompanhamento do paciente.')
}

export async function createDoctorPatientNote(patientId, text) {
    const response = await apiFetch(`${API_URL}/doctors/patients/${patientId}/notes`, {
        method: 'POST',
        headers: jsonAuthHeaders(),
        body: JSON.stringify({ text }),
    })

    return handleResponse(response, 'Erro ao criar anotação clínica.')
}

export async function toggleDoctorPatientRequestedExam(patientId, label) {
    const response = await apiFetch(`${API_URL}/doctors/patients/${patientId}/requested-exams`, {
        method: 'POST',
        headers: jsonAuthHeaders(),
        body: JSON.stringify({ label }),
    })

    return handleResponse(response, 'Erro ao solicitar exame.')
}

export async function deleteDoctorPatientExam(patientId, examId) {
    const response = await apiFetch(`${API_URL}/doctors/patients/${patientId}/exams/${examId}`, {
        method: 'DELETE',
        headers: authHeaders(),
    })

    return handleResponse(response, 'Erro ao deletar exame do paciente.')
}

export async function getMyDoctorProfile() {
    const response = await apiFetch(`${API_URL}/doctors/me`, {
        method: 'GET',
        headers: authHeaders(),
    })

    return handleResponse(response, 'Erro ao buscar perfil médico.')
}

export async function updateDoctorPatientNote(noteId, text) {
    const response = await apiFetch(`${API_URL}/doctors/notes/${noteId}`, {
        method: 'PUT',
        headers: jsonAuthHeaders(),
        body: JSON.stringify({ text }),
    })

    return handleResponse(response, 'Erro ao editar anotação.')
}

export async function deleteDoctorPatientNote(noteId) {
    const response = await apiFetch(`${API_URL}/doctors/notes/${noteId}`, {
        method: 'DELETE',
        headers: authHeaders(),
    })

    return handleResponse(response, 'Erro ao excluir anotação.')
}

export async function reverifyDoctorAccount({ email, password, doctorVerification }) {
    const response = await apiFetch(`${API_URL}/users/verify-doctor`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, doctorVerification }),
    })

    return handleResponse(response, 'Erro ao verificar o CRM do médico.')
}
