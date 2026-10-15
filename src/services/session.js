export const SESSION_EVENT = 'juicers-session';
let revision = 0;
let authenticated = false;
export const hasSession = () => authenticated;
export function rememberSession() { authenticated = true }
export const sessionRevision = () => revision;
export function clearLegacyData() {
  for (const key of ['tokenJuicers', 'usuarioLogadoJuicers', 'roleJuicers', 'userJuicers', 'dadosContaCicloRisco']) localStorage.removeItem(key);
}
export function notifySession(reason, user) {
  revision += 1;
  authenticated = Boolean(user);
  clearLegacyData();
  window.dispatchEvent(new CustomEvent(SESSION_EVENT, { detail: { reason, user } }));
}
