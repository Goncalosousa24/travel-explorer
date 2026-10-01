/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useContext, useEffect } from 'react';

const SettingsContext = createContext();

// --- 1. DICIONÁRIO DE TRADUÇÕES ---
const translations = {
  pt: {
    // --- INTERFACE GERAL ---
    back: "← VOLTAR",
    location: "LOCALIZAÇÃO",
    close_map: "FECHAR MAPA ✕",
    reviews: "REVISÕES",
    dont_miss: "A NÃO PERDER",
    climate: "TEMPERATURA MÉDIA", // Corrigido para ordem PT
    price_var: "VARIAÇÃO DE PREÇO",
    high_season: "ÉPOCA ALTA",
    mid_season: "ÉPOCA MÉDIA",
    low_season: "ÉPOCA BAIXA",
    details: "VER DETALHES →",
    
    // --- MENU DE DEFINIÇÕES ---
    settings_title: "DEFINIÇÕES",
    set_lang: "IDIOMA",
    set_temp: "TEMPERATURA",
    set_dist: "DISTÂNCIA",
    set_time: "FORMATO HORA",
    set_color: "DALTONISMO",
    color_none: "Nenhum",

    // --- ITENS GENÉRICOS (ROTEIRO) ---
    generic_photo: "Melhores Spots Fotográficos",
    generic_photo_desc: "Os ângulos perfeitos para capturar a essência deste destino.",
    generic_food: "Experiência Gastronómica",
    generic_food_desc: "Descubra os sabores autênticos nos melhores locais da região.",
    generic_view: "Pôr do Sol Panorâmico",
    generic_view_desc: "O local ideal para ver o dia terminar com uma paisagem incrível.",
    generic_culture: "Cultura e Tradições",
    generic_culture_desc: "Conheça o artesanato e a identidade única local.",
    generic_relax: "Momento de Relaxamento",
    generic_relax_desc: "Aproveite a atmosfera para descansar e absorver o ambiente.",
    generic_nature: "Exploração da Natureza",
    generic_nature_desc: "Caminhe e aprecie a beleza natural envolvente.",
    
    // --- OUTROS ---
    months: ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"],
    address_fallback: "Localização genérica na cidade",
    desc_fallback: "Descrição indisponível.",
    
    // --- CONTEXTO PAGE ---
    dates_title: "DATAS RELEVANTES", news_title: "NOTÍCIAS LOCAL", guide_title: "GUIA PRÁTICO",
    loading_news: "A carregar notícias...",
    currency: "MOEDA", language: "IDIOMA", plug: "TOMADA", prefix: "PREFIXO",
    water: "ÁGUA", tip: "GORJETA", driving: "CONDUÇÃO", emergency: "EMERGÊNCIA"
  },
  en: {
    // --- GENERAL UI ---
    back: "← BACK",
    location: "LOCATION",
    close_map: "CLOSE MAP ✕",
    reviews: "REVIEWS",
    dont_miss: "DON'T MISS",
    climate: "AVG WEATHER",
    price_var: "PRICE VARIATION",
    high_season: "HIGH SEASON",
    mid_season: "MID SEASON",
    low_season: "LOW SEASON",
    details: "SEE DETAILS →",

    // --- SETTINGS MENU ---
    settings_title: "SETTINGS",
    set_lang: "LANGUAGE",
    set_temp: "TEMPERATURE",
    set_dist: "DISTANCE",
    set_time: "TIME FORMAT",
    set_color: "COLOR BLINDNESS",
    color_none: "None",

    // --- GENERIC ITEMS ---
    generic_photo: "Best Photo Spots",
    generic_photo_desc: "Perfect angles to capture the essence of this destination.",
    generic_food: "Gastronomic Experience",
    generic_food_desc: "Discover authentic flavors at the best local spots.",
    generic_view: "Panoramic Sunset",
    generic_view_desc: "The ideal spot to watch the day end with an incredible view.",
    generic_culture: "Culture & Traditions",
    generic_culture_desc: "Discover local crafts and unique identity.",
    generic_relax: "Relaxing Moment",
    generic_relax_desc: "Enjoy the atmosphere to rest and absorb the vibe.",
    generic_nature: "Nature Exploration",
    generic_nature_desc: "Walk and appreciate the surrounding natural beauty.",
    
    // --- OTHERS ---
    months: ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"],
    address_fallback: "Generic location in the city",
    desc_fallback: "Description unavailable.",

    // --- CONTEXTO PAGE ---
    dates_title: "KEY DATES", news_title: "LOCAL NEWS", guide_title: "PRACTICAL GUIDE",
    loading_news: "Loading news...",
    currency: "CURRENCY", language: "LANGUAGE", plug: "PLUG", prefix: "PREFIX",
    water: "WATER", tip: "TIPPING", driving: "DRIVING", emergency: "EMERGENCY"
  },
  fr: {
    // --- UI GÉNÉRALE ---
    back: "← RETOUR",
    location: "LOCALISATION",
    close_map: "FERMER CARTE ✕",
    reviews: "AVIS",
    dont_miss: "À NE PAS MANQUER",
    climate: "MÉTÉO MOYENNE",
    price_var: "VARIATION DE PRIX",
    high_season: "HAUTE SAISON",
    mid_season: "MOYENNE SAISON",
    low_season: "BASSE SAISON",
    details: "VOIR DÉTAILS →",

    // --- MENU PARAMÈTRES ---
    settings_title: "PARAMÈTRES",
    set_lang: "LANGUE",
    set_temp: "TEMPÉRATURE",
    set_dist: "DISTANCE",
    set_time: "FORMAT HEURE",
    set_color: "DALTONISME",
    color_none: "Aucun",

    // --- ÉLÉMENTS GÉNÉRIQUES ---
    generic_photo: "Meilleurs Spots Photos",
    generic_photo_desc: "Les angles parfaits pour capturer l'essence de cette destination.",
    generic_food: "Expérience Gastronomique",
    generic_food_desc: "Découvrez des saveurs authentiques dans les meilleurs endroits.",
    generic_view: "Coucher de Soleil Panoramique",
    generic_view_desc: "L'endroit idéal pour finir la journée avec une vue incroyable.",
    generic_culture: "Culture et Traditions",
    generic_culture_desc: "Découvrez l'artisanat et l'identité locale unique.",
    generic_relax: "Moment de Détente",
    generic_relax_desc: "Profitez de l'atmosphère pour vous reposer.",
    generic_nature: "Exploration de la Nature",
    generic_nature_desc: "Marchez et appréciez la beauté naturelle environnante.",
    
    // --- AUTRES ---
    months: ["JAN", "FÉV", "MAR", "AVR", "MAI", "JUI", "JUI", "AOÛ", "SEP", "OCT", "NOV", "DÉC"],
    address_fallback: "Localisation générique en ville",
    desc_fallback: "Description indisponible.",

    // --- CONTEXTO PAGE ---
    dates_title: "DATES CLÉS", news_title: "ACTUALITÉS LOCALES", guide_title: "GUIDE PRATIQUE",
    loading_news: "Chargement des actualités...",
    currency: "DEVISE", language: "LANGUE", plug: "PRISE", prefix: "PRÉFIXE",
    water: "EAU", tip: "POURBOIRE", driving: "CONDUITE", emergency: "URGENCE"
  }
};

export const SettingsProvider = ({ children }) => {
    const [settings, setSettings] = useState({
        idioma: 'pt',        // 'pt', 'en', 'fr'
        unidadeTemp: 'C',    // 'C' ou 'F'
        unidadeDist: 'km',   // 'km' ou 'mi'
        formatoHora: '24h',  // '24h' ou '12h'
        tema: 'dark',        // 'dark' ou 'light'
        daltonismo: 'nenhum' // 'nenhum', 'protanopia', 'deuteranopia', 'tritanopia'
    });

    // ✅ ESTADO PARA DETEÇÃO DE MOBILE
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };
        // Ouve as mudanças de tamanho da janela
        window.addEventListener('resize', handleResize);
        
        // Remove o listener quando o componente é desmontado
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // --- FUNÇÕES DE TRADUÇÃO ---
    
    const mudarIdioma = (novoIdioma) => {
        if (translations[novoIdioma]) {
            setSettings(prev => ({ ...prev, idioma: novoIdioma }));
        }
    };

    const t = (key) => {
        const lang = settings.idioma || 'pt';
        return translations[lang]?.[key] || translations['pt'][key] || key;
    };

    const tArray = (key) => {
        const lang = settings.idioma || 'pt';
        return translations[lang]?.[key] || translations['pt'][key] || [];
    };

    // --- FUNÇÕES DE ESTILO E CONVERSÃO ---

    const getFilterStyle = () => {
        if (settings.daltonismo === 'nenhum') return 'none';
        return `url(#${settings.daltonismo}-filter)`;
    };

    const converterTemp = (celsius) => {
        if (settings.unidadeTemp === 'C') return `${celsius}°C`;
        const f = (celsius * 9/5) + 32;
        return `${Math.round(f)}°F`;
    };

    const converterDist = (km) => {
        if (settings.unidadeDist === 'km') return `${km} KM`;
        const mi = km * 0.621371;
        return `${Math.round(mi)} MI`;
    };

    const converterHora = (hora24) => {
        if (settings.formatoHora === '24h' || !hora24) return hora24;
        let [h, m] = hora24.split(':');
        h = parseInt(h);
        const sufixo = h >= 12 ? 'PM' : 'AM';
        h = h % 12 || 12; 
        return `${h}:${m} ${sufixo}`;
    };

    return (
        <SettingsContext.Provider value={{ 
            settings, 
            setSettings, 
            mudarIdioma, 
            t,           
            tArray,      
            converterTemp, 
            converterDist, 
            converterHora,
            getFilterStyle,
            isMobile // ✅ Exporta isMobile para toda a app
        }}>
            {children}
            
            {/* DEFINIÇÕES DOS FILTROS SVG */}
            <svg style={{ position: 'absolute', width: 0, height: 0 }}>
                <defs>
                    <filter id="protanopia-filter" colorInterpolationFilters="sRGB">
                        <feColorMatrix type="matrix" values="0.567, 0.433, 0, 0, 0, 0.558, 0.442, 0, 0, 0, 0, 0.242, 0.758, 0, 0, 0, 0, 0, 1, 0" />
                    </filter>
                    <filter id="deuteranopia-filter" colorInterpolationFilters="sRGB">
                        <feColorMatrix type="matrix" values="0.625, 0.375, 0, 0, 0, 0.7, 0.3, 0, 0, 0, 0, 0.3, 0.7, 0, 0, 0, 0, 0, 1, 0" />
                    </filter>
                    <filter id="tritanopia-filter" colorInterpolationFilters="sRGB">
                        <feColorMatrix type="matrix" values="0.95, 0.05, 0, 0, 0, 0, 0.433, 0.567, 0, 0, 0, 0.475, 0.525, 0, 0, 0, 0, 0, 1, 0" />
                    </filter>
                </defs>
            </svg>
        </SettingsContext.Provider>
    );
};

export const useSettings = () => useContext(SettingsContext);