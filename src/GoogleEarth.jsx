import React, { useEffect, forwardRef, useImperativeHandle, useRef, useState } from 'react';
import Globe from 'react-globe.gl';

const GoogleEarth = forwardRef(({ className, markers, onMarkerClick }, ref) => {
  const globeRef = useRef();
  const containerRef = useRef();
  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });

  // Manter o globo responsivo e adaptar à janela
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        });
      }
    };
    
    // Setup inicial
    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Expor métodos para o App.jsx controlar a câmara
  useImperativeHandle(ref, () => ({
    flyTo: (lat, lng) => {
      if (globeRef.current) {
        // altitude 0.5 é um bom zoom para ver o país
        globeRef.current.pointOfView({ lat, lng, altitude: 0.5 }, 2000); // 2000ms de duração do voo
      }
    }
  }));

  // Converter os dados do formato de dicionário para array compatível com react-globe
  const markersArray = markers ? Object.entries(markers).map(([key, data]) => ({ ...data, key })) : [];

  return (
    <div 
      ref={containerRef}
      className={className} 
      style={{ width: '100vw', height: '100vh', position: 'absolute', top: 0, left: 0, background: 'black', zIndex: 0 }}
    >
      <Globe
        ref={globeRef}
        width={dimensions.width}
        height={dimensions.height}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
        bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
        backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
        labelsData={markersArray}
        labelLat={d => d.lat}
        labelLng={d => d.lng}
        labelText={d => d.titulo}
        labelSize={1.5}
        labelDotRadius={0.5}
        labelColor={() => '#FFCC00'}
        labelResolution={2}
        onLabelClick={d => onMarkerClick && onMarkerClick(d)}
        atmosphereColor="#3a228a"
        atmosphereAltitude={0.15}
      />
    </div>
  );
});

export default GoogleEarth;
