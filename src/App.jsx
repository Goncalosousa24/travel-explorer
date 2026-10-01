import React, { useState, useEffect, useRef, useMemo, Suspense } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { FastAverageColor } from 'fast-average-color';
import Lottie from 'lottie-react';
import * as Cesium from 'cesium';
import './App.css';

import { SettingsProvider, useSettings } from './SettingsContext';
import SettingsButton from './SettingsButton';
import airplaneAnim from './assets/airplane.json';
import IntroScroll from './IntroScroll';
import MegaMenu from './MegaMenu';
import Navbar from './Navbar';
import Weather from './Weather';
import Clock from './Clock';
import TopicsDetails from './TopicsDetails';
import FlightWidget from './FlightWidget';
import { destinosData } from './dados';
import RoteiroPage from './RoteiroPage';
import GoogleEarth from './GoogleEarth';
import ModelViewer from './ModelViewer';

const fac = new FastAverageColor();

// Barreira de proteção
class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error) { console.error("Erro 3D:", error); }
  render() { if (this.state.hasError) return null; return this.props.children; }
}

const translations = {
  pt: { back: "Voltar", s1_title: "HISTÓRIA", s1_head: "LEGADO", s2_title: "GEOGRAFIA", s2_head: "TERRITÓRIO", s3_title: "NATUREZA", s3_head: "SINTONIA", s4_title: "ATMOSFERA", s4_head: "ESSÊNCIA", s5_title: "HORIZONTES", s5_head: "INFINITO", fly_label: "TEMPO DE VOO", dist_label: "DE DISTÂNCIA", search_placeholder: "Explore o Mundo", destino_label: "DESTINO", more_label: "SABER MAIS" },
  en: { back: "Back", s1_title: "HISTORY", s1_head: "LEGACY", s2_title: "GEOGRAPHY", s2_head: "TERRITORY", s3_title: "NATURE", s3_head: "HARMONY", s4_title: "ATMOSPHERE", s4_head: "ESSENCE", s5_title: "HORIZONS", s5_head: "INFINITY", fly_label: "FLIGHT TIME", dist_label: "DISTANCE", search_placeholder: "Explore the World", destino_label: "DESTINATION", more_label: "LEARN MORE" },
  fr: { back: "Retour", s1_title: "HISTOIRE", s1_head: "HÉRITAGE", s2_title: "GÉOGRAPHIE", s2_head: "TERRITOIRE", s3_title: "NATURE", s3_head: "HARMONIE", s4_title: "ATMOSPHÈRE", s4_head: "ESSENCE", s5_title: "HORIZONS", s5_head: "INFINI", fly_label: "DURÉE DE VOL", dist_label: "DISTANCE", search_placeholder: "Explorez le Monde", destino_label: "DESTINATION", more_label: "EN SAVOIR PLUS" }
};

const getFlightInfo = (lat2, lon2) => {
  const lat1 = 38.7223; const lon1 = -9.1393; const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180; const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; const hours = (distance / 800) + 0.5;
  const h = Math.floor(hours); const m = Math.round((hours - h) * 60);
  return { time: `${h}H ${m}MIN`, distRaw: Math.round(distance) };
};

const getTranslatedData = (data, field, lang) => {
  if (lang === 'pt') return data[field];
  const key = `${field}_${lang}`;
  return data[key] || data[field];
};

const GlobeInfoCard = ({ data, lang, onExpand }) => {
    const [isHovered, setIsHovered] = useState(false);
    if (!data) return null;
    const t = translations[lang] || translations.pt;
    const desc = getTranslatedData(data, 'textoGeografia', lang);
    return (
        <div onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)} onClick={() => onExpand(data.key)}
            style={{ position: 'absolute', top: '50%', right: '30px', transform: 'translateY(-50%)', width: '320px', padding: isHovered ? '40px 40px 60px 40px' : '40px', background: 'rgba(10, 10, 10, 0.9)', backdropFilter: 'blur(25px)', borderRadius: '60px', border: isHovered ? '1px solid rgba(255, 204, 0, 0.4)' : '1px solid rgba(255, 255, 255, 0.1)', color: 'white', zIndex: 200005, boxShadow: isHovered ? '0 40px 80px rgba(0,0,0,0.9)' : '0 10px 40px rgba(0,0,0,0.5)', cursor: 'pointer', transition: 'all 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)', pointerEvents: 'auto', animation: 'fadeInRight 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <span style={{ fontSize: '0.7rem', letterSpacing: '4px', textTransform: 'uppercase', color: '#FFCC00', fontWeight: '900' }}>{t.destino_label}</span>
                <img src={`https://flagcdn.com/h40/${data.lang}.png`} alt="flag" style={{ height: '20px', borderRadius: '4px' }} />
            </div>
            <h2 style={{ margin: '0 0 15px 0', fontSize: '2.4rem', fontFamily: "'Bowlby One SC', sans-serif", lineHeight: '0.9', textTransform: 'uppercase', transition: 'transform 0.5s ease', transform: isHovered ? 'translateY(-5px)' : 'translateY(0)' }}>{getTranslatedData(data, 'titulo', lang)}</h2>
            <div style={{ width: isHovered ? '60px' : '40px', height: '4px', background: '#FFCC00', borderRadius: '2px', marginBottom: '25px', transition: 'width 0.5s ease' }}></div>
            <p style={{ margin: 0, lineHeight: '1.6', color: 'rgba(255, 255, 255, 0.8)', fontFamily: 'sans-serif', fontSize: '0.95rem', textAlign: 'justify' }}>{desc ? desc.split('.')[0] + '.' : "Informação disponível."}</p>
            <div style={{ marginTop: '30px', textAlign: 'center', opacity: isHovered ? 1 : 0, transform: isHovered ? 'translateY(0)' : 'translateY(10px)', transition: 'all 0.5s ease', position: isHovered ? 'relative' : 'absolute' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: '900', color: '#FFCC00', letterSpacing: '2px', border: '1px solid rgba(255, 204, 0, 0.3)', padding: '10px 25px', borderRadius: '20px', background: 'rgba(255, 204, 0, 0.05)' }}>{t.more_label}</span>
            </div>
        </div>
    );
};

const GlobeSearch = ({ onSelect, lang }) => {
    const [query, setQuery] = useState('');
    const { isMobile } = useSettings();
    const t = translations[lang] || translations.pt;
    const results = useMemo(() => {
        if (query.length < 2) return [];
        return Object.entries(destinosData).filter(e => getTranslatedData(e[1], 'titulo', lang).toLowerCase().includes(query.toLowerCase())).map(e => ({ key: e[0], ...e[1] }));
    }, [query, lang]);
    return (
        <div style={{ position: 'absolute', top: '60px', left: '20px', zIndex: 200002, width: isMobile ? 'calc(100% - 40px)' : '350px', display: 'flex', flexDirection: 'column', gap: '8px', pointerEvents: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(10, 10, 10, 0.85)', backdropFilter: 'blur(20px)', borderRadius: '30px', border: '1px solid rgba(255, 255, 255, 0.2)', padding: '0 25px', height: '48px', boxSizing: 'border-box', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFCC00" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '12px' }}><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                <input type="text" placeholder={t.search_placeholder} value={query} onChange={(e) => setQuery(e.target.value)} style={{ width: '100%', border: 'none', background: 'transparent', outline: 'none', fontSize: '0.95rem', color: 'white', fontWeight: '600', letterSpacing: '0.5px' }} />
            </div>
            {results.length > 0 && (
                <div style={{ background: 'rgba(10, 10, 10, 0.95)', backdropFilter: 'blur(30px)', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', border: '1px solid rgba(255, 255, 255, 0.1)', marginTop: '5px' }}>
                    {results.map((data) => (
                        <div key={data.key} onClick={() => { onSelect(data); setQuery(''); }} style={{ padding: '12px 20px', cursor: 'pointer', color: 'white', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.9rem' }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 204, 0, 0.1)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>{getTranslatedData(data, 'titulo', lang)}</div>
                    ))}
                </div>
            )}
        </div>
    );
};

const HoverBackButton = ({ onClick }) => {
    const { settings } = useSettings();
    const t = translations[settings.idioma || 'pt'];
    const [isHovered, setIsHovered] = useState(false);
    return (
        <button onClick={onClick} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}
            style={{ position: 'absolute', top: '60px', right: '20px', height: '48px', padding: '0 25px', background: 'rgba(10, 10, 10, 0.85)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '30px', boxSizing: 'border-box', boxShadow: isHovered ? '0 10px 25px rgba(0,0,0,0.4)' : '0 5px 15px rgba(0,0,0,0.3)', cursor: 'pointer', fontWeight: '600', zIndex: 200001, transition: 'all 0.3s ease', display: 'flex', alignItems: 'center', gap: '12px', outline: 'none' }}>
            <span style={{ fontSize: '1.2rem', color: '#FFCC00', fontWeight: '900', lineHeight: 0 }}>✕</span> <span style={{ color: 'white', fontSize: '0.95rem', letterSpacing: '1px' }}>{t.back.toUpperCase()}</span>
        </button>
    );
};

const StreetViewModal = ({ coords, heading, onClose }) => {
const viewRef = useRef(null);
const { getFilterStyle } = useSettings();
useEffect(() => { if (window.google && viewRef.current) { new window.google.maps.StreetViewPanorama(viewRef.current, { position: coords, pov: { heading: heading || 0, pitch: 0 }, zoom: 1, addressControl: false, showRoadLabels: false }); } }, [coords, heading]);
return ( <div style={{ position: 'fixed', inset: 0, backgroundColor: 'black', zIndex: 200000, filter: getFilterStyle() }}> <HoverBackButton onClick={onClose} /> <div ref={viewRef} style={{ width: '100%', height: '100%' }} /> </div> );
};

const RockstarImage = ({ src, scale = 1 }) => (
<div style={{ width: '100%', height: '100%', overflow: 'hidden', background: '#0a0a0a', borderRadius: '4px', boxShadow: '0 20px 50px rgba(0,0,0,0.8)' }}><img src={src} alt="img" style={{ width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${scale})` }} /></div>
);

const DestinoPage = ({ dados }) => {
    const containerRef = useRef(null);
    const { converterDist, settings, isMobile } = useSettings();
    const [activeWidget, setActiveWidget] = useState(null);
    const [hoveredWidget, setHoveredWidget] = useState(null);
    const [scrollProgress, setScrollProgress] = useState(0);
    const [s1Prog, setS1Prog] = useState(0); const [s2Prog, setS2Prog] = useState(0);
    const [s3Prog, setS3Prog] = useState(0); const [s4Prog, setS4Prog] = useState(0); const [s5Prog, setS5Prog] = useState(0);
    const [bgColor, setBgColor] = useState('black');
    const [sectionColors, setSectionColors] = useState({});
    const natureImgs = useMemo(() => dados?.naturezaImages || [], [dados]);
    const flight = useMemo(() => getFlightInfo(dados.lat, dados.lng), [dados]);
    const lang = settings.idioma || 'pt';
    const T = translations[lang];

    const sections = useMemo(() => [
        { p: s1Prog, t: T.s1_title, h: T.s1_head, d: getTranslatedData(dados, 'textoHistoria', lang), img: dados.imgPrincipal, zig: true },
        { p: s2Prog, t: T.s2_title, h: T.s2_head, d: getTranslatedData(dados, 'textoGeografia', lang), img: dados.imgGeografia, zig: false },
        { p: s3Prog, t: T.s3_title, h: T.s3_head, d: getTranslatedData(dados, 'textoNatureza', lang), img: natureImgs[0], zig: true },
        { p: s4Prog, t: T.s4_title, h: T.s4_head, d: getTranslatedData(dados, 'textoAtmosfera', lang), img: natureImgs[1], zig: false },
        { p: s5Prog, t: T.s5_title, h: T.s5_head, d: getTranslatedData(dados, 'textoHorizontes', lang), img: natureImgs[2], zig: true }
    ], [s1Prog, s2Prog, s3Prog, s4Prog, s5Prog, dados, natureImgs, T, lang]);

    useEffect(() => { if (!dados) return; const extract = async () => { const targets = [ { id: 's1', url: dados.imgPrincipal }, { id: 's2', url: dados.imgGeografia }, { id: 's3', url: natureImgs[0] }, { id: 's4', url: natureImgs[1] }, { id: 's5', url: natureImgs[2] } ]; const extracted = {}; for (const item of targets) { try { const result = await fac.getColorAsync(item.url); extracted[item.id] = result.rgb; } catch { extracted[item.id] = 'black'; } } setSectionColors(extracted); }; extract(); }, [dados, natureImgs]);

    const requestRef = useRef(null);
    const handleScroll = (e) => {
        const s = e.target.scrollTop;
        const h = window.innerHeight;
        if (requestRef.current) return;
        requestRef.current = requestAnimationFrame(() => {
            setScrollProgress(Math.min(s / h, 1));
            const getP = (st, en) => (s >= st && s <= en ? (s - st) / (en - st) : s > en ? 1 : 0);
            setS1Prog(getP(h, h*2.5));
            setS2Prog(getP(h*3.5, h*5));
            setS3Prog(getP(h*6, h*7.5));
            setS4Prog(getP(h*8.5, h*10));
            setS5Prog(getP(h*11, h*12.5));
            if (s > h*11) setBgColor(sectionColors.s5);
            else if (s > h*8.5) setBgColor(sectionColors.s4);
            else if (s > h*6) setBgColor(sectionColors.s3);
            else if (s > h*3.5) setBgColor(sectionColors.s2);
            else if (s > h) setBgColor(sectionColors.s1);
            else setBgColor('black');
            requestRef.current = null;
        });
    };
    const toggleWidget = (e, widgetName) => { e.stopPropagation(); setActiveWidget(prev => (prev === widgetName ? null : widgetName)); };
    const transitionEffect = 'transform 0.5s cubic-bezier(0.25, 0.8, 0.25, 1), opacity 0.5s ease';
    const getTransform = (id) => (activeWidget === id ? 'scale(1.1)' : hoveredWidget === id ? 'scale(1.05)' : 'scale(1)');
    const getOpacity = (id) => (activeWidget && activeWidget !== id ? 0.5 : 1);

    return ( <div ref={containerRef} onScroll={handleScroll} style={{ width:'100%', height:'100vh', overflowY:'auto', background: bgColor, transition: 'background 1.5s ease' }}> {activeWidget && <div onClick={() => setActiveWidget(null)} style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 99, background: 'transparent' }} />} <div style={{ height: '100vh', position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}> <video src={dados.video} autoPlay loop muted playsInline style={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'cover', opacity: 1 - scrollProgress }} /> <div style={{ position:'absolute', width:'100%', height:'105%', background: 'linear-gradient(to bottom, transparent, black)', zIndex:1 }}></div> <div style={{ textAlign:'center', zIndex:10, opacity: 1 - scrollProgress * 2, padding: '0 20px', marginTop: isMobile ? '-80px' : '0' }}> <h1 className="titulo-outline" style={{ fontSize: isMobile ? '3rem' : '6rem', fontFamily: "'Bowlby One SC', sans-serif", margin:0, textTransform: 'uppercase', letterSpacing: '2px', color: 'transparent', lineHeight: isMobile ? '1.1' : '1' }}> {getTranslatedData(dados, 'titulo', lang)} </h1> <div style={{ margin: isMobile ? '10px auto' : '15px auto' }}><img src={`https://flagcdn.com/h40/${dados.lang}.png`} alt="flag" style={{ height: isMobile ? '18px' : '24px', borderRadius: '4px' }} /></div> <div style={{ display: 'inline-block' }}> <h3 style={{ fontSize: isMobile ? '2.5rem' : '5rem', fontFamily: "'Italianno', cursive", fontWeight: '400', margin: '0', color: '#eeeeee', paddingRight: '5px' }}> {getTranslatedData(dados, 'subtitulo', lang)} </h3> </div> </div> <div style={{ position:'absolute', bottom: isMobile ? '40px' : '50px', left:'0', width:'100%', padding:'0 5%', display:'flex', justifyContent: isMobile ? 'center' : 'space-between', alignItems: isMobile ? 'center' : 'flex-end', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? '20px' : '0', zIndex: 100, pointerEvents: 'none', boxSizing: 'border-box', transform: isMobile ? 'scale(0.85)' : 'scale(1)', transformOrigin: 'bottom center' }}> <div onMouseEnter={() => setHoveredWidget('clock')} onMouseLeave={() => setHoveredWidget(null)} onClick={(e) => toggleWidget(e, 'clock')} style={{ pointerEvents: 'auto', cursor: 'pointer', zIndex: activeWidget === 'clock' ? 101 : 1, transition: transitionEffect, transform: getTransform('clock'), opacity: getOpacity('clock') }}> <Clock timezone={dados.timezone} lang={dados.lang} /> </div> <div className="clock-widget" onMouseEnter={() => setHoveredWidget('flight')} onMouseLeave={() => setHoveredWidget(null)} onClick={(e) => toggleWidget(e, 'flight')} style={{ pointerEvents: 'auto', cursor: 'pointer', zIndex: activeWidget === 'flight' ? 101 : 1, transition: transitionEffect, transform: getTransform('flight'), opacity: getOpacity('flight') }}> <div className="clock-main-row"> <div style={{ width: '45px', height: '45px', position: 'relative', flexShrink: 0 }}> <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '110px', height: '110px', filter: 'brightness(0) invert(1)', opacity: 0.9 }}> <Lottie animationData={airplaneAnim} loop={true} style={{ width: '100%', height: '100%' }} /> </div> </div> <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center' }}> <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.8, color: 'white', marginBottom: '2px' }}>{T.fly_label}</span> <span style={{ fontSize: '2rem', fontWeight: '400', lineHeight: '0.9', color:'white' }}>{flight.time}</span> </div> </div> <div className="clock-details">{converterDist(flight.distRaw)} {T.dist_label}</div> </div> <div onMouseEnter={() => setHoveredWidget('weather')} onMouseLeave={() => setHoveredWidget(null)} onClick={(e) => toggleWidget(e, 'weather')} style={{ pointerEvents: 'auto', zIndex: activeWidget === 'weather' ? 101 : 1, cursor: 'pointer', transition: transitionEffect, transform: getTransform('weather'), opacity: getOpacity('weather') }}> <Weather lat={dados.lat} lng={dados.lng} lang={lang} /> </div> </div> </div> {sections.map((sec, idx) => sec.img && ( <div key={idx} style={{ height: '250vh', position: 'relative' }}> <div style={{ position: 'sticky', top: 0, height: '100vh', display: 'flex', flexDirection: isMobile ? 'column' : (sec.zig ? 'row' : 'row-reverse'), alignItems: 'center', padding: isMobile ? '40px 20px' : '0 12%', overflow: 'hidden', justifyContent: isMobile ? 'center' : 'space-between', gap: isMobile ? '30px' : '0' }}> <div style={{ width: isMobile ? '100%' : '35%', opacity: sec.p > 0.1 ? 1 : 0, transition: 'opacity 0.5s', textAlign: isMobile ? 'center' : 'left' }}> <span style={{ color: '#f2c94c', letterSpacing: '8px', fontSize: '0.7rem', fontWeight: 'bold' }}>{sec.t}</span> <h2 style={{ fontFamily: "'BBHBartleCustom', sans-serif", fontSize: isMobile ? '2.5rem' : '4.5rem', margin: '15px 0', textTransform: 'uppercase', lineHeight: '1' }}>{sec.h}</h2> <p style={{ fontSize: isMobile ? '1rem' : '1.25rem', lineHeight: '1.6', opacity: 0.7, textAlign: isMobile ? 'center' : 'justify' }}>{sec.d}</p> </div> <div style={{ width: isMobile ? '90%' : '50%', height: isMobile ? '40vh' : '70vh', position: 'relative' }}> <RockstarImage src={sec.img} scale={1 + sec.p * 0.1} /> {!isMobile && ( <div style={{ position: 'absolute', right: '20px', bottom: '30px', height: '80px', width: '3px', background: 'rgba(255,255,255,0.2)' }}><div style={{ width: '100%', height: `${sec.p * 100}%`, background: 'white' }} /></div> )} </div> </div> </div> ))} <RoteiroPage dados={dados} /> </div> ); };

const AppContent = () => {
    const { settings, getFilterStyle } = useSettings();
    const [menuOpen, setMenuOpen] = useState(false);
    const [currentPageKey, setCurrentPageKey] = useState('home');
    const [showMap, setShowMap] = useState(false);
    const [show360, setShow360] = useState(false);
    const [lastDestKey, setLastDestKey] = useState(null);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const globeRef = useRef();
    const [selectedGlobeLocation, setSelectedGlobeLocation] = useState(null);

    const nav = (k) => { setShowMap(false); setShow360(false); setMenuOpen(false); if (k !== 'home' && k !== 'viajar') setLastDestKey(k); setCurrentPageKey(k); window.scrollTo(0,0); };
    useEffect(() => { document.documentElement.style.filter = getFilterStyle(); document.documentElement.style.transition = 'filter 0.5s ease'; }, [getFilterStyle]);

    const handleNavigation = (data) => {
        const key = Object.keys(destinosData).find(k => destinosData[k].lat === data.lat && destinosData[k].lng === data.lng);
        setSelectedGlobeLocation({ ...data, key: key }); 
        
        if (globeRef.current && globeRef.current.flyTo) {
            globeRef.current.flyTo(data.lat, data.lng);
        }
    };

    const memoGlobe = useMemo(() => (
        <GoogleEarth 
            ref={globeRef} 
            className="google-earth-container" 
            markers={selectedGlobeLocation ? { [selectedGlobeLocation.key]: selectedGlobeLocation } : {}} 
            onMarkerClick={handleNavigation} 
        />
    ), [selectedGlobeLocation]);

    return (
        <div style={{ minHeight: '100vh', background: 'black', color: 'white' }}>
            <style>{` :fullscreen, ::backdrop { filter: ${getFilterStyle()}; } `}</style>
            {!settingsOpen && !showMap && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', zIndex: 99999 }}>
                    <Navbar menuOpen={menuOpen} setMenuOpen={setMenuOpen} setPage={nav} currentPageKey={currentPageKey} onOpenFlights={() => nav('viajar')} onOpenMap={() => setShowMap(true)} />
                    <MegaMenu menuOpen={menuOpen} setMenuOpen={setMenuOpen} setPage={nav} />
                </div>
            )}
            <div style={{ width: '100%', position: 'relative', zIndex: 1 }}>
                {showMap && (
                    <div style={{ position:'fixed', inset:0, background:'black', zIndex:200000 }}>
                        <HoverBackButton onClick={() => { setShowMap(false); setSelectedGlobeLocation(null); }} />
                        <GlobeSearch onSelect={handleNavigation} lang={settings.idioma} />
                        <GlobeInfoCard data={selectedGlobeLocation} lang={settings.idioma} onExpand={(key) => nav(key)} />
                        {memoGlobe}
                    </div>
                )}
                {show360 && destinosData[currentPageKey] && ( <StreetViewModal coords={destinosData[currentPageKey].coords} heading={destinosData[currentPageKey].heading} onClose={() => setShow360(false)} /> )}
                {(() => { 
                    if (currentPageKey === 'viajar') return <div style={{paddingTop:'100px'}}><FlightWidget destinoData={lastDestKey ? destinosData[lastDestKey] : null} onClose={() => nav('home')} /></div>; 
                    
                    if (currentPageKey === 'home') return (
                        <div style={{ width: '100%', display: 'block' }}> 
                            <IntroScroll openMenu={() => setMenuOpen(true)} /> 
                            <TopicsDetails /> 
                            
                            <div style={{ height: '100vh', width: '100%', position: 'relative', zIndex: 10, background: '#050505' }}>
                                <ErrorBoundary>
                                    <Suspense fallback={null}>
                                        {/* ✅ AQUI ESTÁ A CORREÇÃO: Passamos a função nav */}
                                        <ModelViewer onNavigate={nav} />
                                    </Suspense>
                                </ErrorBoundary>
                            </div>
                        </div>
                    ); 
                    
                    return <DestinoPage key={currentPageKey} dados={destinosData[currentPageKey]} />; 
                })()}
            </div>
            {currentPageKey === 'home' && !showMap && ( <SettingsButton isOpen={settingsOpen} setIsOpen={setSettingsOpen} /> )}
        </div>
    );
};

export default function App() { 
    return ( 
        <BrowserRouter>
            <SettingsProvider> 
                <AppContent /> 
            </SettingsProvider> 
        </BrowserRouter>
    ); 
}