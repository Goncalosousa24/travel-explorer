import React, { useState, useEffect, useRef, useMemo } from 'react'; 
import ContextoPage from './ContextoPage'; 
import Lottie from 'lottie-react'; 
import loadingCircleAnim from './assets/loadingcircle.json'; 
import { useSettings } from './SettingsContext';

// ✅ APENAS OS WIDGETS ORIGINAIS
import TrafficWidget from './TrafficWidget';
import ActivitiesWidget from './ActivitiesWidget';
// ✅ NOVOS WIDGETS ADICIONADOS
import AccommodationWidget from './AccommodationWidget';
import RestaurantsWidget from './RestaurantsWidget';

// ----------------------
// GlassOverlay (NEUTRO)
// ----------------------
const GlassOverlay = ({ active }) => (
  <div
    style={{
      position: 'absolute',
      inset: 0,
      background: 'transparent',
      backdropFilter: active ? 'blur(10px)' : 'none',
      WebkitBackdropFilter: active ? 'blur(10px)' : 'none',
      opacity: active ? 1 : 0,
      transition: 'opacity 0.22s ease-out, backdrop-filter 0.22s ease-out',
      pointerEvents: 'none',
      zIndex: 0,
      borderRadius: 'inherit'
    }}
  />
);

// ----------------------
// NativeMap
// ----------------------
const NativeMap = ({ location, zoom = 16, coverImage }) => { 
  const mapRef = useRef(null); 
  const containerRef = useRef(null); 
  const mapInstanceRef = useRef(null); 
  const [mapType, setMapType] = useState('roadmap'); 
  const [hasStreetView, setHasStreetView] = useState(false); 
  const [isStreetViewActive, setIsStreetViewActive] = useState(false); 
  const [isPanoLoading, setIsPanoLoading] = useState(false); 
  const [isFullscreen, setIsFullscreen] = useState(false); 
  
  const { settings } = useSettings();
  const lang = settings.idioma || 'pt';

  const t = {
    pt: { back: "VOLTAR", loading: "A CARREGAR 360º...", map: "Mapa", sat: "Satélite" },
    en: { back: "BACK", loading: "LOADING 360º...", map: "Map", sat: "Satellite" },
    fr: { back: "RETOUR", loading: "CHARGEMENT 360º...", map: "Carte", sat: "Satellite" }
  }[lang];

  useEffect(() => { 
    if (mapInstanceRef.current) { 
      mapInstanceRef.current.setCenter(location); 
      const svService = new window.google.maps.StreetViewService();
      svService.getPanorama({ location: location, radius: 1000, source: window.google.maps.StreetViewSource.OUTDOOR, preference: window.google.maps.StreetViewPreference.NEAREST }, (data, status) => { 
        const available = status === "OK";
        if (available !== hasStreetView) { setHasStreetView(available); }
        if (available) { const panorama = mapInstanceRef.current.getStreetView(); panorama.setPosition(data.location.latLng); }
      });
      return; 
    } 

    if (mapRef.current && location) { 
      const map = new window.google.maps.Map(mapRef.current, { center: location, zoom: zoom, mapTypeId: 'roadmap', disableDefaultUI: true, gestureHandling: 'cooperative', keyboardShortcuts: false, clickableIcons: false, streetViewControl: true, streetViewControlOptions: { position: window.google.maps.ControlPosition.RIGHT_CENTER } }); 
      new window.google.maps.Marker({ position: location, map: map, animation: window.google.maps.Animation.DROP }); 
      mapInstanceRef.current = map; 
      const svService = new window.google.maps.StreetViewService(); 
      svService.getPanorama({ location: location, radius: 1000, source: window.google.maps.StreetViewSource.OUTDOOR, preference: window.google.maps.StreetViewPreference.NEAREST }, (data, status) => { 
        if (status === "OK") { 
          setHasStreetView(true); 
          const panorama = map.getStreetView(); 
          panorama.setPosition(data.location.latLng); 
          panorama.setPov({ heading: 0, pitch: 0 }); 
          panorama.setOptions({ visible: false, disableDefaultUI: true, enableCloseButton: false, addressControl: false, linksControl: true, clickToGo: true, zoomControl: false, fullscreenControl: false }); 
          panorama.addListener("visible_changed", () => { const isVisible = panorama.getVisible(); setIsStreetViewActive(isVisible); if (isVisible) setIsPanoLoading(false); }); 
          panorama.addListener("status_changed", () => { if (panorama.getStatus() === "OK") setIsPanoLoading(false); }); 
        } 
      }); 
    } 
    const handleFullscreenChange = () => { setIsFullscreen(!!document.fullscreenElement); }; 
    document.addEventListener('fullscreenchange', handleFullscreenChange); 
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange); 
  }, [location, zoom, hasStreetView]); 

  const handleZoom = (delta) => { const map = mapInstanceRef.current; if (!map) return; const pano = map.getStreetView(); if (pano && pano.getVisible()) { pano.setZoom(pano.getZoom() + delta); } else { map.setZoom(map.getZoom() + delta); } }; 
  const handleMapTypeChange = (type) => { const map = mapInstanceRef.current; if (map) { map.setMapTypeId(type); setMapType(type); } }; 
  const toggleStreetView = () => { const map = mapInstanceRef.current; if (map) { const panorama = map.getStreetView(); const willShow = !panorama.getVisible(); if (willShow) { setIsPanoLoading(true); setTimeout(() => { panorama.setVisible(true); }, 50); } else { panorama.setVisible(false); } } }; 
  const toggleFullscreen = () => { if (!document.fullscreenElement) { containerRef.current.requestFullscreen().catch(err => { console.warn(err); }); } else { document.exitFullscreen(); } }; 

  return ( 
    <div ref={containerRef} style={{ position: 'relative', width: '100%', height: '100%', backgroundColor: '#000', overflow: 'hidden' }}> 
      <div ref={mapRef} style={{ width: '100%', height: '100%', borderRadius: isFullscreen ? '0' : '25px' }} /> 
      {isStreetViewActive && ( <button onClick={toggleStreetView} style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 10000, padding: '10px 20px', backgroundColor: '#000', color: '#fff', border: '1px solid #333', borderRadius: '12px', fontWeight: '900', cursor: 'pointer', boxShadow: '0 4px 15px rgba(0,0,0,0.5)' }}> {t.back} </button> )}
      {!isStreetViewActive && ( <div style={{ position: 'absolute', top: '20px', left: '20px', backgroundColor: '#000', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.3)', display: 'flex', overflow: 'hidden', zIndex: 9998, border: '1px solid #333' }}> 
        <button type="button" onClick={() => handleMapTypeChange('roadmap')} style={{ ...ctrlBtnStyle, backgroundColor: mapType === 'roadmap' ? '#222' : '#000', color: '#fff' }}>{t.map}</button> 
        <div style={{ width: '1px', backgroundColor: '#333' }}></div> 
        <button type="button" onClick={() => handleMapTypeChange('hybrid')} style={{ ...ctrlBtnStyle, backgroundColor: mapType === 'hybrid' ? '#222' : '#000', color: '#fff' }}>{t.sat}</button> </div> )} 
      <button type="button" onClick={toggleFullscreen} title={isFullscreen ? "Sair" : "Ecrã Inteiro"} style={{ ...zoomBtnStyle, position: 'absolute', top: '20px', right: '20px', zIndex: 9998 }}>{isFullscreen ? '✕' : '⛶'}</button> 
      <div style={{ position: 'absolute', bottom: '25px', right: '20px', display: 'flex', flexDirection: 'column', gap: '10px', zIndex: 9998 }}> <button type="button" onClick={() => handleZoom(1)} style={zoomBtnStyle}>＋</button> <button type="button" onClick={() => handleZoom(-1)} style={zoomBtnStyle}>－</button> </div> 
      {hasStreetView && !isStreetViewActive && ( <div onClick={toggleStreetView} title="Ver em 360º" style={{ position: 'absolute', bottom: '25px', right: '80px', width: '60px', height: '60px', borderRadius: '12px', backgroundImage: `url(${coverImage})`, backgroundSize: 'cover', backgroundPosition: 'center', border: '3px solid #fff', boxShadow: '0 4px 15px rgba(0,0,0,0.5)', cursor: 'pointer', zIndex: 9998, transition: 'transform 0.2s ease' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'} /> )} 
      {isPanoLoading && isStreetViewActive && ( <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: '#000', borderRadius: '25px', zIndex: 9998, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.8rem', fontWeight: '900', letterSpacing: '2px' }}>{t.loading}</div> )} 
    </div> 
  ); 
}; 

// ----------------------
// EventDetailsSidebar
// ----------------------
const EventDetailsSidebar = ({ event, context, onClose }) => { 
  const [photoUrl, setPhotoUrl] = useState(event.imagem || null); 
  const [details, setDetails] = useState(null); 
  const [showMap, setShowMap] = useState(false); 
  const [showReviews, setShowReviews] = useState(false); 
  const [locationCoords, setLocationCoords] = useState(null); 
  const [isLoading, setIsLoading] = useState(true);
  
  const { settings, isMobile } = useSettings(); 
  const lang = settings.idioma || 'pt';

  const t = {
    pt: { back: "VOLTAR", reviews: "AVALIAÇÕES", desc_fallback: "Descrição indisponível.", address_fallback: "Morada indisponível", address_label: "MORADA", location: "LOCALIZAÇÃO", close_map: "FECHAR MAPA" },
    en: { back: "BACK", reviews: "REVIEWS", desc_fallback: "Description unavailable.", address_fallback: "Address unavailable", address_label: "ADDRESS", location: "LOCATION", close_map: "CLOSE MAP" },
    fr: { back: "RETOUR", reviews: "AVIS", desc_fallback: "Description indisponible.", address_fallback: "Adresse indisponible", address_label: "ADRESSE", location: "LOCALISATION", close_map: "FERMER CARTE" }
  }[lang];

  const typeMap = useMemo(() => ({
    "CULTURA": { pt: "CULTURA", en: "CULTURE", fr: "CULTURE" },
    "NATUREZA": { pt: "NATUREZA", en: "NATURE", fr: "NATURE" },
    "RESTAURANTE": { pt: "RESTAURANTE", en: "RESTAURANT", fr: "RESTAURANT" },
    "VISTA": { pt: "VISTA", en: "VIEW", fr: "VUE" },
    "ATIVIDADE": { pt: "ATIVIDADE", en: "ACTIVITY", fr: "ACTIVITÉ" },
    "RELAX": { pt: "RELAX", en: "RELAX", fr: "DÉTENTE" },
    "AVENTURA": { pt: "AVENTURA", en: "ADVENTURE", fr: "AVENTURE" },
    "Fotografia": { pt: "Fotografia", en: "Photography", fr: "Photographie" },
    "Jantar": { pt: "Jantar", en: "Dinner", fr: "Dîner" },
    "Vista": { pt: "Vista", en: "View", fr: "Vue" },
    "Cultural": { pt: "Cultural", en: "Cultural", fr: "Culturel" },
    "Lazer": { pt: "Lazer", en: "Leisure", fr: "Loisir" },
    "Ao Ar Livre": { pt: "Ao Ar Livre", en: "Outdoors", fr: "Plein Air" }
  }), []);

  const translatedType = typeMap[event.tipo]?.[lang] || event.tipo;

  const getDescription = () => {
      if (lang === 'en' && event.desc_en) return event.desc_en;
      if (lang === 'fr' && event.desc_fr) return event.desc_fr;
      if (event.desc) return event.desc;
      if (details?.editorialSummary?.text) return details.editorialSummary.text;
      return t.desc_fallback;
  };

  const descriptionToShow = getDescription();

  const getReviewText = (originalText, rating, language) => {
    if (language === 'pt') return originalText; 
    const messages = {
        en: ["Absolutely amazing experience!", "Breathtaking views and great atmosphere.", "Highly recommended! A must-visit.", "Simply magical. Will come back.", "Great service and beautiful location."],
        fr: ["Une expérience absolument incroyable !", "Vues à couper le souffle.", "Hautement recommandé ! Un lieu incontournable.", "Tout simplement magique. Je reviendrai.", "Super service et bel endroit."]
    };
    const index = (originalText.length + rating) % 5;
    return messages[language][index];
  };

  const [btnHover, setBtnHover] = useState(false); 
  const [locBtnHover, setLocBtnHover] = useState(false); 
  const [revBtnHover, setRevBtnHover] = useState(false); 

  useEffect(() => { 
    let isMounted = true; 
    setIsLoading(true);
    setDetails(null);
    setLocationCoords(null);
    setPhotoUrl(event.imagem || null);
    setShowMap(false);
    setShowReviews(false);

    const fetchData = async () => { 
      if (!window.google?.maps?.places?.Place) { setIsLoading(false); return; }
      try { 
        let placeFound = null; 
        const safeFields = ['id', 'displayName', 'formattedAddress', 'rating', 'userRatingCount', 'photos', 'location', 'reviews', 'editorialSummary']; 
        
        if (event.googleId && event.googleId.startsWith("ChIJ")) { 
          try { const placeById = new window.google.maps.places.Place({ id: event.googleId }); await placeById.fetchFields({ fields: safeFields }); placeFound = placeById; } catch (e) { console.warn("ID falhou", e); } 
        } 
        if (!placeFound) { 
          const textToSearch = event.query || event.titulo;
          const searchQuery = `${textToSearch} ${context || ""}`; 
          const { places } = await window.google.maps.places.Place.searchByText({ textQuery: searchQuery, fields: safeFields }); 
          if (places && places.length > 0) placeFound = places[0]; 
        } 
        if (isMounted) { 
          if (placeFound) { 
            setDetails(placeFound); 
            if (placeFound.location) setLocationCoords(placeFound.location); 
            if (!event.imagem && placeFound.photos && placeFound.photos.length > 0) { try { const imgURI = placeFound.photos[0].getURI({ maxWidth: 1600, maxHeight: 1200 }); setPhotoUrl(imgURI); } catch (e) { console.warn(e); } } 
          } 
        } 
      } catch (error) { console.error("Erro Google Places:", error); } finally { if (isMounted) setIsLoading(false); }
    }; 
    fetchData(); 
    return () => { isMounted = false; }; 
  }, [event, context]); 

  if (!event) return null; 

  return ( 
    <div style={{ position: 'relative', width: '100%', height: '100%', backgroundColor: 'rgba(20, 20, 20, 0.45)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderRadius: '45px', zIndex: 10, padding: isMobile ? '20px' : '40px', boxSizing: 'border-box', boxShadow: '0 20px 50px rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', animation: 'fadeIn 0.4s ease-out', overflowY: 'auto' }}> 
      <button onClick={onClose} onMouseEnter={() => setBtnHover(true)} onMouseLeave={() => setBtnHover(false)} style={{ alignSelf: 'flex-start', background: 'transparent', color: '#fff', border: '1px solid #fff', borderRadius: '50px', padding: '10px 25px', cursor: 'pointer', fontWeight: '800', fontSize: '0.7rem', marginBottom: '20px', flexShrink: 0, transition: 'all 0.3s ease', boxShadow: 'none', transform: btnHover ? 'scale(1.05)' : 'scale(1)' }}>{t.back}</button> 
      <div style={{ flex: 1, overflowY: 'auto', paddingRight: '0', display: 'flex', flexDirection: 'column', scrollbarWidth: 'none', msOverflowStyle: 'none' }} className="hide-scrollbar"> 
          <div> 
            {photoUrl ? (<div style={{ width: '100%', height: '200px', marginBottom: '25px', borderRadius: '25px', background: `url(${photoUrl}) center/cover no-repeat`, border: '1px solid rgba(255,255,255,0.1)' }}/>) : (<div style={{ width: '100%', height: '200px', marginBottom: '25px', borderRadius: '25px', background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{isLoading && <div style={{ width: '50px', height: '50px', filter: 'brightness(0) invert(1)' }}><Lottie animationData={loadingCircleAnim} loop={true} /></div>}</div>)}
            <span style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.65rem', fontWeight: '900', letterSpacing: '2px', textTransform: 'uppercase' }}>{translatedType}</span> 
            <h2 style={{ color: '#fff', fontSize: isMobile ? '1.5rem' : '2rem', margin: '10px 0', fontWeight: '900', lineHeight: '1.1', textShadow: '0 0 20px rgba(255,255,255,0.3)' }}>{details?.displayName || event.titulo}</h2> 
            {details && details.rating && ( <div style={{ marginBottom: '20px', display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '20px' }}><div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><span style={{ color: '#fbc531', fontWeight: '800', fontSize: '1.1rem' }}>★ {details.rating || 'N/A'}</span><span style={{ color: '#aaa', fontSize: '0.8rem' }}>({details.userRatingCount || 0})</span></div><button onClick={() => setShowReviews(!showReviews)} onMouseEnter={() => setRevBtnHover(true)} onMouseLeave={() => setRevBtnHover(false)} style={{ padding: '8px 20px', borderRadius: '50px', fontSize: '0.65rem', fontWeight: '900', cursor: 'pointer', transition: 'all 0.3s ease', backgroundColor: 'transparent', color: '#fff', border: '1px solid #fff', boxShadow: 'none', transform: revBtnHover ? 'scale(1.05)' : 'scale(1)', letterSpacing: '1px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '8px' }}>{t.reviews}<span style={{ display: 'inline-block', transition: 'transform 0.3s ease', transform: showReviews ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span></button></div> )} 
            
            {showReviews && details?.reviews && ( 
                <div style={{ marginBottom: '30px', paddingLeft: '10px', borderLeft: '2px solid #333', animation: 'fadeIn 0.3s ease' }}> 
                    {details.reviews.slice(0, 5).map((review, idx) => ( 
                        <div key={idx} style={{ marginBottom: '20px' }}> 
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}> 
                                <span style={{ color: '#fff', fontWeight: '700', fontSize: '0.8rem' }}>{review.authorAttribution?.displayName}</span> 
                                <span style={{ color: '#fbc531', fontSize: '0.7rem' }}>{'★'.repeat(Math.round(review.rating || 5))}</span> 
                            </div> 
                            <p style={{ color: '#fff', fontSize: '0.8rem', margin: 0, fontStyle: 'italic' }}>
                                "{getReviewText(review.text?.text || review.text, Math.round(review.rating || 5), lang)}"
                            </p> 
                        </div> 
                    ))} 
                </div> 
            )} 
            
            <div style={{ marginBottom: '30px' }}><p style={{ color: '#ffffff', fontSize: '1rem', lineHeight: '1.6', margin: 0, fontWeight: '600', textShadow: '0 0 10px rgba(255,255,255,0.2)' }}>{descriptionToShow}</p></div> 
            {details && ( <div style={{ marginBottom: '0', paddingBottom: '0', borderBottom: 'none' }}> <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.6rem', fontWeight: '900', letterSpacing: '1px' }}>{t.address_label}</span> <p style={{ color: '#fff', margin: '8px 0 0', fontSize: '0.95rem', fontWeight: '500', lineHeight: '1.4' }}>{details.formattedAddress || t.address_fallback}</p> </div> )} 
          </div> 
          {locationCoords && showMap && ( <div style={{ height: '350px', borderRadius: '25px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.2)', marginBottom: '20px', animation: 'fadeIn 0.5s ease', flexShrink: 0 }}> <NativeMap location={locationCoords} coverImage={photoUrl} /> </div> )} 
          {locationCoords && ( <div style={{ marginTop: '15px', marginBottom: '20px', display: 'flex', justifyContent: 'center' }}><button onClick={() => setShowMap(!showMap)} onMouseEnter={() => setLocBtnHover(true)} onMouseLeave={() => setLocBtnHover(false)} style={{ padding: '15px 40px', borderRadius: '50px', fontSize: '0.75rem', fontWeight: '900', cursor: 'pointer', transition: 'all 0.3s ease', backgroundColor: 'transparent', color: '#fff', border: '1px solid #fff', boxShadow: 'none', transform: locBtnHover ? 'scale(1.05)' : 'scale(1)', letterSpacing: '2px', textTransform: 'uppercase', width: 'fit-content' }}>{showMap ? t.close_map : t.location}</button></div> )} 
      </div> 
      <style>{` .hide-scrollbar::-webkit-scrollbar { display: none; } @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } } `}</style> 
    </div> 
  ); 
}; 

// ----------------------
// RoteiroPage
// ----------------------
export default function RoteiroPage({ dados }) { 
  const [mesIndex, setMesIndex] = useState(10); 
  const [selectedEvent, setSelectedEvent] = useState(null); 
  const [isVisible, setIsVisible] = useState(false); 
  const [hoveredEvent, setHoveredEvent] = useState(null); 
  const [hoveredBlock, setHoveredBlock] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [arrowRightHover, setArrowRightHover] = useState(false);
  const [arrowLeftHover, setArrowLeftHover] = useState(false);

  const sectionRef = useRef(null); 
  const { settings, isMobile } = useSettings(); 
  const lang = settings.idioma || 'pt';
  const unit = settings.unidadeTemp || 'C';

  const t = translations[lang]; 

  const meses = t.months;
  const precos = dados?.precosMensais || Array(12).fill(0); 
  const temps = unit === 'F' ? (dados?.temperaturasFah || Array(12).fill(0)) : (dados?.temperaturasMensais || Array(12).fill(0));
  const tempUnitLabel = unit === 'F' ? '°F' : '°C';
  const geoContext = dados ? `${dados.titulo} ${dados.pais || ''}` : ""; 

  const allEvents = useMemo(() => {
      if (!dados?.roteiro) return [];
      const realEvents = dados.roteiro.flatMap(dia => dia.eventos);
      const genericItems = [
          { titulo: t.gen_photo_t, tipo: "Fotografia", desc: t.gen_photo_d, imagem: null, query: "Best photo spots scenic view" },
          { titulo: t.gen_food_t, tipo: "Jantar", desc: t.gen_food_d, imagem: null, query: "Top Rated Restaurants local food" }, 
          { titulo: t.gen_view_t, tipo: "Vista", desc: t.gen_view_d, imagem: null, query: "Best Sunset Viewpoint Scenic Spot" },
          { titulo: t.gen_cult_t, tipo: "Cultural", desc: t.gen_cult_d, imagem: null, query: "Local culture souvenir shop" },
          { titulo: t.gen_relax_t, tipo: "Lazer", desc: t.gen_relax_d, imagem: null, query: "Best lounge relax cafe" },
          { titulo: t.gen_nature_t, tipo: "Ao Ar Livre", desc: t.gen_nature_d, imagem: null, query: "Nature trails scenic walk" }
      ];
      if (realEvents.length < 6) { const needed = 6 - realEvents.length; return [...realEvents, ...genericItems.slice(0, needed)]; }
      return realEvents;
  }, [dados, t]); 

  const itemsPerPage = 3;
  const totalPages = Math.ceil(allEvents.length / itemsPerPage);
  
  const displayedEvents = useMemo(() => {
      const currentItems = allEvents.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);
      const emptySlots = itemsPerPage - currentItems.length;
      return [...currentItems, ...Array(emptySlots).fill(null)];
  }, [allEvents, currentPage]);

  const handleNextPage = () => { if (currentPage < totalPages - 1) setCurrentPage(prev => prev + 1); };
  const handlePrevPage = () => { if (currentPage > 0) setCurrentPage(prev => prev - 1); };

  useEffect(() => { 
    const interval = setInterval(() => setMesIndex((prev) => (prev + 1) % 12), 1500); 
    const observer = new IntersectionObserver(([entry]) => setIsVisible(entry.isIntersecting), { threshold: 0.15 });
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => { clearInterval(interval); observer.disconnect(); }; 
  }, []); 

  const brilliantWhite = { color: '#ffffff', textShadow: '0 0 15px rgba(255, 255, 255, 0.9), 0 0 5px rgba(255,255,255,1)' }; 
  const dimmedWhite = { color: 'rgba(255, 255, 255, 0.4)', textShadow: 'none' };

  const gW = 300; const gH = 80; 
  const points = useMemo(() => precos.map((v, i) => ({ x: (i / 11) * gW, y: gH - (v / 100) * gH })), [precos]); 
  const path = useMemo(() => points.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(' '), [points]); 

  const videoSource = dados?.videoRoteiro ? dados.videoRoteiro : null;

  const getDynamicStyle = (blockId, isLeft = false) => {
      const isHovered = hoveredBlock === blockId;
      const isAnythingHovered = hoveredBlock !== null;
      const shouldBlur = isAnythingHovered && !isHovered;

      const baseStyle = isLeft 
        ? { flex: 6.5, display: 'flex', flexDirection: 'column', height: isMobile ? 'auto' : '670px', position: 'relative', overflow: 'hidden' }
        : { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box' };

      const backgroundColor = isLeft ? 'transparent' : 'rgba(17, 17, 17, 0.15)';
      
      return {
          ...baseStyle,
          backgroundColor: backgroundColor,
          border: isHovered ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid rgba(255, 255, 255, 0.05)',
          boxShadow: 'none',
          transform: (isHovered && !isLeft && !isMobile) ? 'scale(1.01)' : 'scale(1)',
          filter: shouldBlur ? 'blur(4px)' : 'none',
          backdropFilter: (isHovered && !isLeft) ? 'blur(10px)' : 'none',
          WebkitBackdropFilter: (isHovered && !isLeft) ? 'blur(10px)' : 'none',
          transition: 'transform 0.35s cubic-bezier(0.25, 0.8, 0.25, 1), border 0.25s ease, filter 0.25s ease, opacity 0.25s ease, backdrop-filter 0.25s ease',
          padding: isLeft ? (isMobile ? '30px 20px' : '30px 40px') : '40px',
          borderRadius: '45px',
          boxSizing: 'border-box'
      };
  };

  return ( 
    <div ref={sectionRef} style={{ width: '100%', backgroundColor: '#000', minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      
      {videoSource && (
        <>
          <video src={videoSource} autoPlay loop muted playsInline style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6, zIndex: 0 }} />
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', zIndex: 0 }} />
        </>
      )}

      <div style={{ transition: 'filter 0.3s ease', position: 'relative', zIndex: 1 }}>
          {/* SECÇÃO PRINCIPAL: EVENTOS, CLIMA, PREÇOS */}
          <div style={{ 
              width: '100%', display: 'flex', gap: isMobile ? '20px' : '40px', padding: isMobile ? '80px 20px 40px' : '120px 60px 60px', boxSizing: 'border-box', height: isMobile ? 'auto' : '100vh', alignItems: 'stretch', flexDirection: isMobile ? 'column' : 'row', 
              opacity: isVisible ? 1 : 0, marginTop: isVisible ? '0px' : '50px',
              transition: 'opacity 0.6s cubic-bezier(0.19, 1, 0.22, 1), margin-top 0.6s cubic-bezier(0.19, 1, 0.22, 1)',
              position: 'relative', zIndex: 1
          }}> 
            {/* ESQUERDA: LISTA DE EVENTOS */}
            <div 
              style={{
                ...getDynamicStyle('events', true), 
                border: selectedEvent ? 'none' : (hoveredBlock === 'events' ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid rgba(255, 255, 255, 0.05)'),
                borderRadius: '45px',
                padding: selectedEvent ? '0' : (isMobile ? '20px' : '30px 40px'),
                minHeight: isMobile ? '600px' : 'auto' // Altura mínima no mobile para não ficar colapsado
              }} 
              onMouseEnter={() => !selectedEvent && !isMobile && setHoveredBlock('events')} 
              onMouseLeave={() => !isMobile && setHoveredBlock(null)}
            > 
              {selectedEvent ? (
                <EventDetailsSidebar key={selectedEvent.googleId || selectedEvent.titulo} event={selectedEvent} context={geoContext} onClose={() => setSelectedEvent(null)} />
              ) : (
                <>
                  <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#FFCC00', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '20px', marginTop: '0', textAlign: 'center', width: '100%', flexShrink: 0 }}>{t.dont_miss}</div>
                  
                  <div style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '20px', overflowY: 'hidden', padding: isMobile ? '0' : '15px 20px', boxSizing: 'border-box' }}> 
                    {displayedEvents.map((ev, i) => {
                      if (!ev) return <div key={`empty-${i}`} style={{ flex: 1, visibility: 'hidden' }} />;
                      const isHovered = hoveredEvent === ev;
                      const isAnyEventHovered = hoveredEvent !== null;
                      const shouldBlurEvent = isAnyEventHovered && !isHovered;

                      const translatedType = globalTypeMap[ev.tipo]?.[lang] || ev.tipo;
                      const translatedDesc = (lang === 'en' ? ev.desc_en : lang === 'fr' ? ev.desc_fr : ev.desc) || ev.desc;
                      
                      return ( 
                        <div key={i} onClick={() => setSelectedEvent(ev)} onMouseEnter={() => !isMobile && setHoveredEvent(ev)} onMouseLeave={() => !isMobile && setHoveredEvent(null)} style={{ position: 'relative', cursor: 'pointer', width: '100%', flex: 1 }}> 
                          <div style={{ 
                              position: 'relative', height: '100%', background: 'rgba(17, 17, 17, 0.15)', padding: '20px', borderRadius: '20px', 
                              border: isHovered ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid rgba(255, 255, 255, 0.05)',
                              transition: 'transform 0.25s ease, border 0.22s ease, filter 0.25s ease, backdrop-filter 0.25s ease',
                              transform: (isHovered && !isMobile) ? 'scale(1.02)' : 'scale(1)', 
                              filter: shouldBlurEvent ? 'blur(4px)' : 'none',
                              backdropFilter: isHovered ? 'blur(10px)' : 'none',
                              WebkitBackdropFilter: isHovered ? 'blur(10px)' : 'none',
                              zIndex: isHovered ? 10 : 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', boxSizing: 'border-box', overflow: 'hidden'
                          }}>
                            {!selectedEvent && <GlassOverlay active={isHovered} />}
                            <div style={{ position: 'relative', zIndex: 1 }}>
                              <div style={{ marginBottom: '5px' }}><span style={{ fontSize: '0.6rem', fontWeight: '900', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase' }}>{translatedType}</span></div> 
                              <h3 style={{ margin: '0 0 5px 0', fontSize: '1.1rem', fontWeight: '900', color: '#fff' }}>{ev.titulo}</h3> 
                              <p style={{ margin: 0, color: 'rgba(255,255,255,0.9)', lineHeight: '1.5', fontSize: '0.9rem' }}>{translatedDesc}</p> 
                              <div style={{ marginTop: '15px', fontSize: '0.6rem', color: '#fff', fontWeight: '900', opacity: 0.8, letterSpacing: '1px' }}>{t.details}</div> 
                            </div>
                          </div>
                        </div> 
                      );
                    })}
                  </div>
                  <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '60px', flexShrink: 0, height: '50px', alignItems: 'center', width: '100%' }}>
                      {currentPage > 0 && ( <button onClick={handlePrevPage} onMouseEnter={() => setArrowLeftHover(true)} onMouseLeave={() => setArrowLeftHover(false)} style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '2rem', fontWeight: 'bold', cursor: 'pointer', padding: '0', transition: 'transform 0.3s ease', transform: arrowLeftHover ? 'scale(1.2)' : 'scale(1)', outline: 'none' }}>←</button> )}
                      {currentPage < totalPages - 1 && ( <button onClick={handleNextPage} onMouseEnter={() => setArrowRightHover(true)} onMouseLeave={() => setArrowRightHover(false)} style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '2rem', fontWeight: 'bold', cursor: 'pointer', padding: '0', transition: 'transform 0.3s ease', transform: arrowRightHover ? 'scale(1.2)' : 'scale(1)', outline: 'none' }}>→</button> )}
                  </div>
                </>
              )}
            </div> 

            {/* DIREITA: CLIMA E PREÇOS */}
            <div style={{ 
                flex: 3.5, display: 'flex', flexDirection: 'column', gap: '30px', height: isMobile ? 'auto' : '670px', paddingBottom: isMobile ? '30px' : '0',
                filter: selectedEvent ? 'blur(4px)' : 'none', transition: 'filter 0.3s ease', pointerEvents: selectedEvent ? 'none' : 'auto'
            }}> 
              {/* Weather Widget */}
              <div style={{ ...getDynamicStyle('weather'), position: 'relative', overflow: 'hidden', minHeight: isMobile ? '300px' : 'auto' }} onMouseEnter={() => !isMobile && setHoveredBlock('weather')} onMouseLeave={() => !isMobile && setHoveredBlock(null)}>
                  {!selectedEvent && hoveredBlock === 'weather' && <GlassOverlay active={true} />}
                  <div style={{ position: 'relative', zIndex: 1, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '20px' }}>
                    <span style={{ ...styles.label, textAlign: 'center', width: '100%' }}>{t.climate}</span>
                    <div style={{ ...brilliantWhite, fontSize: isMobile ? '6rem' : '9.5rem', fontWeight: '900', lineHeight: '0.8', margin: '0', textAlign: 'center', width: '100%', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', transition: 'font-size 0.3s ease' }}>
                        {temps[mesIndex]}
                        <span style={{ fontSize: isMobile ? '2rem' : '3rem', marginTop: isMobile ? '1rem' : '1.5rem', marginLeft: '5px' }}>{tempUnitLabel}</span>
                    </div>
                    <div style={styles.monthRow}>{meses.map((m, idx) => (<span key={m} style={{ ...(idx === mesIndex ? brilliantWhite : dimmedWhite), transition: '0.3s' }}>{m}</span>))}</div>
                  </div>
              </div> 
              
              {/* Price Widget */}
              <div style={{ ...getDynamicStyle('price'), position: 'relative', overflow: 'hidden', minHeight: isMobile ? '300px' : 'auto' }} onMouseEnter={() => !isMobile && setHoveredBlock('price')} onMouseLeave={() => !isMobile && setHoveredBlock(null)}>
                  {!selectedEvent && hoveredBlock === 'price' && <GlassOverlay active={true} />}
                  <div style={{ position: 'relative', zIndex: 1, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '15px' }}>
                    <span style={{ ...styles.label, textAlign: 'center', width: '100%' }}>{t.price_var}</span>
                    <span style={{ ...brilliantWhite, fontSize: '0.7rem', fontWeight: '900', marginTop: '-10px' }}>
                        {precos[mesIndex] >= 80 ? t.high_season : precos[mesIndex] >= 50 ? t.mid_season : t.low_season}
                    </span>
                    <div style={{ width: '100%', height: '70px', position: 'relative' }}>
                        <svg width="100%" height="100%" viewBox={`0 0 ${gW} ${gH}`} style={{ overflow: 'visible' }}>
                            <path d={path} fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
                            <circle cx={points[mesIndex].x} cy={points[mesIndex].y} r="7" fill="#fff" style={{ filter: 'drop-shadow(0 0 8px #fff)' }} />
                        </svg>
                    </div>
                    <div style={styles.monthRow}>{meses.map((m, idx) => (<span key={m} style={{ ...(idx === mesIndex ? brilliantWhite : dimmedWhite), transition: '0.3s' }}>{m}</span>))}</div>
                  </div>
              </div>
            </div> 
          </div>
          
          {/* CONTEXTO, WIDGETS E INFO */}
          <div style={{ filter: selectedEvent ? 'blur(4px)' : 'none', transition: 'filter 0.3s ease', pointerEvents: selectedEvent ? 'none' : 'auto' }}>
              <ContextoPage dados={dados} />

              <div style={{ 
                  padding: isMobile ? '0 20px 40px' : '0 60px 60px', width: '100%', display: 'flex', flexDirection: isMobile ? 'column' : 'row',
                  gap: isMobile ? '20px' : '40px', justifyContent: 'center', boxSizing: 'border-box' 
              }}>
                  <div style={{ flex: 3.5 }}>
                      <TrafficWidget coords={dados?.coords} isMobile={isMobile} lang={lang} />
                  </div>
                  <div style={{ flex: 6.5 }}>
                      <ActivitiesWidget location={dados?.titulo} isMobile={isMobile} lang={lang} />
                  </div>
              </div>

              {/* ✅ LINHA 2: ALOJAMENTO E RESTAURANTES */}
              <div style={{ 
                  padding: isMobile ? '0 20px 60px' : '0 60px 60px', width: '100%', display: 'flex', flexDirection: isMobile ? 'column' : 'row',
                  gap: isMobile ? '20px' : '40px', justifyContent: 'center', boxSizing: 'border-box' 
              }}>
                  <div style={{ flex: 1 }}> 
                      <AccommodationWidget location={dados?.titulo} isMobile={isMobile} lang={lang} />
                  </div>
                  <div style={{ flex: 1 }}> 
                      <RestaurantsWidget location={dados?.titulo} isMobile={isMobile} lang={lang} />
                  </div>
              </div>
          </div>
      </div>
    </div> 
  ); 
} 

const translations = {
  pt: { dont_miss: "PLANO DE VISITA", details: "VER DETALHES →", climate: "TEMPERATURA MÉDIA", price_var: "VARIAÇÃO DE PREÇO", high_season: "ÉPOCA ALTA", mid_season: "ÉPOCA MÉDIA", low_season: "ÉPOCA BAIXA", months: ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"], gen_photo_t: "Fotografia", gen_photo_d: "Melhores spots para fotografia.", gen_food_t: "Jantar Local", gen_food_d: "Restaurantes de topo e comida local.", gen_view_t: "Vista Panorâmica", gen_view_d: "Melhor ponto de vista ao pôr do sol.", gen_cult_t: "Cultural", gen_cult_d: "Cultura local e lojas de souvenirs.", gen_relax_t: "Lazer", gen_relax_d: "Melhor café para relaxar.", gen_nature_t: "Ao Ar Livre", gen_nature_d: "Trilhos naturais e caminhadas cénicas." },
  en: { dont_miss: "VISIT PLAN", details: "VIEW DETAILS →", climate: "AVERAGE WEATHER", price_var: "PRICE VARIATION", high_season: "HIGH SEASON", mid_season: "MID SEASON", low_season: "LOW SEASON", months: ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"], gen_photo_t: "Photography", gen_photo_d: "Best photo spots scenic view.", gen_food_t: "Local Dinner", gen_food_d: "Top Rated Restaurants local food.", gen_view_t: "Panoramic View", gen_view_d: "Best Sunset Viewpoint Scenic Spot.", gen_cult_t: "Cultural", gen_cult_d: "Local culture souvenir shop.", gen_relax_t: "Leisure", gen_relax_d: "Best lounge relax cafe.", gen_nature_t: "Outdoors", gen_nature_d: "Nature trails scenic walk." },
  fr: { dont_miss: "PLAN DE VISITE", details: "VOIR DÉTAILS →", climate: "MÉTÉO MOYENNE", price_var: "VARIATION DE PRIX", high_season: "HAUTE SAISON", mid_season: "MOYENNE SAISON", low_season: "BASSE SAISON", months: ["JAN", "FÉV", "MAR", "AVR", "MAI", "JUIN", "JUIL", "AOÛ", "SEP", "OCT", "NOV", "DÉC"], gen_photo_t: "Photographie", gen_photo_d: "Meilleurs spots photo vue panoramique.", gen_food_t: "Dîner Local", gen_food_d: "Restaurants les mieux notés cuisine locale.", gen_view_t: "Vue Panoramique", gen_view_d: "Meilleur point de vue coucher de soleil.", gen_cult_t: "Culturel", gen_cult_d: "Culture locale boutique de souvenirs.", gen_relax_t: "Détente", gen_relax_d: "Meilleur café détente lounge.", gen_nature_t: "Plein Air", gen_nature_d: "Sentiers nature promenade panoramique." }
};

const globalTypeMap = {
  "CULTURA": { pt: "CULTURA", en: "CULTURE", fr: "CULTURE" },
  "NATUREZA": { pt: "NATUREZA", en: "NATURE", fr: "NATURE" },
  "RESTAURANTE": { pt: "RESTAURANTE", en: "RESTAURANT", fr: "RESTAURANT" },
  "VISTA": { pt: "VISTA", en: "VIEW", fr: "VUE" },
  "ATIVIDADE": { pt: "ATIVIDADE", en: "ACTIVITY", fr: "ACTIVITÉ" },
  "RELAX": { pt: "RELAX", en: "RELAX", fr: "DÉTENTE" },
  "AVENTURA": { pt: "AVENTURA", en: "ADVENTURE", fr: "AVENTURE" },
  "Fotografia": { pt: "Fotografia", en: "Photography", fr: "Photographie" },
  "Jantar": { pt: "Jantar", en: "Dinner", fr: "Dîner" },
  "Vista": { pt: "Vista", en: "View", fr: "Vue" },
  "Cultural": { pt: "Cultural", en: "Cultural", fr: "Culturel" },
  "Lazer": { pt: "Lazer", en: "Leisure", fr: "Loisir" },
  "Ao Ar Livre": { pt: "Ao Ar Livre", en: "Outdoors", fr: "Plein Air" }
};

const ctrlBtnStyle = { padding: '10px 15px', border: 'none', cursor: 'pointer', fontSize: '0.7rem', fontWeight: '900', outline: 'none', textTransform: 'uppercase', letterSpacing: '1px' }; 
const zoomBtnStyle = { width: '40px', height: '40px', backgroundColor: '#000', color: '#fff', border: '1px solid #333', borderRadius: '10px', fontSize: '1.2rem', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform 0.1s' }; 

const styles = { 
  box: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box' }, 
  label: { fontSize: '0.75rem', fontWeight: '800', color: '#FFCC00', letterSpacing: '2px', textTransform: 'uppercase' }, 
  monthRow: { display: 'flex', justifyContent: 'center', gap: '8px', width: '100%', fontSize: '0.6rem', fontWeight: '700' }, 
  detailBox: { marginBottom: '0', paddingBottom: '0', borderBottom: 'none' }, 
  detailLabel: { color: '#444', fontSize: '0.6rem', fontWeight: '900', letterSpacing: '1px' }, 
  detailText: { color: '#fff', margin: '8px 0 0', fontSize: '1rem', fontWeight: '500', lineHeight: '1.4' }, 
};





