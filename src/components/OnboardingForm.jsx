import { useState } from 'react'
import { acceptDoctorInvite, savePatientProfile } from '../services/api'
import '../style/onboarding.css'
import logoIcon from '../assets/juicers.png'

const COMPOSTOS = [
    'Testosterona Enantato', 'Testosterona Cipionato', 'Trembolona',
    'Oxandrolona', 'Nandrolona', 'Boldenona', 'Stanozolol', 'Masteron',
]

const CONDICOES = [
    'Hipertensão', 'Colesterol elevado', 'Problemas hepáticos',
    'Histórico cardíaco familiar', 'Nenhuma das anteriores',
]

function separarNome(nomeCompleto) {
    const partes = nomeCompleto.trim().split(' ')
    const nome = partes[0] || ''
    const sobrenome = partes.slice(1).join(' ')

    return { nome, sobrenome }
}

function Obrigatorio() {
    return <span className="ob-required" title="Campo obrigatório">*</span>
}

export default function OnboardingForm({
    nomeCompleto = '',
    emailUsuario = '',
    conviteToken = '',
    onBack,
    onFinish,
}) {
    const nomeSeparado = separarNome(nomeCompleto)

    const [etapa, setEtapa] = useState(1)
    const [erro, setErro] = useState('')
    const [errors, setErrors] = useState({})
    const [salvando, setSalvando] = useState(false)
    const [novoComposto, setNovoComposto] = useState('')

    const [form, setForm] = useState({
        nome: nomeSeparado.nome,
        sobrenome: nomeSeparado.sobrenome,
        idade: '',
        sexo: '',
        peso: '',
        altura: '',
        cicloAtivo: 'sim',
        compostos: [],
        tempoUso: '',
        fezeExames: 'recentes',
        dataUltimoExame: '',
        condicoes: [],
    })

    const update = (key, val) => {
        setErro('')
        setErrors(prev => ({ ...prev, [key]: '' }))
        setForm(p => ({ ...p, [key]: val }))
    }

    const toggleArray = (key, val) => {
        setErro('')
        setErrors(prev => ({ ...prev, [key]: '' }))

        setForm(p => ({
            ...p,
            [key]: p[key].includes(val)
                ? p[key].filter(v => v !== val)
                : [...p[key], val],
        }))
    }

    const nomesSelecionados = form.compostos.map(c => c.nome)
    const sugestoesDisponiveis = COMPOSTOS.filter(c => !nomesSelecionados.includes(c))

    const adicionarComposto = nomeBruto => {
        const nome = nomeBruto.trim()
        if (!nome) return
        if (nomesSelecionados.some(n => n.toLowerCase() === nome.toLowerCase())) return

        setErro('')
        setErrors(prev => ({ ...prev, compostos: '' }))
        setForm(p => ({
            ...p,
            compostos: [...p.compostos, { nome, dosagem: '' }],
        }))
    }

    const removerComposto = nome => {
        setForm(p => ({
            ...p,
            compostos: p.compostos.filter(c => c.nome !== nome),
        }))
    }

    const atualizarDosagemComposto = (nome, val) => {
        setErro('')
        setErrors(prev => ({ ...prev, compostos: '' }))

        setForm(p => ({
            ...p,
            compostos: p.compostos.map(c =>
                c.nome === nome ? { ...c, dosagem: val } : c
            ),
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

    const validarEtapa1 = () => {
        const novosErros = {}

        if (!form.nome.trim()) novosErros.nome = 'Preencha o nome.'
        if (!form.sobrenome.trim()) novosErros.sobrenome = 'Preencha o sobrenome.'

        if (!form.idade) {
            novosErros.idade = 'Preencha a idade.'
        } else if (Number(form.idade) <= 0) {
            novosErros.idade = 'Informe uma idade válida.'
        }

        if (!form.sexo) novosErros.sexo = 'Selecione o sexo biológico.'

        if (!form.peso) {
            novosErros.peso = 'Preencha o peso.'
        } else if (Number(form.peso) <= 0) {
            novosErros.peso = 'Informe um peso válido.'
        }

        if (!form.altura) {
            novosErros.altura = 'Preencha a altura.'
        } else if (Number(form.altura) <= 0) {
            novosErros.altura = 'Informe uma altura válida.'
        }

        setErrors(novosErros)

        if (Object.keys(novosErros).length > 0) {
            setErro('Preencha os campos obrigatórios destacados.')
            return false
        }

        return true
    }

    const validarEtapa2 = () => {
        const novosErros = {}

        if (!form.cicloAtivo) {
            novosErros.cicloAtivo = 'Selecione o status do ciclo.'
        }

        if (form.cicloAtivo !== 'nunca') {
            if (form.compostos.length === 0) {
                novosErros.compostos = 'Selecione ou adicione pelo menos um composto.'
            } else if (form.compostos.some(c => !c.dosagem || Number(c.dosagem) <= 0)) {
                novosErros.compostos = 'Informe a dosagem semanal (mg) de cada composto.'
            }

            if (!form.tempoUso) {
                novosErros.tempoUso = 'Selecione o tempo de uso.'
            }
        }

        setErrors(novosErros)

        if (Object.keys(novosErros).length > 0) {
            setErro('Preencha os campos obrigatórios destacados.')
            return false
        }

        return true
    }

    const validarEtapa3 = () => {
        const novosErros = {}

        if (!form.fezeExames) {
            novosErros.fezeExames = 'Informe se você já fez exames laboratoriais.'
        }

        if (form.fezeExames !== 'nunca' && !form.dataUltimoExame) {
            novosErros.dataUltimoExame = 'Informe a data do último exame.'
        }

        if (form.condicoes.length === 0) {
            novosErros.condicoes = 'Selecione pelo menos uma condição.'
        }

        setErrors(novosErros)

        if (Object.keys(novosErros).length > 0) {
            setErro('Preencha os campos obrigatórios destacados.')
            return false
        }

        return true
    }

    const irParaEtapa1 = () => {
        setErro('')
        setErrors({})
        setEtapa(1)
    }

    const irParaEtapa2 = () => {
        if (!validarEtapa1()) return
        setErro('')
        setErrors({})
        setEtapa(2)
    }

    const irParaEtapa3 = () => {
        if (!validarEtapa2()) return
        setErro('')
        setErrors({})
        setEtapa(3)
    }

    const finalizarOnboarding = async () => {
        if (!validarEtapa3()) return

        try {
            setSalvando(true)
            setErro('')

            const sexoMap = {
                Masculino: 'male',
                Feminino: 'female',
            }

            const dosagemSemanalTotal = form.compostos.reduce(
                (soma, c) => soma + (Number(c.dosagem) || 0),
                0
            )

            const dadosParaBanco = {
                birthDate: '',
                age: Number(form.idade),
                lastName: form.sobrenome,
                biologicalSex: sexoMap[form.sexo] || 'other',
                weight: Number(form.peso),
                height: Number(form.altura) / 100,
                cycleStatus: form.cicloAtivo,
                weeklyDosage: dosagemSemanalTotal,
                cycleTime: form.tempoUso,
                examStatus: form.fezeExames,
                lastExamDate: form.dataUltimoExame,
                substances: form.compostos.map(c => c.nome),
                healthConditions: form.condicoes,
            }

            await savePatientProfile(dadosParaBanco)

            if (conviteToken) {
                await acceptDoctorInvite(conviteToken)
            }

            const dadosFormatados = {
                nome: form.nome,
                sobrenome: form.sobrenome,
                idade: form.idade,
                sexo: form.sexo,
                peso: form.peso,
                altura: form.altura,
                cicloAtivo: form.cicloAtivo,
                compostos: form.compostos,
                dosagem: dosagemSemanalTotal,
                tempoUso: form.tempoUso,
                fezeExames: form.fezeExames,
                dataUltimoExame: form.dataUltimoExame,
                condicoes: form.condicoes,
                email: emailUsuario,
                ultimaAtualizacao: new Date().toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                }),
            }

            localStorage.setItem(
                'dadosContaCicloRisco',
                JSON.stringify(dadosFormatados)
            )

            onFinish()
        } catch (error) {
            setErro(error.message || 'Erro ao salvar onboarding.')
        } finally {
            setSalvando(false)
        }
    }

    const progressos = {
        1: '33%',
        2: '66%',
        3: '100%',
    }

    return (
        <div className="ob-wrap">
            <div className="ob-left">
                <div className="ob-logo">
                    <img src={logoIcon} alt="Logo Juicer" className="ob-logo-img" />
                </div>

                <div className="ob-steps">
                    {[
                        { n: 1, label: 'Perfil básico', desc: 'Dados pessoais e físicos' },
                        { n: 2, label: 'Uso atual', desc: 'Ciclo, compostos e dosagem' },
                        { n: 3, label: 'Histórico', desc: 'Condições e exames anteriores' },
                    ].map((s, i) => (
                        <div key={s.n}>
                            <div className={`ob-step ${etapa === s.n ? 'active' : ''}`}>
                                <div
                                    className={`ob-step-num ${
                                        etapa > s.n
                                            ? 'done'
                                            : etapa === s.n
                                                ? 'current'
                                                : 'pending'
                                    }`}
                                >
                                    {etapa > s.n ? '✓' : s.n}
                                </div>

                                <div>
                                    <div
                                        className={`ob-step-label ${
                                            etapa === s.n
                                                ? 'active'
                                                : etapa > s.n
                                                    ? 'done'
                                                    : ''
                                        }`}
                                    >
                                        {s.label}
                                    </div>

                                    <div className="ob-step-desc">
                                        {s.desc}
                                    </div>
                                </div>
                            </div>

                            {i < 2 && <div className="ob-connector" />}
                        </div>
                    ))}
                </div>

                <div className="ob-footer">
                    Seus dados são usados apenas para monitoramento de saúde pessoal.
                    {' '}Apenas você e, caso haja um médico vinculado à sua conta, esse médico terão acesso aos seus dados.
                    {' '}Não compartilhamos com outros terceiros.
                </div>
            </div>

            <div className="ob-right">
                <div className="ob-form-wrap">
                    <div className="ob-progress">
                        <div
                            className="ob-progress-bar"
                            style={{ width: progressos[etapa] }}
                        />
                    </div>

                    {erro && (
                        <div className="ob-error">
                            {erro}
                        </div>
                    )}

                    <p className="ob-required-hint"><Obrigatorio /> Campos obrigatórios</p>

                    {etapa === 1 && (
                        <div>
                            <div className="ob-tag">Etapa 1 de 3</div>

                            <h1 className="ob-title">
                                Conta pra gente sobre você
                            </h1>

                            <p className="ob-sub">
                                Essas informações ajudam a calibrar sua análise de risco com mais precisão.
                            </p>

                            <div className="ob-row">
                                <div className={`ob-field ${errors.nome ? 'ob-field-error' : ''}`}>
                                    <label>Nome <Obrigatorio /></label>
                                    <input
                                        type="text"
                                        placeholder="Seu nome"
                                        value={form.nome}
                                        onChange={e => update('nome', e.target.value)}
                                    />
                                    {errors.nome && <small className="ob-error-text">{errors.nome}</small>}
                                </div>

                                <div className={`ob-field ${errors.sobrenome ? 'ob-field-error' : ''}`}>
                                    <label>Sobrenome <Obrigatorio /></label>
                                    <input
                                        type="text"
                                        placeholder="Sobrenome"
                                        value={form.sobrenome}
                                        onChange={e => update('sobrenome', e.target.value)}
                                    />
                                    {errors.sobrenome && <small className="ob-error-text">{errors.sobrenome}</small>}
                                </div>
                            </div>

                            <div className="ob-row">
                                <div className={`ob-field ${errors.idade ? 'ob-field-error' : ''}`}>
                                    <label>Idade <Obrigatorio /></label>
                                    <input
                                        type="number"
                                        placeholder="28"
                                        value={form.idade}
                                        onChange={e => update('idade', e.target.value)}
                                    />
                                    {errors.idade && <small className="ob-error-text">{errors.idade}</small>}
                                </div>

                                <div className={`ob-field ${errors.sexo ? 'ob-field-error' : ''}`}>
                                    <label>Sexo biológico <Obrigatorio /></label>
                                    <select
                                        value={form.sexo}
                                        onChange={e => update('sexo', e.target.value)}
                                    >
                                        <option value="">Selecionar</option>
                                        <option value="Masculino">Masculino</option>
                                        <option value="Feminino">Feminino</option>
                                    </select>
                                    {errors.sexo && <small className="ob-error-text">{errors.sexo}</small>}
                                </div>
                            </div>

                            <div className="ob-row">
                                <div className={`ob-field ${errors.peso ? 'ob-field-error' : ''}`}>
                                    <label>Peso (kg) <Obrigatorio /></label>
                                    <input
                                        type="number"
                                        placeholder="85"
                                        value={form.peso}
                                        onChange={e => update('peso', e.target.value)}
                                    />
                                    {errors.peso && <small className="ob-error-text">{errors.peso}</small>}
                                </div>

                                <div className={`ob-field ${errors.altura ? 'ob-field-error' : ''}`}>
                                    <label>Altura (cm) <Obrigatorio /></label>
                                    <input
                                        type="number"
                                        placeholder="178"
                                        value={form.altura}
                                        onChange={e => update('altura', e.target.value)}
                                    />
                                    {errors.altura && <small className="ob-error-text">{errors.altura}</small>}
                                </div>
                            </div>

                            <div className="ob-btn-row">
                                <button className="ob-btn-back" onClick={onBack}>
                                    ← Voltar ao cadastro
                                </button>

                                <button className="ob-btn-next" onClick={irParaEtapa2}>
                                    Continuar →
                                </button>
                            </div>
                        </div>
                    )}

                    {etapa === 2 && (
                        <div>
                            <div className="ob-tag">Etapa 2 de 3</div>

                            <h1 className="ob-title">
                                Uso atual de esteroides
                            </h1>

                            <p className="ob-sub">
                                Informações sobre seu ciclo atual ou mais recente.
                            </p>

                            <div className={`ob-field ${errors.cicloAtivo ? 'ob-field-error' : ''}`}>
                                <label>Está em ciclo atualmente? <Obrigatorio /></label>

                                <div className="ob-radio-group">
                                    {[
                                        { val: 'sim', label: 'Sim, estou em ciclo ativo' },
                                        { val: 'off', label: 'Não, estou em off' },
                                        { val: 'nunca', label: 'Nunca usei' },
                                    ].map(o => (
                                        <div
                                            key={o.val}
                                            className={`ob-radio-opt ${form.cicloAtivo === o.val ? 'selected' : ''}`}
                                            onClick={() => update('cicloAtivo', o.val)}
                                        >
                                            <div className="ob-radio-dot">
                                                {form.cicloAtivo === o.val && <div className="ob-radio-inner" />}
                                            </div>

                                            <span className="ob-radio-text">
                                                {o.label}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                {errors.cicloAtivo && <small className="ob-error-text">{errors.cicloAtivo}</small>}
                            </div>

                            {form.cicloAtivo !== 'nunca' && (
                                <>
                                    <div className={`ob-field ${errors.compostos ? 'ob-field-error' : ''}`}>
                                        <label>Compostos utilizados <Obrigatorio /></label>

                                        <div className="ob-compost-block">
                                            {sugestoesDisponiveis.length > 0 && (
                                                <div className="ob-tags">
                                                    {sugestoesDisponiveis.map(c => (
                                                        <div
                                                            key={c}
                                                            className="ob-tag-item"
                                                            onClick={() => adicionarComposto(c)}
                                                        >
                                                            + {c}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            <div className="ob-compost-custom">
                                                <input
                                                    type="text"
                                                    placeholder="Outro composto (ex: Primobolan)"
                                                    value={novoComposto}
                                                    onChange={e => setNovoComposto(e.target.value)}
                                                    onKeyDown={handleCustomKeyDown}
                                                />
                                                <button
                                                    type="button"
                                                    className="ob-compost-custom-btn"
                                                    onClick={handleAdicionarCustom}
                                                >
                                                    Adicionar
                                                </button>
                                            </div>

                                            <div className="ob-compost-list">
                                                {form.compostos.length === 0 && (
                                                    <div className="ob-compost-empty">
                                                        Nenhum composto adicionado ainda.
                                                    </div>
                                                )}

                                                {form.compostos.map(c => (
                                                    <div key={c.nome} className="ob-compost-row">
                                                        <span className="ob-compost-name">{c.nome}</span>

                                                        <div className="ob-compost-mg">
                                                            <input
                                                                type="number"
                                                                placeholder="mg"
                                                                aria-label={`Dosagem semanal de ${c.nome}`}
                                                                aria-required="true"
                                                                value={c.dosagem}
                                                                onChange={e =>
                                                                    atualizarDosagemComposto(c.nome, e.target.value)
                                                                }
                                                            />
                                                            <span>mg/sem <Obrigatorio /></span>
                                                        </div>

                                                        <button
                                                            type="button"
                                                            className="ob-compost-remove"
                                                            onClick={() => removerComposto(c.nome)}
                                                            aria-label={`Remover ${c.nome}`}
                                                        >
                                                            ×
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {errors.compostos && <small className="ob-error-text">{errors.compostos}</small>}
                                    </div>

                                    <div className={`ob-field ${errors.tempoUso ? 'ob-field-error' : ''}`}>
                                        <label>Tempo de uso <Obrigatorio /></label>

                                        <select
                                            value={form.tempoUso}
                                            onChange={e => update('tempoUso', e.target.value)}
                                        >
                                            <option value="">Selecionar</option>
                                            <option>Menos de 3 meses</option>
                                            <option>3–6 meses</option>
                                            <option>6–12 meses</option>
                                            <option>Mais de 12 meses</option>
                                        </select>

                                        {errors.tempoUso && <small className="ob-error-text">{errors.tempoUso}</small>}
                                    </div>
                                </>
                            )}

                            <div className="ob-btn-row">
                                <button className="ob-btn-back" onClick={irParaEtapa1}>
                                    ← Voltar
                                </button>

                                <button className="ob-btn-next" onClick={irParaEtapa3}>
                                    Continuar →
                                </button>
                            </div>
                        </div>
                    )}

                    {etapa === 3 && (
                        <div>
                            <div className="ob-tag">Etapa 3 de 3</div>

                            <h1 className="ob-title">
                                Histórico de saúde
                            </h1>

                            <p className="ob-sub">
                                Isso nos ajuda a identificar riscos pré-existentes e personalizar seus alertas.
                            </p>

                            <div className={`ob-field ${errors.fezeExames ? 'ob-field-error' : ''}`}>
                                <label>Já fez exames laboratoriais? <Obrigatorio /></label>

                                <div className="ob-radio-group">
                                    {[
                                        { val: 'recentes', label: 'Sim, tenho exames recentes (menos de 6 meses)' },
                                        { val: 'antigos', label: 'Sim, mas são antigos (mais de 6 meses)' },
                                        { val: 'nunca', label: 'Nunca fiz' },
                                    ].map(o => (
                                        <div
                                            key={o.val}
                                            className={`ob-radio-opt ${form.fezeExames === o.val ? 'selected' : ''}`}
                                            onClick={() => update('fezeExames', o.val)}
                                        >
                                            <div className="ob-radio-dot">
                                                {form.fezeExames === o.val && <div className="ob-radio-inner" />}
                                            </div>

                                            <span className="ob-radio-text">
                                                {o.label}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                {errors.fezeExames && <small className="ob-error-text">{errors.fezeExames}</small>}
                            </div>

                            {form.fezeExames !== 'nunca' && (
                                <div className={`ob-field ${errors.dataUltimoExame ? 'ob-field-error' : ''}`}>
                                    <label>Data do último exame <Obrigatorio /></label>

                                    <input
                                        type="date"
                                        value={form.dataUltimoExame}
                                        onChange={e => update('dataUltimoExame', e.target.value)}
                                    />

                                    {errors.dataUltimoExame && <small className="ob-error-text">{errors.dataUltimoExame}</small>}
                                </div>
                            )}

                            <div className={`ob-field ${errors.condicoes ? 'ob-field-error' : ''}`}>
                                <label>Condições pré-existentes <Obrigatorio /></label>

                                <div className="ob-check-group">
                                    {CONDICOES.map(c => (
                                        <div
                                            key={c}
                                            className={`ob-check-opt ${form.condicoes.includes(c) ? 'selected' : ''}`}
                                            onClick={() => toggleArray('condicoes', c)}
                                        >
                                            <div className="ob-check-box">
                                                {form.condicoes.includes(c) && <span>✓</span>}
                                            </div>

                                            <span className="ob-check-text">
                                                {c}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                {errors.condicoes && <small className="ob-error-text">{errors.condicoes}</small>}
                            </div>

                            <div className="ob-btn-row">
                                <button className="ob-btn-back" onClick={irParaEtapa2}>
                                    ← Voltar
                                </button>

                                <button
                                    className="ob-btn-next"
                                    onClick={finalizarOnboarding}
                                    disabled={salvando}
                                >
                                    {salvando ? 'Salvando...' : 'Acessar Dashboard →'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
