import { MARKERS, RULES_VERSION } from '../../../shared/markerCatalog.js';
import { markerStatus } from '../../../shared/markerStatus.js';

export class ExamValidationError extends Error { constructor(message) { super(message); this.status = 400; } }
const catalog = new Map(MARKERS.flatMap(marker => [marker.key, ...(marker.aliases || [])].map(key => [key, marker])));

export function validateExamDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(Date.parse(value)) || new Date(value).toISOString().slice(0, 10) !== value || value < '1900-01-01' || value > new Date().toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' })) {
    throw new ExamValidationError('Informe uma data de coleta válida, até hoje (AAAA-MM-DD).');
  }
  return value;
}

export function validateMarkers(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input) || !Object.keys(input).length || Object.keys(input).length > 50) throw new ExamValidationError('Informe pelo menos um indicador válido.');
  const markers = {};
  for (const [key, raw] of Object.entries(input)) {
    const marker = catalog.get(key);
    if (!marker) throw new ExamValidationError(`Indicador não reconhecido: ${key}.`);
    // API accepts numbers or plain decimal strings; units must match the catalog explicitly.
    const measurement = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : { value: raw };
    if (Object.keys(measurement).some(field => !['value', 'unit'].includes(field))) throw new ExamValidationError(`Formato inválido para ${marker.name}.`);
    if (measurement.unit !== undefined && measurement.unit !== marker.unit) throw new ExamValidationError(`Use ${marker.unit} para ${marker.name}.`);
    const value = typeof measurement.value === 'number' ? measurement.value
      : typeof measurement.value === 'string' && /^\d+(?:[.,]\d+)?$/.test(measurement.value.trim()) ? Number(measurement.value.trim().replace(',', '.')) : NaN;
    if (!Number.isFinite(value) || value < 0 || value > 1e9 || (marker.unit === '%' && value > 100)) throw new ExamValidationError(`Valor inválido para ${marker.name} (${marker.unit}).`);
    if (Object.hasOwn(markers, marker.key) && markers[marker.key] !== value) throw new ExamValidationError(`Valores conflitantes para ${marker.name}.`);
    markers[marker.key] = value;
  }
  return markers;
}

export function classifyMarkers(markers) {
  let riskLevel = 'normal';
  const alerts = [];
  for (const marker of MARKERS) {
    if (!Object.hasOwn(markers, marker.key)) continue;
    const status = markerStatus(marker, markers[marker.key]);
    if (status === 'risco') riskLevel = 'high';
    else if (status === 'atencao' && riskLevel !== 'high') riskLevel = 'attention';
    if (status !== 'ok') alerts.push(`${marker.name}: ${status === 'risco' ? 'fora da faixa de acompanhamento' : 'atenção'} (${markers[marker.key]} ${marker.unit}).`);
  }
  return { riskLevel, alerts, rulesVersion: RULES_VERSION };
}

export function validateExamPayload(body) {
  const examDate = validateExamDate(body?.examDate);
  const markers = validateMarkers(body?.markers);
  return { examDate, markers, ...classifyMarkers(markers) };
}
