/**
 * markers.js — fonte única do catálogo de marcadores e da montagem da série.
 *
 * Antes deste arquivo, a lista de MARKERS estava duplicada em três lugares
 * (hooks/useClinicalState.js, pages/PerfilAtleta.jsx, pages/PerfilAtletaMedico.jsx)
 * com pequenas diferenças entre as cópias. Agora todos importam daqui.
 */

export const CAT_ORDER = [
  'Cardiovascular',
  'Endócrino',
  'Renal',
  'Hematológico',
  'Micronutrientes',
]

import { MARKERS } from '../../shared/markerCatalog.js'
import { markerStatus } from '../../shared/markerStatus.js'
export { MARKERS }

const SUMMARY_KEYS = ['ldl', 'hdl', 'creatinine', 'hematocrit']

/**
 * Converte 'YYYY-MM-DD' em Date LOCAL.
 *
 * new Date('2026-04-11') é interpretado como UTC meia-noite; no fuso do Brasil
 * isso vira 10/abr 21h e a data exibida fica um dia atrasada. Construindo a
 * data pelos componentes, o dia exibido é sempre o dia da coleta.
 */
export function parseExamDate(value) {
  if (!value) return null

  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value

  const iso = String(value).slice(0, 10)
  const match = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/)

  if (match) {
    return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
  }

  const fallback = new Date(value)

  return Number.isNaN(fallback.getTime()) ? null : fallback
}

export function formatExamDate(value) {
  const date = parseExamDate(value)

  if (!date) return typeof value === 'string' ? value : '—'

  return date
    .toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
    .replace('.', '')
}

/**
 * Converte o valor de um marcador em número.
 *
 * Valores podem chegar como string do parser de PDF ou de digitação manual:
 * "58", "58,2" (vírgula decimal brasileira), " 1.31 ", "53,6 %". Devolver NaN
 * nesses casos fazia o marcador inteiro ser descartado e o dashboard ficar
 * vazio sem explicação.
 */
export function toNumber(raw) {
  if (raw === null || raw === undefined || raw === '') return null
  if (typeof raw === 'number') return Number.isFinite(raw) ? raw : null

  const texto = String(raw).trim().replace(/\s/g, '')

  // Mantém só dígitos, separadores e sinal — descarta unidade colada ("53,6%")
  const limpo = texto.replace(/[^\d.,-]/g, '')

  if (!limpo) return null

  let normalizado = limpo

  if (limpo.includes(',') && limpo.includes('.')) {
    // "1.234,5" -> milhar com ponto e decimal com vírgula
    normalizado = limpo.replace(/\./g, '').replace(',', '.')
  } else if (limpo.includes(',')) {
    normalizado = limpo.replace(',', '.')
  } else if (/^-?\d{1,3}(\.\d{3})+$/.test(limpo)) {
    // "1.234" -> ponto como separador de milhar
    normalizado = limpo.replace(/\./g, '')
  }
  // Qualquer outro caso com ponto é decimal: "0.86" continua 0.86.

  const n = Number(normalizado)

  return Number.isFinite(n) ? n : null
}

export function getMarkerValue(markers = {}, marker) {
  const keys = [marker.key, ...(marker.aliases || [])]

  for (const key of keys) {
    const value = markers?.[key]

    if (value !== undefined && value !== null && value !== '') {
      return value
    }
  }

  return null
}

export function getMarkerStatus(marker, value) {
  if (!marker) return 'ok'

  const numberValue = toNumber(value)

  if (numberValue === null) return 'ok'

  return markerStatus(marker, numberValue)
}

/** Nível de risco do exame inteiro, derivado dos marcadores. */
export function getExamRiskLevel(markers = {}) {
  const estados = MARKERS
    .map(marker => getMarkerStatus(marker, getMarkerValue(markers, marker)))

  if (estados.includes('risco')) return 'high'
  if (estados.includes('atencao')) return 'attention'

  return 'normal'
}

/**
 * Variação do último ponto em relação ao anterior.
 * Devolve null quando só existe uma medição — é o que evita o "▲ 0,0%"
 * que hoje aparece em todos os cards.
 */
export function getMarkerChange(points = [], marker) {
  if (points.length < 2) return null

  const atual = points[points.length - 1].value
  const anterior = points[points.length - 2].value

  if (anterior === 0) return null

  const abs = atual - anterior
  const pct = (abs / Math.abs(anterior)) * 100
  const estavel = Math.abs(pct) < 1
  const melhorou = marker?.reverse ? abs > 0 : abs < 0

  return {
    abs,
    pct,
    trend: estavel ? 'estavel' : melhorou ? 'melhorou' : 'piorou',
  }
}

/**
 * Monta os dados do dashboard a partir dos exames crus da API.
 *
 * Cada marcador ganha `points` — pares { t, value, dateLabel } com o timestamp
 * real da coleta. Antes só existia `values`, um array filtrado que perdia a
 * associação com a data: se um marcador faltasse num exame do meio, o gráfico
 * desenhava os valores contra as datas erradas.
 *
 * `values` continua existindo para o SparklineChart, que não precisa de data.
 */
export function buildDashboardData(exams = []) {
  if (!exams.length) {
    return { summary: [], alerts: [], categories: [], examDates: [], exams: [], unknownKeys: [] }
  }

  const sorted = [...exams].sort(
    (a, b) => (parseExamDate(a.examDate)?.getTime() ?? 0) - (parseExamDate(b.examDate)?.getTime() ?? 0)
  )

  const examDates = sorted.map(exam => formatExamDate(exam.examDate))
  const categoriesMap = {}

  // Chaves que apareceram nos exames mas que o catálogo não reconhece.
  // Sem isso, um exame com nomes de campo diferentes some do dashboard
  // sem nenhuma explicação na tela.
  const conhecidas = new Set(MARKERS.flatMap(m => [m.key, ...(m.aliases || [])]))
  const unknownKeys = [...new Set(
    sorted.flatMap(exam => Object.keys(exam.markers || {}))
  )].filter(k => !conhecidas.has(k))

  MARKERS.forEach(marker => {
    const points = sorted
      .map(exam => {
        const value = toNumber(getMarkerValue(exam.markers, marker))

        if (value === null) return null

        const date = parseExamDate(exam.examDate)

        return {
          t: date ? date.getTime() : 0,
          value,
          dateLabel: formatExamDate(exam.examDate),
          examId: exam._id,
        }
      })
      .filter(Boolean)

    if (!points.length) return

    const last = points[points.length - 1].value
    const status = getMarkerStatus(marker, last)

    if (!categoriesMap[marker.category]) {
      categoriesMap[marker.category] = []
    }

    categoriesMap[marker.category].push({
      id: marker.id,
      key: marker.key,
      cat: marker.category,
      name: marker.name,
      unit: marker.unit,
      ref: marker.ref,
      reverse: !!marker.reverse,
      attention: marker.attention,
      risk: marker.risk,
      points,
      values: points.map(p => p.value),
      display: last,
      status,
      change: getMarkerChange(points, marker),
    })
  })

  const categories = CAT_ORDER
    .map(name => ({ name, markers: categoriesMap[name] || [] }))
    .filter(category => category.markers.length > 0)

  const todosMarcadores = categories.flatMap(category => category.markers)

  const summary = SUMMARY_KEYS
    .map(key => todosMarcadores.find(marker => marker.key === key))
    .filter(Boolean)
    .map(marker => ({
      name: marker.name,
      value: marker.display,
      unit: marker.unit,
      status: marker.status,
    }))

  const lastExam = sorted[sorted.length - 1]

  const generatedAlerts = todosMarcadores
    .filter(marker => marker.status === 'risco' || marker.status === 'atencao')
    .map(marker => ({
      level: marker.status,
      title: marker.status === 'risco'
        ? `${marker.name} em risco alto`
        : `${marker.name} em atenção`,
      desc: `${marker.name}: ${marker.display} ${marker.unit} no exame de ${formatExamDate(lastExam.examDate)}.`,
    }))

  const backendAlerts = (lastExam.alerts || []).map(alert => ({
    level: lastExam.riskLevel === 'high' ? 'risco' : 'atencao',
    title: alert,
    desc: `Alerta registrado no exame de ${formatExamDate(lastExam.examDate)}.`,
  }))

  return {
    summary,
    alerts: generatedAlerts.length ? generatedAlerts : backendAlerts,
    categories,
    examDates,
    exams: sorted,
    unknownKeys,
  }
}
