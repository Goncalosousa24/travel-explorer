import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

const TrafficWidget = ({ coords, isMobile, lang }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [btnHover, setBtnHover] = useState(false);
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    
    const t = {
        pt: "TRÂNSITO EM TEMPO REAL",
        en: "REAL-TIME TRAFFIC",
        fr: "TRAFIC EN TEMPS RÉEL"
    }[lang];

    useEffect(() => {
        if (mapRef.current && coords && window.google) {
            if (mapInstanceRef.current && mapInstanceRef.current.getDiv() === mapRef.current) {
                mapInstanceRef.current.setCenter(coords);
                window.google.maps.event.trigger(mapInstanceRef.current, "resize");
                return;
            }

            const map = new window.google.maps.Map(mapRef.current, {
                center: coords,
                zoom: 13,
                disableDefaultUI: true,
                styles: [
                    { "elementType": "geometry", "stylers": [{ "color": "#212121" }] },
                    { "elementType": "labels.text.fill", "stylers": [{ "color": "#757575" }] },
                    { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#303030" }] },
                    { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#000000" }] }
                ]
            });
            const trafficLayer = new window.google.maps.TrafficLayer();
            trafficLayer.setMap(map);
            mapInstanceRef.current = map;
        }
    }, [coords, isExpanded]);

    const baseStyle = {
        borderRadius: '45px',
        overflow: 'hidden',
        transition: 'all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'rgba(17, 17, 17, 0.95)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.4)',
        boxShadow: 'inset 0 0 25px rgba(255, 255, 255, 0.1), 0 20px 50px rgba(0,0,0,0.5)',
        boxSizing: 'border-box',
        width: '100%',
        height: isMobile ? '300px' : '320px',
        position: 'relative'
    };

    const expandedStyle = {
        ...baseStyle,
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 999999,
        borderRadius: 0,
        border: 'none',
        transform: 'none',
        cursor: 'default',
        boxShadow: 'none'
    };

    const widgetContent = (
        <div 
            style={isExpanded ? expandedStyle : {
                ...baseStyle,
                backgroundColor: isHovered ? 'rgba(17, 17, 17, 0.85)' : 'rgba(255, 255, 255, 0.05)',
                border: isHovered ? '1px solid rgba(255, 255, 255, 1)' : '1px solid rgba(255, 255, 255, 0.4)',
                transform: isHovered ? 'scale(1.02)' : 'scale(1)',
                boxShadow: isHovered ? '0 25px 60px rgba(0,0,0,0.7)' : 'inset 0 0 25px rgba(255, 255, 255, 0.1), 0 20px 50px rgba(0,0,0,0.5)',
            }}
            onClick={() => !isExpanded && setIsExpanded(true)}
        >
            {/* ✅ CABEÇALHO CENTRADO (Visível apenas quando pequeno) */}
            {!isExpanded && (
                <div style={{ 
                    position: 'absolute',
                    top: '30px',
                    left: 0,
                    width: '100%', // Garante que ocupa a largura total para centrar
                    display: 'flex',
                    justifyContent: 'center', // Centro Horizontal
                    alignItems: 'center',
                    zIndex: 10,
                    pointerEvents: 'none'
                }}>
                    <span style={{ 
                        fontSize: '0.6rem', 
                        fontWeight: '800', 
                        color: '#FFCC00', 
                        letterSpacing: '2px', 
                        textTransform: 'uppercase',
                        textShadow: '0 2px 4px rgba(0,0,0,0.9)' // Sombra para leitura fácil sobre o mapa
                    }}>
                        {t}
                    </span>
                </div>
            )}

            {/* BOTÃO EXPANDIR / FECHAR */}
            <button 
                onClick={(e) => { 
                    e.stopPropagation(); 
                    setIsExpanded(!isExpanded); 
                }}
                onMouseEnter={() => setBtnHover(true)}
                onMouseLeave={() => setBtnHover(false)}
                title={isExpanded ? "Fechar Ecrã Inteiro" : "Expandir Mapa"}
                style={{
                    position: 'absolute',
                    top: isExpanded ? '30px' : '20px',
                    right: isExpanded ? '30px' : '20px',
                    width: isExpanded ? '50px' : '40px',
                    height: isExpanded ? '50px' : '40px',
                    borderRadius: '50%',
                    border: '1px solid rgba(255, 255, 255, 0.5)',
                    backgroundColor: btnHover ? '#FFCC00' : 'rgba(0, 0, 0, 0.6)',
                    color: btnHover ? '#000' : '#fff',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: isExpanded ? '1.5rem' : '1.2rem',
                    fontWeight: 'bold',
                    transition: 'all 0.3s ease',
                    zIndex: 1000000,
                    outline: 'none',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.5)'
                }}
            >
                {isExpanded ? '✕' : '⛶'}
            </button>

            {/* MAPA */}
            <div 
                ref={mapRef} 
                style={{ 
                    flex: 1, 
                    width: '100%', 
                    height: '100%',
                    filter: (isHovered || isExpanded) ? 'none' : 'grayscale(0.4) brightness(0.8)', 
                    transition: 'filter 0.4s ease' 
                }} 
            />
        </div>
    );

    return (
        <div 
            style={{ width: '100%', height: '100%' }} 
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {isExpanded ? createPortal(widgetContent, document.body) : widgetContent}
        </div>
    );
};

export default TrafficWidget;