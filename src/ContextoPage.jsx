import React, { useState, useEffect, useRef } from 'react';
import { useSettings } from './SettingsContext'; 

const ContextoPage = ({ dados }) => {
    const [noticias, setNoticias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [indexEvento, setIndexEvento] = useState(0); 
    const [indexNoticia, setIndexNoticia] = useState(0); 
    const [showDetail, setShowDetail] = useState(false);
    const [isExiting, setIsExiting] = useState(true); 
    const [infoSet, setInfoSet] = useState(0); 
    
    // Estado para Hover
    const [hoveredCard, setHoveredCard] = useState(null);

    const [isVisible, setIsVisible] = useState(false);
    const sectionRef = useRef(null);

    const { settings, isMobile } = useSettings(); 
    const lang = settings.idioma || 'pt';

    // ---------------------------------------------------------
    // API KEY SECURE (Carregada do .env)
    // ---------------------------------------------------------
    const API_KEY = import.meta.env.VITE_SERPAPI_KEY; 
    // ---------------------------------------------------------

    const t = {
        pt: {
            dates_title: "DATAS RELEVANTES", news_title: "NOTÍCIAS LOCAL", guide_title: "GUIA PRÁTICO",
            loading_news: "A carregar notícias...", currency: "MOEDA", language: "IDIOMA", plug: "TOMADA", 
            prefix: "PREFIXO", water: "ÁGUA", tip: "GORJETA", driving: "CONDUÇÃO", emergency: "EMERGÊNCIA"
        },
        en: {
            dates_title: "KEY DATES", news_title: "LOCAL NEWS", guide_title: "PRACTICAL GUIDE",
            loading_news: "Loading news...", currency: "CURRENCY", language: "LANGUAGE", plug: "PLUG", 
            prefix: "PREFIX", water: "WATER", tip: "TIPPING", driving: "DRIVING", emergency: "EMERGENCY"
        },
        fr: {
            dates_title: "DATES CLÉS", news_title: "ACTUALITÉS LOCALES", guide_title: "GUIDE PRATIQUE",
            loading_news: "Chargement des actualités...", currency: "DEVISE", language: "LANGUE", plug: "PRISE", 
            prefix: "PRÉFIXE", water: "EAU", tip: "POURBOIRE", driving: "CONDUITE", emergency: "URGENCE"
        }
    }[lang];

    const translateValue = (val) => {
        if (lang === 'pt') return val;
        const dict = {
            "Italiano": { en: "Italian", fr: "Italien" }, "Francês": { en: "French", fr: "Français" },
            "Inglês": { en: "English", fr: "Anglais" }, "Português": { en: "Portuguese", fr: "Portugais" },
            "Espanhol": { en: "Spanish", fr: "Espagnol" }, "Japonês": { en: "Japanese", fr: "Japonais" },
            "Islandês": { en: "Icelandic", fr: "Islandais" }, "Árabe": { en: "Arabic", fr: "Arabe" },
            "Turco": { en: "Turkish", fr: "Turc" }, "Potável": { en: "Drinkable", fr: "Potable" },
            "Potável (Excelente)": { en: "Drinkable (Excellent)", fr: "Potable (Excellente)" },
            "Engarrafada": { en: "Bottled", fr: "En bouteille" }, "Tratada": { en: "Treated", fr: "Traitée" },
            "Lado Direito": { en: "Right Side", fr: "Côté Droit" }, "Lado Esquerdo": { en: "Left Side", fr: "Côté Gauche" },
            "Direita": { en: "Right", fr: "Droite" }, "Incluída": { en: "Included", fr: "Inclus" },
            "Não habitual": { en: "Not customary", fr: "Pas d'usage" }, "Recomendada": { en: "Recommended", fr: "Recommandé" },
            "Não aceite": { en: "Not accepted", fr: "Pas accepté" }
        };
        if (dict[val] && dict[val][lang]) return dict[val][lang];
        let translated = val;
        Object.keys(dict).forEach(key => { if (val.includes(key) && dict[key][lang]) translated = translated.replace(key, dict[key][lang]); });
        return translated;
    };

    useEffect(() => {
        let isMounted = true; 
        
        const usarNoticiasFallback = () => {
            console.warn("⚠️ A usar notícias de reserva (API falhou ou sem resultados).");
            const cityName = dados?.titulo || "Local";
            const mainImg = dados?.imgPrincipal || null; 

            const fallbackData = [
                {
                    source: { name: "Guia de Viagem" },
                    title: `Descubra as maravilhas de ${cityName}.`,
                    url: "#",
                    image: mainImg 
                },
                {
                    source: { name: "Cultura Local" },
                    title: `Eventos e tradições em ${cityName}.`,
                    url: "#",
                    image: mainImg
                },
                {
                    source: { name: "Gastronomia" },
                    title: `Sabores a não perder em ${cityName}.`,
                    url: "#",
                    image: mainImg
                }
            ];
            if (isMounted) setNoticias(fallbackData);
        };

        const iniciarBusca = async () => {
            if (!dados?.titulo) return;
            setLoading(true);
            try {
                const searchLang = lang === 'pt' ? 'pt' : lang === 'fr' ? 'fr' : 'en';
                const gl = lang === 'pt' ? 'pt' : lang === 'fr' ? 'fr' : 'us';
                const query = encodeURIComponent(`${dados.titulo} ${dados.pais} news`); 
                
                const targetUrl = `https://serpapi.com/search.json?engine=google_news&q=${query}&api_key=${API_KEY}&gl=${gl}&hl=${searchLang}`;
                const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`;
                
                console.log("🔍 A procurar notícias...");

                const response = await fetch(proxyUrl);
                
                if (!response.ok) {
                    throw new Error(`Erro HTTP: ${response.status}`);
                }

                const data = await response.json();
                
                if (data.error) {
                    throw new Error(`Erro API: ${data.error}`);
                }

                if (isMounted && data.news_results && data.news_results.length > 0) {
                    console.log("✅ Notícias encontradas:", data.news_results.length);
                    const noticiasProcessadas = data.news_results.slice(0, 5).map(item => ({
                        source: { name: item.source?.title || "Google News" },
                        title: item.title,
                        url: item.link,
                        publishedAt: item.date,
                        image: item.thumbnail || dados.imgPrincipal 
                    }));
                    setNoticias(noticiasProcessadas);
                } else {
                    console.log("❌ Nenhum resultado encontrado.");
                    usarNoticiasFallback();
                }
            } catch (error) { 
                console.error("❌ Erro no fetch das notícias:", error); 
                usarNoticiasFallback();
            } finally { 
                if (isMounted) setLoading(false); 
            }
        };
        
        iniciarBusca();
        return () => { isMounted = false; };
    }, [dados, lang]);

    useEffect(() => {
        if (noticias.length > 1) {
            const newsTimer = setInterval(() => setIndexNoticia(prev => (prev + 1) % noticias.length), 8000);
            return () => clearInterval(newsTimer);
        }
    }, [noticias]);

    useEffect(() => {
        if (dados?.eventosFixos?.length > 0) {
            setIsExiting(true); setShowDetail(false);
            const entryTimer = setTimeout(() => setIsExiting(false), 100);
            const detailTimer = setTimeout(() => setShowDetail(true), 3000);
            const exitTimer = setTimeout(() => setIsExiting(true), 7500);
            const nextTimer = setTimeout(() => setIndexEvento(prev => (prev + 1) % dados.eventosFixos.length), 8500);
            return () => { [entryTimer, detailTimer, exitTimer, nextTimer].forEach(clearTimeout); };
        }
    }, [indexEvento, dados]);

    useEffect(() => {
        const timer = setInterval(() => setInfoSet(prev => (prev === 0 ? 1 : 0)), 8000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => setIsVisible(entry.isIntersecting), { threshold: 0.15 });
        if (sectionRef.current) observer.observe(sectionRef.current);
        return () => observer.disconnect();
    }, []);

    const eventoAtual = dados?.eventosFixos?.[indexEvento];
    const motivoTraduzido = eventoAtual ? (lang === 'en' ? eventoAtual.motivo_en : lang === 'fr' ? eventoAtual.motivo_fr : eventoAtual.motivo) || eventoAtual.motivo : "";
    const rawData = eventoAtual?.data || "";
    const mesParaExibir = rawData.split(' ')[0] || "--";
    const diaParaExibir = rawData.replace(/[^0-9]/g, '').replace(/^0+/, '') || "1";
    
    const noticiaAtual = noticias.length > 0 ? noticias[indexNoticia] : null;

    const guia = dados?.contextoPratico || { moeda: "€", lingua: "Local", tomada: "Tipo F", prefixo: "+00", agua: "Potável", gorjeta: "Opcional", conducao: "Direita", emergencia: "112" };

    const styles = {
        sectionContainer: { 
            width: '100%', 
            // ✅ CORREÇÃO: 450px de padding no topo em mobile empurra o conteúdo para o fundo
            padding: isMobile ? '450px 20px 60px' : '0 60px 60px', 
            backgroundColor: 'transparent', 
            display: 'flex', 
            justifyContent: 'center', 
            boxSizing: 'border-box' 
        },
        mainGrid: { 
            display: 'flex', 
            gap: isMobile ? '30px' : '40px', 
            width: '100%', 
            flexDirection: isMobile ? 'column' : 'row', 
            alignItems: 'stretch', 
            opacity: isVisible ? 1 : 0, 
            transform: isVisible ? 'translateY(0)' : 'translateY(30px)', 
            transition: 'all 1s cubic-bezier(0.19, 1, 0.22, 1)' 
        },
        leftColumn: { 
            flex: 6.5, 
            display: 'flex', 
            gap: '40px', 
            flexDirection: isMobile ? 'column' : 'row' 
        },
        rightColumn: { 
            flex: 3.5, 
            display: 'flex', 
            flexDirection: 'column' 
        },
        cardBaseProps: { 
            borderRadius: '45px', 
            position: 'relative', 
            overflow: 'hidden', 
            display: 'flex', 
            flexDirection: 'column', 
            padding: '30px', 
            boxSizing: 'border-box', 
            flex: 1, 
            width: '100%', 
            minHeight: isMobile ? '300px' : '320px', 
            transition: 'all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)', 
            boxShadow: 'none' 
        },
        label: { fontSize: '0.6rem', fontWeight: '800', color: '#FFCC00', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '25px', textAlign: 'center', zIndex: 10 },
        infoList: { width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', flex: 1 },
        infoRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: '5px 0' },
        infoLabel: { color: '#ffffff', fontSize: '0.5rem', fontWeight: '900', letterSpacing: '1px', textShadow: '0 0 10px rgba(255, 255, 255, 0.5)' },
        infoValue: { color: '#ffffff', fontSize: '0.9rem', fontWeight: '700', textAlign: 'right', textShadow: '0 0 10px rgba(255, 255, 255, 0.3)' },
        horizontalLine: { width: '100%', height: '1px', background: 'linear-gradient(to right, transparent, rgba(255, 255, 255, 0.2), transparent)', margin: '10px 0' },
        contentCenter: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, textAlign: 'center' },
        dateGroup: { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' },
        bigDay: { fontSize: '5rem', fontWeight: '900', lineHeight: '1', color: 'transparent', WebkitTextStroke: '1px rgba(255,255,255,0.3)' },
        bigMonth: { fontSize: '1rem', fontWeight: '900', color: '#fff', letterSpacing: '5px' },
        eventDetail: { padding: '0 10px' },
        eventTitle: { color: '#fff', fontSize: '1rem', fontWeight: '900', marginBottom: '10px' },
        eventReason: { color: '#aaa', fontSize: '0.75rem', lineHeight: '1.4' },
        smallDivider: { width: '40px', height: '2px', background: '#FFCC00', margin: '10px auto' },
        floatingLabel: { position: 'absolute', top: '30px', left: '30px', zIndex: 10, fontSize: '0.6rem', fontWeight: '800', color: '#fff', letterSpacing: '1px', textTransform: 'uppercase', textShadow: '0 2px 10px rgba(0,0,0,0.8)' },
        newsItemContainer: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1 },
        newsImage: { width: '100%', height: '100%', backgroundSize: 'cover', backgroundPosition: 'center', filter: 'brightness(0.6)', position: 'absolute', top: 0, left: 0 },
        newsContentBase: { position: 'absolute', bottom: 0, padding: '30px', width: '100%', boxSizing: 'border-box', background: 'linear-gradient(to top, rgba(0,0,0,0.95), transparent)', zIndex: 5 },
        newsTitle: { color: '#fff', fontWeight: '800', fontSize: '1rem', lineHeight: '1.4', textShadow: '0 2px 10px rgba(0,0,0,0.5)' },
        newsTag: { fontSize: '0.5rem', fontWeight: '900', color: '#000', backgroundColor: '#FFCC00', padding: '4px 8px', borderRadius: '3px', marginBottom: '10px', display: 'inline-block' },
        progressBar: { position: 'absolute', top: 0, left: 0, height: '4px', backgroundColor: '#FFCC00', animation: 'progressFill 8s linear forwards', zIndex: 20 },
        placeholderText: { color: '#444', textAlign: 'center', marginTop: '45%', fontSize: '0.8rem' }
    };

    const getCardStyle = (cardId) => {
        const isHovered = hoveredCard === cardId;
        const isAnythingHovered = hoveredCard !== null;
        const shouldBlur = isAnythingHovered && !isHovered;

        return {
            ...styles.cardBaseProps,
            backgroundColor: 'rgba(17, 17, 17, 0.5)', 
            border: isHovered ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid rgba(255, 255, 255, 0.05)',
            transform: isHovered ? 'scale(1.01)' : 'scale(1)',
            filter: shouldBlur ? 'blur(4px)' : 'none',
            backdropFilter: isHovered ? 'blur(10px)' : 'none',
            WebkitBackdropFilter: isHovered ? 'blur(10px)' : 'none',
            transition: 'all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1), background-color 0.3s ease',
        };
    };

    return (
        <section ref={sectionRef} style={styles.sectionContainer}>
            <div style={styles.mainGrid}>
                <div style={styles.leftColumn}>
                    <div style={getCardStyle('dates')} onMouseEnter={() => setHoveredCard('dates')} onMouseLeave={() => setHoveredCard(null)}>
                        <span style={styles.label}>{t.dates_title}</span>
                        {eventoAtual && (
                            <div key={indexEvento} style={{ ...styles.contentCenter, opacity: isExiting ? 0 : 1, transition: 'all 1.5s' }}>
                                <div style={{ ...styles.dateGroup, opacity: showDetail ? 0 : 1, transition: 'all 1s' }}>
                                    <div style={styles.bigDay}>{diaParaExibir}</div>
                                    <div style={styles.bigMonth}>{mesParaExibir}</div>
                                </div>
                                <div style={{ ...styles.eventDetail, opacity: showDetail ? 1 : 0, transition: 'opacity 1.2s' }}>
                                    <h3 style={styles.eventTitle}>{eventoAtual.nome}</h3>
                                    <div style={styles.smallDivider} />
                                    <p style={styles.eventReason}>{motivoTraduzido}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div style={{ ...getCardStyle('news'), padding: 0 }} onMouseEnter={() => setHoveredCard('news')} onMouseLeave={() => setHoveredCard(null)}>
                        <span style={styles.floatingLabel}>{t.news_title}</span>
                        {loading && noticias.length === 0 ? (
                            <p style={styles.placeholderText}>{t.loading_news}</p>
                        ) : noticiaAtual && (
                            <div key={indexNoticia} style={styles.newsItemContainer} className="fade-animation">
                                <div style={{ ...styles.newsImage, backgroundImage: `url(${noticiaAtual.image})` }} />
                                <div style={styles.newsContentBase}>
                                    <span style={styles.newsTag}>{noticiaAtual.source.name}</span>
                                    <h4 style={styles.newsTitle}>{noticiaAtual.title}</h4>
                                </div>
                                <div style={styles.progressBar} />
                            </div>
                        )}
                    </div>
                </div>

                <div style={styles.rightColumn}>
                    <div style={getCardStyle('guide')} onMouseEnter={() => setHoveredCard('guide')} onMouseLeave={() => setHoveredCard(null)}>
                        <span style={styles.label}>{t.guide_title}</span>
                        <div key={infoSet} className="fade-animation" style={styles.infoList}>
                            {infoSet === 0 ? (
                                <>
                                    <InfoRow label={t.currency} value={guia.moeda} styles={styles} />
                                    <div style={styles.horizontalLine} />
                                    <InfoRow label={t.language} value={translateValue(guia.lingua)} styles={styles} />
                                    <div style={styles.horizontalLine} />
                                    <InfoRow label={t.plug} value={guia.tomada} styles={styles} />
                                    <div style={styles.horizontalLine} />
                                    <InfoRow label={t.prefix} value={guia.prefixo} styles={styles} />
                                </>
                            ) : (
                                <>
                                    <InfoRow label={t.water} value={translateValue(guia.agua)} styles={styles} />
                                    <div style={styles.horizontalLine} />
                                    <InfoRow label={t.tip} value={translateValue(guia.gorjeta)} styles={styles} />
                                    <div style={styles.horizontalLine} />
                                    <InfoRow label={t.driving} value={translateValue(guia.conducao)} styles={styles} />
                                    <div style={styles.horizontalLine} />
                                    <InfoRow label={t.emergency} value={guia.emergencia} styles={styles} />
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <style>{`
                @keyframes progressFill { from { width: 0%; } to { width: 100%; } }
                .fade-animation { animation: fadeIn 0.8s ease-in-out; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(0); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </section>
    );
};

const InfoRow = ({ label, value, styles }) => (
    <div style={styles.infoRow}>
        <div style={styles.infoLabel}>{label}</div>
        <div style={styles.infoValue}>{value}</div>
    </div>
);

export default ContextoPage;