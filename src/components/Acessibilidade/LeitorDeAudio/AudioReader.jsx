import { useState, useEffect, useRef, useCallback } from "react";
import "./AudioReader.css";
import { useLanguage, useTranslation } from '../../../context/language';

const T = {
  pt: { title: 'Leitor de Tela', expand: 'Expandir', minimize: 'Minimizar', close: 'Fechar leitor', play: 'Ouvir página', resume: 'Continuar', pause: 'Pausar', stop: 'Parar' },
  en: { title: 'Screen Reader', expand: 'Expand', minimize: 'Minimize', close: 'Close reader', play: 'Listen to page', resume: 'Resume', pause: 'Pause', stop: 'Stop' },
};

const AudioReader = ({ onClose }) => {
  const { lang } = useLanguage();
  const t = useTranslation(T, 'AudioReader.T');
  const [isReading, setIsReading] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [progress, setProgress] = useState(0);
  const utteranceRef = useRef(null);
  const totalCharsRef = useRef(0);
  const lastHighlightedRef = useRef(null);
  const lastCharIndexRef = useRef(-1);

  const getReadableElements = useCallback(() => {
    const all = Array.from(
      document.querySelectorAll(
        "h1, h2, h3, h4, h5, h6, p, li, td, th, label, .accordion-item"
      )
    );
    return all.filter((el) => {
      if (el.closest(".audio-reader-widget")) return false;
      if (!el.classList.contains("accordion-item") && el.closest(".accordion-item")) return false;
      const text = el.textContent?.trim();
      if (!text || text.length < 2) return false;
      return true;
    });
  }, []);

  const buildTextAndMap = useCallback(() => {
    const elements = getReadableElements();
    const map = [];
    let fullText = "";

    elements.forEach((el) => {
      const toggle = el.querySelector("[data-bs-target]");
      if (toggle) {
        const targetId = toggle.getAttribute("data-bs-target");
        const collapseEl = document.querySelector(targetId);
        if (collapseEl) {
          const visibleText = toggle.textContent?.trim();
          const hiddenText = collapseEl.textContent?.trim();
          const combined = visibleText + (hiddenText ? ". " + hiddenText : "");
          const start = fullText.length;
          fullText += combined + " ";
          map.push({ start, end: fullText.length, el });
          return;
        }
      }

      const text = el.textContent.trim();
      if (!text) return;
      const start = fullText.length;
      fullText += text + " ";
      map.push({ start, end: fullText.length, el });
    });

    return { fullText, map };
  }, [getReadableElements]);

  const removeHighlight = useCallback(() => {
    document.querySelectorAll(".audio-word-highlight").forEach((el) => {
      el.classList.remove("audio-word-highlight");
    });
    lastHighlightedRef.current = null;
  }, []);

  const applyHighlight = useCallback(
    (charIndex, map) => {
      for (const { start, end, el } of map) {
        if (charIndex >= start && charIndex < end) {
          if (lastHighlightedRef.current !== el) {
            removeHighlight();
            el.classList.add("audio-word-highlight");
            lastHighlightedRef.current = el;
            el.scrollIntoView({ behavior: "smooth", block: "center" });
          }
          break;
        }
      }
    },
    [removeHighlight]
  );

  const startReading = useCallback(() => {
    window.speechSynthesis.cancel();

    const { fullText, map } = buildTextAndMap();
    if (!fullText.trim()) return;

    totalCharsRef.current = fullText.length;
    lastCharIndexRef.current = -1;

    const utterance = new SpeechSynthesisUtterance(fullText);
    utterance.lang = lang === 'en' ? 'en-US' : 'pt-BR';
    utterance.rate = 1;
    utterance.pitch = 1;

    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      const voice = voices.find(v => v.lang.replace('_', '-') === utterance.lang)
        || voices.find(v => v.lang.startsWith(lang === 'en' ? 'en' : 'pt'));
      if (voice) utterance.voice = voice;
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    utterance.onboundary = (event) => {
      const charIndex = event.charIndex;
      if (Math.abs(charIndex - lastCharIndexRef.current) < 2) return;
      lastCharIndexRef.current = charIndex;
      setProgress(Math.round((charIndex / totalCharsRef.current) * 100));
      applyHighlight(charIndex, map);
    };

    utterance.onend = () => {
      setIsReading(false);
      setIsPaused(false);
      setProgress(100);
      setTimeout(removeHighlight, 800);
    };

    utterance.onerror = () => {
      setIsReading(false);
      setIsPaused(false);
      removeHighlight();
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setIsReading(true);
    setIsPaused(false);
    setProgress(0);
  }, [buildTextAndMap, applyHighlight, removeHighlight, lang]);

  const pauseResume = useCallback(() => {
    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    } else {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  }, [isPaused]);

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsReading(false);
    setIsPaused(false);
    setProgress(0);
    removeHighlight();
  }, [removeHighlight]);

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
      removeHighlight();
    };
  }, [removeHighlight]);

  return (
    <div className={`audio-reader-widget ${isMinimized ? "minimized" : ""}`}>
      <div className="ar-header">
        <div className="ar-title">
          <span className="ar-icon">
            {isReading && !isPaused ? (
              <span className="ar-wave">
                <span /><span /><span /><span />
              </span>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M3 9v6h4l5 5V4L7 9H3z" fill="currentColor" />
                <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" fill="currentColor" opacity="0.7" />
                <path d="M19 12c0 3.04-1.73 5.68-4.27 7l-.73-1.26C16.13 16.63 17.5 14.43 17.5 12s-1.37-3.63-3.5-4.74L14.73 6C17.27 7.32 19 9.96 19 12z" fill="currentColor" opacity="0.4" />
              </svg>
            )}
          </span>
          <span>{t.title}</span>
        </div>

        <div style={{ display: "flex", gap: "4px" }}>
          <button
            className="ar-minimize-btn"
            onClick={() => setIsMinimized(!isMinimized)}
            title={isMinimized ? t.expand : t.minimize}
          >
            {isMinimized ? "▲" : "▼"}
          </button>

          {onClose && (
            <button
              className="ar-minimize-btn"
              onClick={() => { stop(); onClose(); }}
              title={t.close}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {!isMinimized && (
        <div className="ar-body">
          <div className="ar-progress-bar">
            <div className="ar-progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <span className="ar-progress-label">{progress}%</span>

          <div className="ar-controls">
            {!isReading ? (
              <button className="ar-btn ar-btn-play" onClick={startReading}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M8 5v14l11-7z" fill="currentColor" />
                </svg>
                {t.play}
              </button>
            ) : (
              <>
                <button className="ar-btn ar-btn-pause" onClick={pauseResume}>
                  {isPaused ? (
                    <>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                        <path d="M8 5v14l11-7z" fill="currentColor" />
                      </svg>
                      {t.resume}
                    </>
                  ) : (
                    <>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                        <rect x="6" y="4" width="4" height="16" fill="currentColor" />
                        <rect x="14" y="4" width="4" height="16" fill="currentColor" />
                      </svg>
                      {t.pause}
                    </>
                  )}
                </button>
                <button className="ar-btn ar-btn-stop" onClick={stop}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                    <rect x="4" y="4" width="16" height="16" fill="currentColor" />
                  </svg>
                  {t.stop}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AudioReader;
