import React, { useEffect, useRef } from 'react';

// Mudámos o nome para StreetViewModal para bater certo com o seu App.jsx
const StreetViewModal = ({ lat, lng, onClose }) => {
    const viewRef = useRef(null);

    useEffect(() => {
        // Proteção total: só corre se o Google existir, se houver o elemento e se houver números
        if (window.google && viewRef.current && lat && lng) {
            try {
                new window.google.maps.StreetViewPanorama(viewRef.current, {
                    position: { lat: parseFloat(lat), lng: parseFloat(lng) },
                    pov: { heading: 165, pitch: 0 },
                    zoom: 1,
                    addressControl: false,
                    showRoadLabels: false,
                    motionTracking: true,
                });
            } catch (err) {
                console.error("Erro interno do Google Maps:", err);
            }
        }
    }, [lat, lng]); // Reage sempre que as coordenadas mudarem

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'black', zIndex: 1000, display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.8)', borderBottom: '1px solid #333' }}>
                <span style={{ color: '#f2c94c', letterSpacing: '3px', fontWeight: 'bold' }}>MODO IMERSIVO 360º</span>
                <button onClick={onClose} style={{ background: 'transparent', border: '1px solid white', color: 'white', padding: '8px 20px', borderRadius: '20px', cursor: 'pointer' }}>FECHAR X</button>
            </div>
            <div ref={viewRef} style={{ flex: 1, background: '#0a0a0a' }}>
                {!window.google && (
                    <div style={{ height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#666' }}>
                        <p>⚠️ A carregar motor Google (Verifique a sua API Key no index.html)</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StreetViewModal;