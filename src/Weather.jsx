import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css'; 

// --- IMPORTAÇÃO DO CONTEXTO ---
import { useSettings } from './SettingsContext';

// --- Mapeamento de Ícones ---
const getWeatherIcon = (iconCode) => {
    if (!iconCode || iconCode.length < 2) return '🌡️'; 
    const code = iconCode.substring(0, 2);
    switch (code) {
        case '01': return '☀️'; 
        case '02': case '03': return '🌤️'; 
        case '04': return '☁️'; 
        case '09': case '10': return '🌧️'; 
        case '11': return '⛈️'; 
        case '13': return '❄️'; 
        case '50': return '🌫️'; 
        default: return '🌡️'; 
    }
};

const DayForecast = ({ temp, iconCode, dayLabel }) => {
    const icon = getWeatherIcon(iconCode); 
    const { converterTemp } = useSettings(); // Aceder à conversão

    return (
        <div style={{ textAlign: 'center', minWidth: '60px', lineHeight: '1.2', padding: '2px 0' }}> 
            <span style={{ fontSize: '35px', display: 'block', lineHeight: '1', filter: 'drop-shadow(0 0 1px rgba(0,0,0,0.2))' }}>
                {icon}
            </span>
            <div style={{ fontSize: '1rem', fontWeight: 'bold', margin: '2px 0 0 0', lineHeight: '1' }}> 
                {/* O converterTemp já inclui o símbolo °C ou °F */}
                {converterTemp(Math.round(temp))}
            </div>
            <div style={{ fontSize: '0.65rem', opacity: 0.7, textTransform: 'uppercase' }}>
                {dayLabel}
            </div>
        </div>
    );
};

const Weather = ({ lat, lng, lang = 'pt' }) => {
    const [weatherData, setWeatherData] = useState(null);
    const { converterTemp, settings } = useSettings(); 
    const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY; 

    // --- DICIONÁRIO DE TRADUÇÕES ---
    const t = {
        pt: { today: "HOJE", feels: "SENSAÇÃO", wind: "VENTO", humidity: "HUMIDADE" },
        en: { today: "TODAY", feels: "FEELS LIKE", wind: "WIND", humidity: "HUMIDITY" },
        fr: { today: "AUJOURD'HUI", feels: "RESSENTI", wind: "VENT", humidity: "HUMIDITÉ" }
    }[lang] || { today: "HOJE", feels: "SENSAÇÃO", wind: "VENTO", humidity: "HUMIDADE" };

    useEffect(() => {
        if (!lat || !lng) return;
        // Nota: Passamos 'lang' na API também para descrições internas se necessário
        const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lng}&units=metric&lang=${lang}&appid=${apiKey}`;
        axios.get(url).then(res => setWeatherData(res.data)).catch(err => console.error(err));
    }, [lat, lng, lang]);

    if (!weatherData) return null; 

    const list = weatherData.list || []; 
    const current = list[0] || {};
    const tomorrow = list[8] || {};
    const after = list[16] || {};

    const getDayName = (idx) => {
        const date = new Date();
        date.setDate(date.getDate() + idx); 
        
        // Mapear o código da tua app (pt, en, fr) para o código do navegador
        const localeMap = { pt: 'pt-PT', en: 'en-US', fr: 'fr-FR' };
        const locale = localeMap[lang] || 'pt-PT';

        return date.toLocaleDateString(locale, { weekday: 'short' }).replace('.', '');
    };

    // Lógica para converter a velocidade do vento se estiver em Milhas
    const formatWind = (speedKmh) => {
        if (settings.unidadeDist === 'mi') {
            const mph = Math.round(speedKmh * 0.621371);
            return `${mph} mph`;
        }
        return `${Math.round(speedKmh)} km/h`;
    };

    return (
        <div className="weather-widget">
            
            <div className="weather-main-row">
                <DayForecast temp={current.main?.temp || 0} iconCode={current.weather?.[0]?.icon} dayLabel={t.today} />
                <DayForecast temp={tomorrow.main?.temp || 0} iconCode={tomorrow.weather?.[0]?.icon} dayLabel={getDayName(1)} />
                <DayForecast temp={after.main?.temp || 0} iconCode={after.weather?.[0]?.icon} dayLabel={getDayName(2)} />
            </div>

            <div className="weather-details">
                <div className="detail-item">
                    <span>{t.feels}</span>
                    <b>{converterTemp(Math.round(current.main?.feels_like || 0))}</b>
                </div>
                <div className="detail-item">
                    <span>{t.wind}</span>
                    <b>{formatWind((current.wind?.speed || 0) * 3.6)}</b>
                </div>
                <div className="detail-item">
                    <span>{t.humidity}</span>
                    <b>{current.main?.humidity || 0}%</b>
                </div>
            </div>

        </div>
    );
};

export default Weather;