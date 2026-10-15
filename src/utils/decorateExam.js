/** Converte um status de exame em cores + rótulo para exibição. */
export function decorateExam(e, STATUS) {
  return {
    ...e,
    statusColor: STATUS.color[e.status] || '#3fb950',
    statusBg: STATUS.bg[e.status] || STATUS.bg.ok,
    statusBorder: STATUS.border[e.status] || STATUS.border.ok,
    statusLabel: e.status === 'ok' ? 'Normal' : STATUS.label[e.status],
  };
}