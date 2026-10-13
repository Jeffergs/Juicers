import { useEffect, useState } from 'react'
import { getMyPatientProfile, savePatientProfile, updateUserProfile } from '../services/api'
import { useAuth } from '../context/AuthContext'
import '../style/dadosContaMedico.css'
import '../style/dadosContaAtleta.css'


const COMPOSTOS = [
    'Testosterona Enantato', 'Testosterona Cipionato', 'Trembolona',
    'Oxandrolona', 'Nandrolona', 'Boldenona', 'Stanozolol', 'Masteron',
]

const CONDICOES = [
    'Hipertensão', 'Colesterol elevado', 'Problemas hepáticos',
    'Histórico cardíaco familiar', 'Nenhuma das anteriores',
]

const INITIAL = {
    nome: '',
    sobrenome: '',
    idade: '',
    sexo: '',
    peso: '',
    altura: '',
    cicloAtivo: 'sim',
    // cada item: { nome, dosagem } (dosagem em mg/semana)
    compostos: [],
    tempoUso: '',
    fezeExames: 'recentes',
    dataUltimoExame: '',
    condicoes: [],
    ultimaAtualizacao: '',
}

// Normaliza tanto o formato antigo (array de strings) quanto
// o formato novo (array de {nome/dosagem} ou {name/weeklyDosage})
function normalizarCompostos(raw) {
    if (!Array.isArray(raw)) return []

    return raw
        .map(item => {
            if (typeof item === 'string') return { nome: item, dosagem: '' }
            return {
                nome: item.nome || item.name || '',
                dosagem: item.dosagem ?? item.weeklyDosage ?? '',
            }
        })
        .filter(c => c.nome)
}

function RadioGroup({ options, value, onChange }) {
    return (
        <div className="dc-radio-group">
            {options.map(o => {
                const sel = value === o.val
                return (
                    <div
                        key={o.val}
                        className={`dc-radio-opt${sel ? ' dc-radio-opt--sel' : ''}`}
                        onClick={() => onChange(o.val)}
                    >
                        <div className="dc-radio-dot">
                            {sel && <div className="dc-radio-inner" />}
                        </div>
                        <span className="dc-radio-text">{o.label}</span>
                    </div>
                )
            })}
        </div>
    )
}

function CheckGroup({ options, value, onChange }) {
    const toggle = v =>
        onChange(value.includes(v) ? value.filter(x => x !== v) : [...value, v])
    return (
        <div className="dc-check-group">
            {options.map(c => {
                const sel = value.includes(c)
                return (
                    <div
                        key={c}
                        className={`dc-check-opt${sel ? ' dc-check-opt--sel' : ''}`}
                        onClick={() => toggle(c)}
                    >
                        <div className="dc-check-box">{sel && '✓'}</div>
                        <span className="dc-check-text">{c}</span>
                    </div>
                )
            })}
        </div>
    )
}

function Toast({ msg, show, warn }) {
    return (
        <div className={`dc-toast${show ? ' dc-toast--show' : ''}`}>
            <div className={`dc-toast-dot${warn ? ' dc-toast-dot--warn' : ''}`} />
            {msg}
        </div>
    )
}

export default function DadosContaAtleta({ embedded = false }) {
    const { atualizarUsuario } = useAuth()
    const dadosIniciais = INITIAL

    const [form, setForm] = useState(dadosIniciais)
    const [saved, setSaved] = useState(dadosIniciais)
    const [toast, setToast] = useState({ show: false, msg: '', warn: false })
    const [saving, setSaving] = useState(false)
    const [loading, setLoading] = useState(true)
    const [profileLoaded, setProfileLoaded] = useState(false)
    const [saveError, setSaveError] = useState('')
    const [novoComposto, setNovoComposto] = useState('')

    useEffect(() => {
        async function carregarDoBanco() {
            try {
                const data = await getMyPatientProfile()
                const patient = data.patient

                const nomeCompleto = patient.userId?.name || ''
                const partesNome = nomeCompleto.split(' ')

                const dadosBanco = {
                    ...INITIAL,
                    nome: partesNome[0] || '',
                    sobrenome: partesNome.slice(1).join(' '),
                    idade: patient.age || '',
                    sexo: patient.biologicalSex === 'male' ? 'Masculino' : patient.biologicalSex === 'female' ? 'Feminino' : '',
                    peso: patient.weight || '',
                    altura: patient.height ? patient.height * 100 : '',
                    cicloAtivo: patient.cycleStatus || 'sim',
                    tempoUso: patient.cycleTime || '',
                    fezeExames: patient.examStatus || 'recentes',
                    dataUltimoExame: patient.lastExamDate || '',
                    compostos: normalizarCompostos(patient.substances),
                    condicoes: patient.healthConditions || [],
                    ultimaAtualizacao: patient.updatedAt
                        ? new Date(patient.updatedAt).toLocaleDateString('pt-BR')
                        : '',
                }

                setForm(dadosBanco)
                setSaved(dadosBanco)
                setProfileLoaded(true)
                localStorage.setItem('dadosContaCicloRisco', JSON.stringify(dadosBanco))
            } catch (error) {
                setSaveError(error.message || 'Não foi possível carregar seus dados. Recarregue a página.')
            } finally {
                setLoading(false)
            }
        }

        carregarDoBanco()
    }, [])

    const dirty = JSON.stringify(form) !== JSON.stringify(saved)

    const update = (key, val) => setForm(p => ({ ...p, [key]: val }))

    // ── Compostos: adicionar (sugestão ou livre), remover e editar dosagem ──
    const nomesSelecionados = form.compostos.map(c => c.nome)
    const sugestoesDisponiveis = COMPOSTOS.filter(c => !nomesSelecionados.includes(c))

    const adicionarComposto = nomeBruto => {
        const nome = nomeBruto.trim()
        if (!nome) return
        if (nomesSelecionados.some(n => n.toLowerCase() === nome.toLowerCase())) return

        setForm(p => ({ ...p, compostos: [...p.compostos, { nome, dosagem: '' }] }))
    }

    const removerComposto = nome => {
        setForm(p => ({ ...p, compostos: p.compostos.filter(c => c.nome !== nome) }))
    }

    const atualizarDosagemComposto = (nome, val) => {
        setForm(p => ({
            ...p,
            compostos: p.compostos.map(c => (c.nome === nome ? { ...c, dosagem: val } : c)),
        }))
    }

    const handleAdicionarCustom = () => {
        adicionarComposto(novoComposto)
        setNovoComposto('')
    }

    const handleCustomKeyDown = e => {
        if (e.key === 'Enter') {
            e.preventDefault()
            handleAdicionarCustom()
        }
    }

    const showToast = (msg, warn = false) => {
        setToast({ show: true, msg, warn })
        setTimeout(() => setToast(t => ({ ...t, show: false })), 3200)
    }

    const handleSave = async () => {
        if (saving || loading || !profileLoaded) return
        try {
            setSaving(true)
            setSaveError('')

            const sexoMap = {
                Masculino: 'male',
                Feminino: 'female',
            }

            const nomeCompleto = `${form.nome || ''} ${form.sobrenome || ''}`.trim()

            const dosagemSemanalTotal = form.compostos.reduce(
                (soma, c) => soma + (Number(c.dosagem) || 0),
                0
            )

            if (!form.nome.trim() || !form.sobrenome.trim()) throw new Error('Preencha o nome e o sobrenome.')
            if (form.compostos.some(c => !Number.isFinite(Number(c.dosagem)) || Number(c.dosagem) < 0)) throw new Error('Informe dosagens válidas e não negativas.')

            const profileResponse = await savePatientProfile({
                age: Number(form.idade),
                biologicalSex: sexoMap[form.sexo] || 'other',
                weight: Number(form.peso),
                height: Number(form.altura) / 100,
                cycleStatus: form.cicloAtivo,
                weeklyDosage: dosagemSemanalTotal,
                cycleTime: form.tempoUso,
                examStatus: form.fezeExames,
                lastExamDate: form.dataUltimoExame,
                substances: form.compostos.map(c => ({
                    name: c.nome,
                    weeklyDosage: Number(c.dosagem) || 0,
                })),
                healthConditions: form.condicoes,
            })

            const userResponse = await updateUserProfile({ name: nomeCompleto })
            atualizarUsuario(userResponse.user)

            const dadosAtualizados = {
                ...form,
                nome: form.nome.trim(),
                sobrenome: form.sobrenome.trim(),
                compostos: normalizarCompostos(profileResponse.patient.substances),
                ultimaAtualizacao: new Date(profileResponse.patient.updatedAt).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                }),
            }

            localStorage.setItem('dadosContaCicloRisco', JSON.stringify(dadosAtualizados))

            setForm(dadosAtualizados)
            setSaved(dadosAtualizados)
            showToast('Dados atualizados com sucesso')
        } catch (error) {
            setSaveError(error.message || 'Erro ao salvar dados')
            showToast(error.message || 'Erro ao salvar dados', true)
        } finally {
            setSaving(false)
        }
    }

    const handleDiscard = () => {
        setForm({ ...saved })
        showToast('Alterações descartadas', true)
    }

    const saveBtnClass = [
        'dc-btn-save',
        dirty ? 'dc-btn-save--active' : '',
        saving ? 'dc-btn-save--saving' : '',
    ].filter(Boolean).join(' ')

    const nomeCompleto = `${form.nome || 'Usuário'} ${form.sobrenome || ''}`.trim()
    const iniciais = [form.nome, form.sobrenome].filter(Boolean).map(parte => parte.trim()[0] || '').join('').toUpperCase() || 'A'

    return (
        <div className={`dc-wrap${embedded ? ' dc-wrap--embedded' : ''}`}>

            <div className="dc-page">
                {loading && <p role="status">Carregando seus dados...</p>}
                {saveError && <p role="alert" className="dc-profile-save-error">{saveError}</p>}

                <header className="dc-header">
                        <div className="dc-header-info">
                            <h1>Dados da conta</h1>
                            <p>Mantenha seu perfil e suas informações de saúde atualizados.</p>
                            {dirty && <span className="dc-dirty-badge">● Alterações não salvas</span>}
                        </div>
                        <div className="dc-profile-summary">
                            <span className="dc-profile-avatar" aria-hidden="true">{iniciais}</span>
                            <strong>{nomeCompleto}</strong>
                            <span className="dc-profile-role">Atleta</span>
                        </div>
                </header>

                <div className="dc-grid" inert={loading || saving || !profileLoaded}>

                    <div className="dc-section dc-section--accent dc-section--perfil">
                        <div className="dc-section-title">
                            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="#c0392b" strokeWidth="1.4">
                                <circle cx="8" cy="5.5" r="3" />
                                <path d="M2 14.5c0-3.3 2.7-6 6-6s6 2.7 6 6" />
                            </svg>
                            Perfil básico
                        </div>
                        <div className="dc-row2">
                            <div className="dc-field">
                                <label>Nome</label>
                                <input type="text" value={form.nome} placeholder="Seu nome" onChange={e => update('nome', e.target.value)} />
                            </div>
                            <div className="dc-field">
                                <label>Sobrenome</label>
                                <input type="text" value={form.sobrenome} placeholder="Sobrenome" onChange={e => update('sobrenome', e.target.value)} />
                            </div>
                            <div className="dc-field">
                                <label>Idade</label>
                                <input type="number" value={form.idade} placeholder="28" onChange={e => update('idade', e.target.value)} />
                            </div>
                            <div className="dc-field">
                                <label>Sexo biológico</label>
                                <select value={form.sexo} onChange={e => update('sexo', e.target.value)}>
                                    <option value="">Selecionar</option>
                                    <option value="Masculino">Masculino</option>
                                    <option value="Feminino">Feminino</option>
                                </select>
                            </div>
                            <div className="dc-field">
                                <label>Peso (kg)</label>
                                <input type="number" value={form.peso} placeholder="85" onChange={e => update('peso', e.target.value)} />
                            </div>
                            <div className="dc-field">
                                <label>Altura (cm)</label>
                                <input type="number" value={form.altura} placeholder="178" onChange={e => update('altura', e.target.value)} />
                            </div>
                        </div>
                    </div>

                    {/* Ciclo atual — 2 colunas */}
                    <div className="dc-section dc-section--ciclo">
                        <div className="dc-section-title">
                            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="#c0392b" strokeWidth="1.4">
                                <circle cx="8" cy="8" r="6" />
                                <path d="M8 5v3.5l2 2" />
                            </svg>
                            Ciclo atual
                        </div>
                        <div className="dc-field">
                            <label>Status do ciclo</label>
                            <RadioGroup
                                value={form.cicloAtivo}
                                onChange={v => update('cicloAtivo', v)}
                                options={[
                                    { val: 'sim', label: 'Sim, estou em ciclo ativo' },
                                    { val: 'off', label: 'Não, estou em off' },
                                    { val: 'nunca', label: 'Nunca usei' },
                                ]}
                            />
                        </div>
                        {form.cicloAtivo !== 'nunca' && (
                            <div className="dc-field">
                                <label>Tempo de uso</label>
                                <select value={form.tempoUso} onChange={e => update('tempoUso', e.target.value)}>
                                    <option value="">Selecionar</option>
                                    <option>Menos de 3 meses</option>
                                    <option>3–6 meses</option>
                                    <option>6–12 meses</option>
                                    <option>Mais de 12 meses</option>
                                </select>
                            </div>
                        )}
                    </div>

                    {/* Compostos — linha inteira */}
                    {form.cicloAtivo !== 'nunca' && (
                        <div className="dc-section dc-section--compostos">
                            <div className="dc-section-title">
                                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="#c0392b" strokeWidth="1.4">
                                    <path d="M6 2v4L3 12h10L10 6V2" />
                                    <path d="M6 2h4" />
                                </svg>
                                Compostos utilizados
                            </div>
                            <p className="dc-section-description">Informe os compostos e a dosagem semanal.</p>

                            <div className="dc-compost-block">
                                {sugestoesDisponiveis.length > 0 && (
                                    <div className="dc-tags">
                                        {sugestoesDisponiveis.map(c => (
                                            <div
                                                key={c}
                                                className="dc-tag"
                                                onClick={() => adicionarComposto(c)}
                                            >
                                                + {c}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="dc-compost-list">
                                    {form.compostos.length === 0 && (
                                        <div className="dc-compost-empty">
                                            Nenhum composto adicionado ainda.
                                        </div>
                                    )}

                                    {form.compostos.map(c => (
                                        <div key={c.nome} className="dc-compost-row">
                                            <span className="dc-compost-name">{c.nome}</span>

                                            <div className="dc-compost-mg">
                                                <input
                                                    type="number"
                                                    placeholder="mg"
                                                    value={c.dosagem}
                                                    onChange={e =>
                                                        atualizarDosagemComposto(c.nome, e.target.value)
                                                    }
                                                />
                                                <span>mg/semana</span>
                                            </div>

                                            <button
                                                type="button"
                                                className="dc-compost-remove"
                                                onClick={() => removerComposto(c.nome)}
                                                aria-label={`Remover ${c.nome}`}
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                <div className="dc-compost-custom">
                                    <input
                                        type="text"
                                        placeholder="Outro composto (ex: Primobolan)"
                                        aria-label="Outro composto"
                                        value={novoComposto}
                                        onChange={e => setNovoComposto(e.target.value)}
                                        onKeyDown={handleCustomKeyDown}
                                    />
                                    <button
                                        type="button"
                                        className="dc-compost-custom-btn"
                                        onClick={handleAdicionarCustom}
                                    >
                                        + Adicionar
                                    </button>
                                </div>

                                <div className="dc-tag-count">
                                    {form.compostos.length === 0
                                        ? 'Nenhum composto selecionado'
                                        : `${form.compostos.length} composto${form.compostos.length > 1 ? 's' : ''} selecionado${form.compostos.length > 1 ? 's' : ''}`}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Exames — 2 colunas */}
                    <div className="dc-section dc-section--exames">
                        <div className="dc-section-title">
                            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="#c0392b" strokeWidth="1.4">
                                <path d="M4 2h8a1 1 0 011 1v10a1 1 0 01-1 1H4a1 1 0 01-1-1V3a1 1 0 011-1z" />
                                <path d="M6 6h4M6 8.5h4M6 11h2" />
                            </svg>
                            Exames laboratoriais
                        </div>
                        <div className="dc-field">
                            <label>Já realizou exames?</label>
                            <RadioGroup
                                value={form.fezeExames}
                                onChange={v => update('fezeExames', v)}
                                options={[
                                    { val: 'recentes', label: 'Sim, recentes (menos de 6 meses)' },
                                    { val: 'antigos', label: 'Sim, mas antigos (mais de 6 meses)' },
                                    { val: 'nunca', label: 'Nunca fiz' },
                                ]}
                            />
                        </div>

                        {form.fezeExames !== 'nunca' && (
                            <div className="dc-field">
                                <label>Data do último exame</label>
                                <input
                                    type="date"
                                    value={form.dataUltimoExame}
                                    onChange={e => update('dataUltimoExame', e.target.value)}
                                />
                            </div>
                        )}
                    </div>

                    {/* Condições pré-existentes — 2 colunas */}
                    <div className="dc-section dc-section--condicoes">
                        <div className="dc-section-title">
                            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="#c0392b" strokeWidth="1.4">
                                <circle cx="8" cy="8" r="6" />
                                <path d="M8 5v6M5 8h6" />
                            </svg>
                            Condições pré-existentes
                        </div>
                        <CheckGroup options={CONDICOES} value={form.condicoes} onChange={v => update('condicoes', v)} />
                    </div>

                    {/* Save bar — linha inteira */}
                    <div className="dc-save-bar dc-full">
                        <div className="dc-save-info">
                            Última atualização:{' '}
                            <span>{form.ultimaAtualizacao || 'Ainda não atualizado'}</span>
                        </div>
                        <div className="dc-save-actions">
                            <button type="button" className="dc-btn-discard" onClick={handleDiscard} disabled={!dirty || saving}>
                                Cancelar
                            </button>
                            <button className={saveBtnClass} onClick={handleSave} disabled={!dirty || saving}>
                                <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="m4 10 4 4 8-8" /></svg>
                                {saving ? 'Salvando…' : 'Salvar alterações'}
                            </button>
                        </div>
                    </div>

                </div>
            </div>

            <Toast msg={toast.msg} show={toast.show} warn={toast.warn} />
        </div>
    )
}
