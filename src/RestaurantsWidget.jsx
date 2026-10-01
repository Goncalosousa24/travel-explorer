import React, { useState, useEffect, useRef, useCallback } from 'react';
import Lottie from 'lottie-react';
import loadingCircleAnim from './assets/loadingcircle.json';

// --- COMPONENTE MAPA ---
const MiniMap = ({ location, placeName }) => {
    const mapRef = useRef(null);
    const containerRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const [isStreetViewActive, setIsStreetViewActive] = useState(false); // ✅ Estado

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            containerRef.current.requestFullscreen().catch(e => console.warn(e));
        } else {
            document.exitFullscreen();
        }
    };

    const closeStreetView = () => {
        if (mapInstanceRef.current) {
            const pano = mapInstanceRef.current.getStreetView();
            pano.setVisible(false);
        }
    };

    useEffect(() => {
        if (mapRef.current && location && window.google) {
            if (!mapInstanceRef.current) {
                const map = new window.google.maps.Map(mapRef.current, {
                    center: location, zoom: 16, mapTypeId: 'roadmap',
                    disableDefaultUI: true, 
                    fullscreenControl: false, panControl: false, rotateControl: false, scaleControl: false,
                    
                    // ✅ Controlo de Mapa (Aparece no normal)
                    mapTypeControl: true,
                    mapTypeControlOptions: { position: window.google.maps.ControlPosition.TOP_LEFT },

                    streetViewControl: true,
                    streetViewControlOptions: { position: window.google.maps.ControlPosition.LEFT_CENTER },

                    zoomControl: true,
                    zoomControlOptions: { position: window.google.maps.ControlPosition.RIGHT_BOTTOM }
                });

                // ✅ Controlo do Panorama
                const panorama = map.getStreetView();
                if (panorama) {
                    panorama.setOptions({
                        disableDefaultUI: true,
                        enableCloseButton: false,
                        visible: false
                    });
                    panorama.addListener("visible_changed", () => {
                        setIsStreetViewActive(panorama.getVisible());
                    });
                }

                new window.google.maps.Marker({ position: location, map: map, title: placeName, animation: window.google.maps.Animation.DROP });
                mapInstanceRef.current = map;
            } else {
                mapInstanceRef.current.setCenter(location);
            }
        }
    }, [location, placeName]);

    // Detetar Ecrã Inteiro (Mantido)
    useEffect(() => {
        const handleFullscreenChange = () => {
            const map = mapInstanceRef.current;
            if (!map || !window.google) return;
            if (document.fullscreenElement) {
                map.setOptions({ streetViewControlOptions: { position: window.google.maps.ControlPosition.RIGHT_CENTER } });
            } else {
                map.setOptions({ streetViewControlOptions: { position: window.google.maps.ControlPosition.LEFT_CENTER } });
            }
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    return (
        <div ref={containerRef} style={{ width: '100%', height: '100%', position: 'relative' }}>
            <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
            
            {/* ✅ BOTÃO VOLTAR (Só aparece no Street View) */}
            {isStreetViewActive && (
                <button 
                    onClick={closeStreetView} 
                    style={{ 
                        position: 'absolute', top: '10px', left: '10px', 
                        height: '35px', padding: '0 15px',
                        backgroundColor: '#000', color: '#fff', 
                        border: '1px solid rgba(255,255,255,0.3)', borderRadius: '10px', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center', 
                        cursor: 'pointer', fontSize: '0.7rem', fontWeight: '800', 
                        zIndex: 60, textTransform: 'uppercase', letterSpacing: '1px'
                    }}
                >
                    ← MAPA
                </button>
            )}

            <button onClick={toggleFullscreen} style={{ position: 'absolute', top: '10px', right: '10px', width: '35px', height: '35px', backgroundColor: '#000', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '1.2rem', zIndex: 50 }}>⛶</button>
        </div>
    );
};

const RestaurantsWidget = ({ location, isMobile, lang }) => {
    const [places, setPlaces] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isHovered, setIsHovered] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showMap, setShowMap] = useState(false);
    const timerRef = useRef(null);

    const t = {
        pt: { title: "RESTAURANTES & BARES", btnMap: "MAPA", btnPhoto: "FOTO" },
        en: { title: "RESTAURANTS & BARS", btnMap: "MAP", btnPhoto: "PHOTO" },
        fr: { title: "RESTAURANTS ET BARS", btnMap: "CARTE", btnPhoto: "PHOTO" }
    }[lang];

    useEffect(() => {
        const fetchPlaces = async () => {
            if (!window.google || !location) return;
            setIsLoading(true);
            try {
                const { places } = await window.google.maps.places.Place.searchByText({
                    textQuery: `top restaurants and bars in ${location}`,
                    fields: ['displayName', 'photos', 'editorialSummary', 'types', 'rating', 'location', 'formattedAddress'],
                    maxResultCount: 8
                });
                setPlaces(places || []);
            } catch (err) { console.error(err); } finally { setIsLoading(false); }
        };
        fetchPlaces();
    }, [location]);

    const getEnhancedDescription = (place) => {
        if (place.editorialSummary?.text) return place.editorialSummary.text;
        const ignoredTypes = ['restaurant', 'food', 'point_of_interest', 'establishment'];
        const specificType = place.types?.find(t => !ignoredTypes.includes(t));
        let cuisine = specificType ? specificType.replace(/_/g, ' ') : 'cozinha local';
        cuisine = cuisine.charAt(0).toUpperCase() + cuisine.slice(1);
        
        const address = place.formattedAddress?.split(',')[0] || location;
        const rating = place.rating ? place.rating : '';

        let templates = [];
        if (lang === 'pt') {
            templates = [
                `Especialidade: ${cuisine}. Localizado em ${address}. Classificação: ${rating}★.`,
                `Conhecido pela sua ${cuisine}, este restaurante em ${address} tem uma classificação de ${rating}★.`,
                `Desfrute de ${cuisine} em ${address}. Um local bem avaliado com ${rating}★.`,
                `Uma referência para ${cuisine} em ${address}. Classificado com ${rating}★ pelos clientes.`,
                `Localizado em ${address}, oferece uma experiência de ${cuisine} com classificação de ${rating}★.`
            ];
        } else if (lang === 'fr') {
            templates = [
                `Spécialité : ${cuisine}. Situé à ${address}. Note : ${rating}★.`,
                `Connu pour sa ${cuisine}, ce restaurant à ${address} a une note de ${rating}★.`,
                `Dégustez de la ${cuisine} à ${address}. Un lieu bien noté avec ${rating}★.`,
                `Une référence pour la ${cuisine} à ${address}. Classé ${rating}★ par les clients.`,
                `Situé à ${address}, offre une expérience de ${cuisine} avec une note de ${rating}★.`
            ];
        } else { // English
            templates = [
                `Specialty: ${cuisine}. Located at ${address}. Rating: ${rating}★.`,
                `Known for its ${cuisine}, this restaurant in ${address} has a ${rating}★ rating.`,
                `Enjoy ${cuisine} at ${address}. A well-rated spot with ${rating}★.`,
                `A reference for ${cuisine} in ${address}. Rated ${rating}★ by customers.`,
                `Located in ${address}, offering a ${cuisine} experience rated ${rating}★.`
            ];
        }

        return templates[currentIndex % templates.length];
    };

    const resetTimer = useCallback(() => {
        if (timerRef.current) clearInterval(timerRef.current);
        if (!isHovered && places.length > 0) {
            timerRef.current = setInterval(() => {
                setShowMap(false);
                setCurrentIndex((prev) => (prev + 1) % places.length);
            }, 6000);
        }
    }, [places.length, isHovered]);

    useEffect(() => { resetTimer(); return () => { if (timerRef.current) clearInterval(timerRef.current); }; }, [resetTimer]);

    const handleNext = (e) => { e.stopPropagation(); setShowMap(false); setCurrentIndex((prev) => (prev + 1) % places.length); };
    const handlePrev = (e) => { e.stopPropagation(); setShowMap(false); setCurrentIndex((prev) => (prev - 1 + places.length) % places.length); };
    const toggleMap = (e) => { e.stopPropagation(); setShowMap(!showMap); };

    const navBtnStyle = {
        width: '35px', height: '35px', borderRadius: '50%',
        backgroundColor: 'rgba(0, 0, 0, 0.6)', border: '1px solid rgba(255, 255, 255, 0.3)',
        color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1.2rem', cursor: 'pointer', transition: 'all 0.2s', paddingBottom: '3px'
    };

    const mapBtnStyle = {
        position: 'absolute', bottom: '15px', left: '50%', transform: 'translateX(-50%)',
        backgroundColor: '#000', color: '#fff', border: '1px solid rgba(255,255,255,0.3)',
        borderRadius: '20px', padding: '6px 16px', fontSize: '0.65rem', fontWeight: '800', cursor: 'pointer',
        textTransform: 'uppercase', letterSpacing: '1px', zIndex: 40, outline: 'none'
    };

    const cardStyle = {
        width: '100%', height: isMobile ? '350px' : '320px', 
        borderRadius: '45px', overflow: 'hidden', display: 'flex', flexDirection: 'column', padding: '25px', boxSizing: 'border-box',
        backgroundColor: isHovered ? '#000000' : 'rgba(255, 255, 255, 0.05)',
        border: isHovered ? '1px solid #FFCC00' : '1px solid rgba(255, 255, 255, 0.4)',
        backdropFilter: 'blur(30px)', WebkitBackdropFilter: 'blur(30px)',
        boxShadow: 'none', transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
        transform: isHovered ? 'scale(1.02)' : 'scale(1)', position: 'relative', cursor: 'default'
    };

    const currentPlace = places[currentIndex];
    const imageUri = currentPlace?.photos?.[0]?.getURI({ maxWidth: 1200 });

    return (
        <div style={{ width: '100%', height: '100%' }} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
            <div style={cardStyle}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px', width: '100%', zIndex: 20 }}>
                    <div style={{ fontSize: '0.6rem', fontWeight: '800', color: '#FFCC00', letterSpacing: '2px', textTransform: 'uppercase', textAlign: 'center' }}>{t.title}</div>
                </div>
                
                {isLoading ? (
                    <div style={{ margin: 'auto', width: '40px', filter: 'invert(1)' }}><Lottie animationData={loadingCircleAnim} loop={true} /></div>
                ) : currentPlace ? (
                    <div style={{ display: 'flex', flex: 1, width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ width: '50%', paddingRight: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', overflow: 'hidden' }}>
                            <div className="custom-scroll" style={{ display: 'flex', flexDirection: 'column', flex: 1, overflowY: 'auto', paddingRight: '5px' }}>
                                <h3 style={{ color: '#fff', fontSize: '1.3rem', fontWeight: '900', marginBottom: '10px', lineHeight: '1.2' }}>{currentPlace.displayName}</h3>
                                <div style={{display:'flex', alignItems:'center', gap:'5px', marginBottom:'15px', flexShrink: 0}}>
                                    <span style={{color:'#fbc531', fontWeight:'bold'}}>★ {currentPlace.rating}</span>
                                </div>
                                <p style={{ color: '#ccc', fontSize: '0.85rem', lineHeight: '1.6', margin: 0, fontStyle: 'italic' }}>
                                    {/* Passamos o currentIndex para variar a frase */}
                                    {getEnhancedDescription(currentPlace, currentIndex)}
                                </p>
                            </div>
                            <div style={{ display: 'flex', gap: '6px', marginTop: '15px', flexShrink: 0 }}>
                                {places.map((_, idx) => ( <div key={idx} style={{ width: idx === currentIndex ? '20px' : '6px', height: '4px', borderRadius: '2px', backgroundColor: idx === currentIndex ? '#FFCC00' : 'rgba(255,255,255,0.2)', transition: 'all 0.3s' }} /> ))}
                            </div>
                        </div>
                        <div style={{ width: '50%', height: '100%', position: 'relative', display: 'flex', flexDirection: 'column' }}>
                            <div style={{ flex: 1, width: '100%', borderRadius: '20px', overflow: 'hidden', position: 'relative' }}>
                                {showMap ? ( <MiniMap location={currentPlace.location} placeName={currentPlace.displayName} /> ) : ( <div style={{ width: '100%', height: '100%', backgroundImage: imageUri ? `url(${imageUri})` : '#333', backgroundSize: 'cover', backgroundPosition: 'center' }} /> )}
                                <button onClick={toggleMap} style={mapBtnStyle} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateX(-50%) scale(1.05)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateX(-50%) scale(1)'}>{showMap ? t.btnPhoto : t.btnMap}</button>
                            </div>
                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '15px' }}>
                                <div onClick={handlePrev} style={navBtnStyle} onMouseEnter={(e) => e.currentTarget.style.borderColor = '#fff'} onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'}>‹</div>
                                <div onClick={handleNext} style={navBtnStyle} onMouseEnter={(e) => e.currentTarget.style.borderColor = '#fff'} onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'}>›</div>
                            </div>
                        </div>
                    </div>
                ) : null}
            </div>
            <style>{` .custom-scroll::-webkit-scrollbar { width: 4px; } .custom-scroll::-webkit-scrollbar-track { background: rgba(255,255,255,0.05); } .custom-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.3); border-radius: 4px; } .custom-scroll::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.5); } @keyframes fadeContent { from { opacity: 0; } to { opacity: 1; } } `}</style>
        </div>
    );
};

export default RestaurantsWidget;