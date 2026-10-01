import React, { useState, useEffect, useMemo } from 'react';
import { useSettings } from './SettingsContext';

// ✅ CORREÇÃO: Mover o dicionário para fora do componente
// Assim ele não é recriado a cada renderização e o erro do useEffect desaparece.
const diffTranslations = {
  pt: { same: "MESMA HORA", diff: "DE DIFERENÇA" },
  en: { same: "SAME TIME", diff: "DIFFERENCE" },
  fr: { same: "MÊME HEURE", diff: "DE DÉCALAGE" }
};

const Clock = ({ timezone, lang = 'en' }) => {
  const [time, setTime] = useState(new Date());
  const [diffText, setDiffText] = useState("");
  
  // 1. ACEDER ÀS DEFINIÇÕES GLOBAIS
  const { converterHora, settings } = useSettings();
  const uiLang = settings.idioma || 'pt';

  const safeTimezone = useMemo(() => {
    if (!timezone) return undefined;
    try {
      return Intl.DateTimeFormat(undefined, { timeZone: timezone }).resolvedOptions().timeZone;
    } catch { 
      return undefined;
    }
  }, [timezone]);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // 3. ATUALIZAR O TEXTO DA DIFERENÇA
  useEffect(() => {
    if (!safeTimezone) {
      setDiffText("");
      return;
    }
    try {
      const now = new Date();
      const localHour = parseInt(now.toLocaleTimeString('en-US', { hour: 'numeric', hour12: false }));
      const targetTimeStr = now.toLocaleTimeString('en-US', { timeZone: safeTimezone, hour: 'numeric', hour12: false });
      const targetHour = parseInt(targetTimeStr);

      if (isNaN(targetHour)) { setDiffText(""); return; }

      let diff = targetHour - localHour;
      if (diff < -12) diff += 24;
      if (diff > 12) diff -= 24;

      const t = diffTranslations[uiLang]; 

      if (diff === 0) setDiffText(t.same);
      else {
        const sign = diff > 0 ? "+" : "";
        setDiffText(`${sign}${diff}H ${t.diff}`);
      }
    } catch { setDiffText(""); }
  }, [safeTimezone, uiLang]); // ✅ Agora 'diffTranslations' não precisa estar aqui pois é externo

  // --- LÓGICA DE FORMATAÇÃO ---
  let timeString24 = "00:00";
  try {
    timeString24 = time.toLocaleTimeString('en-US', { timeZone: safeTimezone, hour: '2-digit', minute: '2-digit', hour12: false });
  } catch {
    timeString24 = time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  }

  const timeDisplay = converterHora(timeString24);

  const [hStr, mStr] = timeString24.split(':');
  const hDisplay = parseInt(hStr || 0);
  const mDisplay = parseInt(mStr || 0);
  const sDisplay = time.getSeconds();

  const secondDeg = (sDisplay / 60) * 360;
  const minuteDeg = ((mDisplay * 60 + sDisplay) / 3600) * 360;
  const hourDeg = ((hDisplay % 12) / 12) * 360 + (mDisplay / 60) * 30;

  const getGreeting = (h, language) => {
    const period = h < 12 ? 'morning' : h < 18 ? 'afternoon' : 'night';
    const dic = {
      en: { morning: 'Good Morning', afternoon: 'Good Afternoon', night: 'Good Evening' },
      us: { morning: 'Good Morning', afternoon: 'Good Afternoon', night: 'Good Evening' },
      ca: { morning: 'Good Morning', afternoon: 'Good Afternoon', night: 'Good Evening' },
      au: { morning: 'Good Morning', afternoon: 'Good Afternoon', night: 'Good Evening' },
      za: { morning: 'Good Morning', afternoon: 'Good Afternoon', night: 'Good Evening' },
      pt: { morning: 'Bom dia', afternoon: 'Boa tarde', night: 'Boa noite' },
      br: { morning: 'Bom dia', afternoon: 'Boa tarde', night: 'Boa noite' },
      es: { morning: 'Buenos Días', afternoon: 'Buenas Tardes', night: 'Buenas Noches' },
      mx: { morning: 'Buenos Días', afternoon: 'Buenas Tardes', night: 'Buenas Noches' },
      cl: { morning: 'Buenos Días', afternoon: 'Buenas Tardes', night: 'Buenas Noches' },
      pe: { morning: 'Buenos Días', afternoon: 'Buenas Tardes', night: 'Buenas Noches' },
      it: { morning: 'Buongiorno', afternoon: 'Buon pomeriggio', night: 'Buonanotte' },
      fr: { morning: 'Bonjour', afternoon: 'Bon après-midi', night: 'Bonne nuit' },
      is: { morning: 'Góðan morgun', afternoon: 'Góðan daginn', night: 'Gott kvöld' },
      fo: { morning: 'Góðan morgun', afternoon: 'Góðan dag', night: 'Gott kvøld' },
      jp: { morning: 'Ohayou Gozaimasu', afternoon: 'Konnichiwa', night: 'Konbanwa' },
      tr: { morning: 'Günaydın', afternoon: 'Tünaydın', night: 'İyi Akşamlar' },
      jo: { morning: 'Sabah al-Khair', afternoon: 'Masa al-Khair', night: 'Laila Saida' },
      np: { morning: 'Shubha Prabhat', afternoon: 'Namaste', night: 'Shubha Ratri' },
      nz: { morning: 'Ata Mārie', afternoon: 'Ahiahi Mārie', night: 'Pō Mārie' },
      na: { morning: 'Goeie More', afternoon: 'Goeie Middag', night: 'Goeie Naand' }
    };
    const selectedLang = dic[language] || dic['en'];
    return selectedLang[period];
  };

  const greeting = getGreeting(hDisplay, lang);

  return (
    <div className="clock-widget">
      <div className="clock-main-row">
        <div style={{ width: '45px', height: '45px', border: '2px solid rgba(255,255,255,0.8)', borderRadius: '50%', position: 'relative', boxShadow: '0 0 10px rgba(255,255,255,0.1)', flexShrink: 0 }}>
          <div style={{ position: 'absolute', bottom: '50%', left: '50%', width: '3px', height: '30%', backgroundColor: 'white', transformOrigin: 'bottom center', transform: `translateX(-50%) rotate(${hourDeg}deg)`, borderRadius: '2px', zIndex: 10 }} />
          <div style={{ position: 'absolute', bottom: '50%', left: '50%', width: '2px', height: '40%', backgroundColor: 'white', transformOrigin: 'bottom center', transform: `translateX(-50%) rotate(${minuteDeg}deg)`, borderRadius: '2px', zIndex: 10 }} />
          <div style={{ position: 'absolute', bottom: '50%', left: '50%', width: '1px', height: '45%', backgroundColor: '#f2c94c', transformOrigin: 'bottom center', transform: `translateX(-50%) rotate(${secondDeg}deg)`, borderRadius: '2px', zIndex: 10 }} />
          <div style={{ position:'absolute', top:'50%', left:'50%', width:'4px', height:'4px', background:'white', borderRadius:'50%', transform:'translate(-50%, -50%)', zIndex:11}} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center' }}>
          <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.8, color: 'white', marginBottom: '2px' }}>{greeting}</span>
          <span style={{ fontSize: '2rem', fontWeight: '400', lineHeight: '0.9', color:'white' }}>{timeDisplay}</span>
        </div>
      </div>

      <div className="clock-details">
        {diffText}
      </div>
    </div>
  );
};

export default Clock;