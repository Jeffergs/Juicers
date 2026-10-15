import React from 'react';

/**
 * AlertsGrid — alertas priorizados em grade, abaixo do painel de evolução.
 *
 * Antes era uma coluna lateral fixa ao lado do gráfico; virou uma grade de
 * cards (4 por linha, quebrando em mais linhas conforme a quantidade de
 * alertas) para não competir por espaço com o gráfico, que agora ocupa a
 * largura inteira.
 *
 * alerts: [{ level: 'risco'|'atencao', title, desc }]
 */
export default function AlertsGrid({ alerts = [] }) {
  return (
    <section className="ad-alerts" style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <h2 style={{ margin: 0, fontSize: 'var(--ad-heading-size, 12px)', fontWeight: 700, letterSpacing: 'var(--ad-heading-spacing, .08em)', textTransform: 'var(--ad-heading-case, uppercase)', color: 'var(--ad-text, #424242)' }}>
          Alertas ativos
        </h2>
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: alerts.length > 0 ? '#fff' : 'var(--ad-accent-text, #0d0d0d)',
            background: alerts.length > 0 ? 'var(--ad-alert-count-bg, #f04747)' : 'var(--ad-accent-soft, #e8f8f7)',
            borderRadius: 20,
            minWidth: 20,
            textAlign: 'center',
            padding: '1px 7px',
          }}
        >
          {alerts.length}
        </span>
      </div>

      {alerts.length > 0 ? (
        <div className="ad-alert-grid" style={{ display: 'grid', gridTemplateColumns: 'var(--ad-alert-columns, repeat(auto-fill,minmax(min(220px,100%),1fr)))', gap: 14 }}>
          {alerts.map((a, i) => {
            const color = a.level === 'risco' ? '#f04747' : '#e0a82e';
            return (
              <div
                key={i}
                className="ad-alert-card"
                style={{
                  '--alert-color': color,
                  background: 'var(--ad-surface, #ebebeb)',
                  border: '1px solid var(--ad-border, #d5d5d5)',
                  borderLeft: `3px solid ${color}`,
                  borderRadius: 'var(--ad-card-radius, 10px)',
                  padding: 'var(--ad-alert-padding, 13px 14px)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 5,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, flex: 'none' }} />
                  <span style={{ fontSize: 13, fontWeight: 650, color: 'var(--ad-text, #0f0f0f)' }}>{a.title}</span>
                </div>
                <p style={{ margin: 0, fontSize: 12, color: 'var(--ad-muted, #737373)', lineHeight: 1.6, paddingLeft: 16 }}>{a.desc}</p>
              </div>
            );
          })}
        </div>
      ) : (
        <div
          style={{
            background: 'var(--ad-surface, #ebebeb)',
            border: '1px solid var(--ad-border, #d5d5d5)',
            borderRadius: 'var(--ad-card-radius, 10px)',
            padding: 16,
            textAlign: 'center',
            fontSize: 12.5,
            color: '#3fb950',
          }}
        >
          Nenhum alerta ativo — paciente estável.
        </div>
      )}
    </section>
  );
}
