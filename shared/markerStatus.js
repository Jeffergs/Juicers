export function markerStatus(marker, value) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return 'ok';
  if (marker.reverse) {
    if (value <= marker.risk) return 'risco';
    if (value <= marker.attention) return 'atencao';
  } else {
    if (value >= marker.risk) return 'risco';
    if (value >= marker.attention) return 'atencao';
  }
  return 'ok';
}
