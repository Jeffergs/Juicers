import { useEffect, useState } from 'react'
import { getMyExams, getMyPatientProfile } from '../services/api'
import Dashboard from '../components/perfilDoUsuario/Dashboard.jsx'
import MarkerModal from '../components/perfilDoUsuario/MarkerModal.jsx'
import { buildDashboardData, formatExamDate } from '../data/markers.js'
import '../style/perfil.css'
import '../style/dashboardAtleta.css'

const PERFIL_VAZIO = {
    nome: 'Paciente',
    idade: '',
    sexo: '',
    tempoUso: '',
    dosagem: '',
    esteroides: [],
    cicloAtivo: '',
    ultimoExame: 'Não informado',
}

function formatarDosagem(dosagem) {
    if (!dosagem) return ''
    return `${dosagem}mg/sem`
}

function formatarTempoUso(tempoUso) {
    if (!tempoUso) return ''
    return tempoUso
}

function formatarStatusCiclo(cicloAtivo) {
    if (cicloAtivo === 'sim') return 'Ciclo ativo'
    if (cicloAtivo === 'off') return 'Em off'
    if (cicloAtivo === 'nunca') return 'Nunca usou'
    return ''
}

// O catálogo de marcadores e a montagem da série agora vivem em
// src/data/markers.js — antes esta lista estava duplicada em três arquivos.
const formatarDataExame = formatExamDate

export default function PerfilAtleta() {
    const [perfilPaciente, setPerfilPaciente] = useState(null)
    const [exames, setExames] = useState([])
    const [carregando, setCarregando] = useState(true)
    const [marcador, setMarcador] = useState(null)

    useEffect(() => {
        async function carregarDadosDashboard() {
            try {
                const [perfilResponse, examesResponse] = await Promise.all([
                    getMyPatientProfile(),
                    getMyExams(),
                ])

                setPerfilPaciente(perfilResponse.patient)
                setExames(examesResponse.exams || [])
            } catch (error) {
                console.error('Erro ao carregar dashboard:', error)
            } finally {
                setCarregando(false)
            }
        }

        carregarDadosDashboard()
    }, [])

    const dashboardData = buildDashboardData(exames)

    const perfilDinamico = {
        ...PERFIL_VAZIO,
        nome: perfilPaciente?.userId?.name || PERFIL_VAZIO.nome,
        idade: perfilPaciente?.age || PERFIL_VAZIO.idade,
        sexo:
            perfilPaciente?.biologicalSex === 'male'
                ? 'masculino'
                : perfilPaciente?.biologicalSex === 'female'
                    ? 'feminino'
                    : PERFIL_VAZIO.sexo,
        tempoUso: formatarTempoUso(perfilPaciente?.cycleTime),
        dosagem: formatarDosagem(perfilPaciente?.weeklyDosage),
        esteroides: perfilPaciente?.substances?.length
            ? perfilPaciente.substances
            : [],
        cicloAtivo: perfilPaciente?.cycleStatus || '',
        ultimoExame: perfilPaciente?.lastExamDate
            ? formatarDataExame(perfilPaciente.lastExamDate)
            : exames[0]?.examDate
                ? formatarDataExame(exames[0].examDate)
                : 'Não informado',
    }

    const primeiroNome = perfilDinamico.nome.split(' ')[0]
    const statusCiclo = formatarStatusCiclo(perfilDinamico.cicloAtivo)

    if (carregando) {
        return (
            <div className="main atleta-dashboard">
                <div className="content">
                    <p className="page-sub">Carregando dashboard...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="main atleta-dashboard">
            <div className="content">
                <div className="page-header">
                    <div>
                        <h1 className="page-title">Dashboard</h1>
                        <p className="ad-welcome">Olá, {primeiroNome}. Acompanhe seus indicadores de saúde.</p>

                        <p className="page-sub">
                            {perfilDinamico.idade && <>{perfilDinamico.idade} anos</>}
                            {statusCiclo && <> · {statusCiclo}</>}
                            {perfilDinamico.cicloAtivo !== 'nunca' && perfilDinamico.tempoUso && (
                                <> há {perfilDinamico.tempoUso}</>
                            )}
                            {perfilDinamico.cicloAtivo !== 'nunca' && perfilDinamico.dosagem && (
                                <> · {perfilDinamico.dosagem}</>
                            )}
                            <> · Último exame: {perfilDinamico.ultimoExame}</>
                        </p>
                    </div>
                </div>

                <Dashboard
                    hideHeader
                    summary={dashboardData.summary}
                    alerts={dashboardData.alerts}
                    categories={dashboardData.categories}
                    examDates={dashboardData.examDates}
                    unknownKeys={dashboardData.unknownKeys}
                    onSelect={setMarcador}
                />

                {exames.length === 0 && (
                    <div className="ad-empty">
                        Nenhum exame importado ainda. Quando seu médico importar um exame, os gráficos aparecerão aqui.
                    </div>
                )}
            </div>

            {marcador && (
                <MarkerModal
                    marker={marcador}
                    onClose={() => setMarcador(null)}
                />
            )}
        </div>
    )
}
