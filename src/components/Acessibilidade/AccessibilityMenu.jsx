import { useEffect, useId, useRef, useState } from 'react';
import AudioReader from './LeitorDeAudio/AudioReader';
import Acessibilidade from '../../assets/Acessibilidade.png';
import './AccessibilityMenu.css';
import { useTranslation } from '../../context/LanguageContext';

const RETRACT_DELAY = 8000;
const T = {
  pt: { language: 'pt', reader: 'Leitor de Tela', accessibility: 'Acessibilidade', options: 'Opções de acessibilidade', retract: 'Recolher', retractLabel: 'Recolher botão de acessibilidade', show: 'Mostrar opções de acessibilidade', close: 'Fechar menu de acessibilidade', open: 'Abrir menu de acessibilidade' },
  en: { language: 'en', reader: 'Screen Reader', accessibility: 'Accessibility', options: 'Accessibility options', retract: 'Hide', retractLabel: 'Hide accessibility button', show: 'Show accessibility options', close: 'Close accessibility menu', open: 'Open accessibility menu' },
};

const AccessibilityMenu = () => {
  const t = useTranslation(T, 'AccessibilityMenu.T');
  const [isOpen, setIsOpen] = useState(false);
  const [isRetracted, setIsRetracted] = useState(false);
  const [pointerWithin, setPointerWithin] = useState(false);
  const [focusWithin, setFocusWithin] = useState(false);
  const [audioAtivo, setAudioAtivo] = useState(false);
  const triggerRef = useRef(null);
  const optionsId = useId();

  useEffect(() => {
    if (isRetracted || isOpen || pointerWithin || focusWithin || audioAtivo) return;
    const timer = window.setTimeout(() => setIsRetracted(true), RETRACT_DELAY);
    return () => window.clearTimeout(timer);
  }, [isRetracted, isOpen, pointerWithin, focusWithin, audioAtivo]);

  const recolher = () => {
    setIsOpen(false);
    setIsRetracted(true);
    triggerRef.current?.focus();
  };

  const abrirVLibras = () => {
    window.VLibrasWidget?.initBtn?.click();
    setIsOpen(false);
  };

  const abrirUserWay = () => {
    if (window.UserWay) window.UserWay.widgetOpen();
    setIsOpen(false);
  };

  const items = [
    { label: 'VLibras', icon: '👋', color: '#3a86ff', onClick: abrirVLibras },
    { label: t.reader, icon: '🔊', color: '#06d6a0', onClick: () => { setAudioAtivo(true); setIsOpen(false); } },
    { label: t.accessibility, icon: '👤', color: '#f77f00', onClick: abrirUserWay },
  ];

  return (
    <>
      {audioAtivo && <AudioReader key={t.language} onClose={() => setAudioAtivo(false)} />}
      <div
        className={`accessibility-menu${isRetracted ? ' accessibility-menu--retracted' : ''}`}
        onPointerEnter={() => setPointerWithin(true)}
        onPointerLeave={() => setPointerWithin(false)}
        onFocusCapture={() => setFocusWithin(true)}
        onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocusWithin(false); }}
        onKeyDown={event => { if (event.key === 'Escape') { event.preventDefault(); recolher(); } }}
      >
        <div id={optionsId} className="accessibility-menu__options" hidden={!isOpen} role="group" aria-label={t.options}>
          {items.map(item => (
            <div className="accessibility-menu__item" key={item.label}>
              <span className="accessibility-menu__label">{item.label}</span>
              <button type="button" onClick={item.onClick} aria-label={item.label} className="accessibility-menu__option" style={{ '--option-color': item.color }}>
                <span aria-hidden="true">{item.icon}</span>
              </button>
            </div>
          ))}
        </div>
        {!isRetracted && <button type="button" className="accessibility-menu__retract" onClick={recolher} aria-label={t.retractLabel}>{t.retract} <span aria-hidden="true">›</span></button>}
        <button
          ref={triggerRef}
          type="button"
          onClick={() => {
            if (isRetracted) { setIsRetracted(false); setIsOpen(true); }
            else setIsOpen(previous => !previous);
          }}
          aria-label={isRetracted ? t.show : isOpen ? t.close : t.open}
          aria-expanded={isOpen}
          aria-controls={optionsId}
          title={isRetracted ? t.show : t.options}
          className="accessibility-menu__trigger"
        >
          {isRetracted ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="13" cy="4" r="2" /><path d="M6 8h14M13 8v6m0 0-4 7m4-7 4 7M4 12l-2 2 2 2" /></svg>
          ) : isOpen ? <span className="accessibility-menu__close" aria-hidden="true">✕</span> : <img src={Acessibilidade} alt="" className="accessibility-menu__icon" />}
        </button>
      </div>
    </>
  );
};

export default AccessibilityMenu;
