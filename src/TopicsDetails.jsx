import React, { useEffect, useState, useRef, useLayoutEffect } from 'react';
import { useSettings } from './SettingsContext'; 

// Sequence for Desktop Animation
const VISUAL_SEQUENCE = [4, 5, 2, 1, 0, 3];
const DOT_ANGLES = [240, 180, 120, 300, 0, 60];

const TopicsDetails = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeIndex, setActiveIndex] = useState(5); 

  const rotatingLineRef = useRef(null);
  const sectionRef = useRef(null);
  const animationRef = useRef(null);
  const videoRef = useRef(null);
  const dotRefs = useRef([]); 

  const { settings, isMobile } = useSettings();
  const lang = settings.idioma || 'pt';

  const translations = {
    pt: {
      hist: { title: 'HISTÓRIA', desc: 'O legado das civilizações que moldaram o tempo.' },
      geo:  { title: 'GEOGRAFIA', desc: 'Mapear o desconhecido, do pico ao oceano.' },
      nat:  { title: 'NATUREZA', desc: 'A pureza intocada dos ecossistemas selvagens.' },
      cult: { title: 'CULTURA', desc: 'A identidade viva, tradições e a alma dos povos.' },
      adv:  { title: 'AVENTURA', desc: 'Desafiar limites onde a vida acontece.' },
      gast: { title: 'GASTRONOMIA', desc: 'A arte de saborear a origem de cada lugar.' }
    },
    en: {
      hist: { title: 'HISTORY', desc: 'The legacy of civilizations that shaped time.' },
      geo:  { title: 'GEOGRAPHY', desc: 'Mapping the unknown, from peak to ocean.' },
      nat:  { title: 'NATURE', desc: 'The untouched purity of wild ecosystems.' },
      cult: { title: 'CULTURE', desc: 'Living identity, traditions, and the soul of peoples.' },
      adv:  { title: 'ADVENTURE', desc: 'Challenging limits where life happens.' },
      gast: { title: 'GASTRONOMY', desc: 'The art of savoring the origin of each place.' }
    },
    fr: {
      hist: { title: 'HISTOIRE', desc: 'L\'héritage des civilisations qui ont façonné le temps.' },
      geo:  { title: 'GÉOGRAPHIE', desc: 'Cartographier l\'inconnu, du sommet à l\'océan.' },
      nat:  { title: 'NATURE', desc: 'La pureté intacte des écosystèmes sauvages.' },
      cult: { title: 'CULTURE', desc: 'L\'identité vivante, les traditions et l\'âme des peuples.' },
      adv:  { title: 'AVENTURA', desc: 'Défier les limites là où la vie se passe.' },
      gast: { title: 'GASTRONOMIE', desc: 'L\'art de savourer l\'origine de chaque lieu.' }
    }
  };

  const t = translations[lang];

  const leftSide = [ t.hist, t.geo, t.nat ];
  const rightSide = [ t.cult, t.adv, t.gast ];

  // Desktop Dimensions
  const svgSize = 750; 
  const circleRadius = 250; // ✅ DIMINUÍDO (Era 300)
  const circumference = 2 * Math.PI * circleRadius; 
  const strokeLength = circumference / 10; 
  const lineLengthDegrees = 36; 
  const cycleDuration = 15000; 
  const ITEM_POSITIONS = ['28%', '56.5%', '85%'];

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setIsVisible(entry.isIntersecting), { threshold: 0.15 });
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (isVisible) { 
        video.play().catch(() => {}); 
        video.playbackRate = 2.0; 
    } else { 
        video.pause(); 
    }
  }, [isVisible]);

  useLayoutEffect(() => {
    if (!isVisible || isMobile) return;
    let startTime = null;
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = (elapsed % cycleDuration) / cycleDuration;
      const currentAngle = progress * 360;

      if (rotatingLineRef.current) rotatingLineRef.current.style.transform = `rotate(${currentAngle}deg)`;

      let activeDotIndex = -1; 
      dotRefs.current.forEach((dot, index) => {
        if (!dot) return;
        const dotAngle = DOT_ANGLES[index];
        let diff = (dotAngle - currentAngle + 360) % 360;
        const isTouching = diff <= lineLengthDegrees && diff >= 0;
        dot.style.opacity = isTouching ? 1 : 0;
        if (isTouching) activeDotIndex = index;
      });

      if (activeDotIndex !== -1) setActiveIndex(prev => (prev !== activeDotIndex ? activeDotIndex : prev));
      animationRef.current = requestAnimationFrame(animate);
    };
    animationRef.current = requestAnimationFrame(animate);
    return () => { if (animationRef.current) cancelAnimationFrame(animationRef.current); };
  }, [isVisible, isMobile]);

  const getPos = (angleDeg) => {
    const angleRad = (angleDeg * Math.PI) / 180;
    return { cx: svgSize / 2 + circleRadius * Math.cos(angleRad), cy: svgSize / 2 + circleRadius * Math.sin(angleRad) };
  };

  const posAventura = getPos(0);     
  const posGastronomia = getPos(60); 
  const posNatureza = getPos(120);   
  const posGeografia = getPos(180);  
  const posHistoria = getPos(240);   
  const posCultura = getPos(300);    

  // Styles
  const containerStyle = {
    backgroundColor: 'black',
    position: 'relative',
    padding: 0,
    marginTop: isMobile ? '-20px' : '-50px',
    zIndex: 2,
    maskImage: isMobile ? 'none' : 'linear-gradient(to bottom, transparent 0%, black 150px, black calc(100% - 150px), transparent 100%)',
    WebkitMaskImage: isMobile ? 'none' : 'linear-gradient(to bottom, transparent 0%, black 150px, black calc(100% - 150px), transparent 100%)',
    overflow: 'hidden',
    height: isMobile ? 'auto' : '100vh',
    minHeight: isMobile ? '100vh' : 'auto'
  };

  const luminousWrapperStyle = {
    width: '100%',
    height: '100%',
    filter: isVisible ? 'brightness(0.85) contrast(1.0)' : 'brightness(0.3) blur(8px)',
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? 'scale(1)' : 'scale(1.02)',
    transition: 'filter 2s ease-out, opacity 2s ease-out, transform 2s ease-out',
    willChange: 'filter, opacity, transform'
  };

  const videoBackgroundStyle = {
    position: isMobile ? 'absolute' : 'relative',
    width: '100%',
    height: isMobile ? '100%' : 'auto',
    display: 'block',
    objectFit: 'cover',
    zIndex: 0
  };

  const videoOverlayStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.3)', 
    zIndex: 1,
    mixBlendMode: 'overlay'
  };

  const gridStyle = {
    display: isMobile ? 'flex' : 'grid',
    flexDirection: isMobile ? 'column' : 'row',
    alignItems: isMobile ? 'center' : 'stretch', 
    justifyContent: 'center',
    gridTemplateColumns: isMobile ? 'none' : `1fr ${svgSize}px 1fr`,
    width: '100%',
    maxWidth: '1800px',
    position: isMobile ? 'relative' : 'absolute',
    top: isMobile ? '0' : '44%',
    left: isMobile ? '0' : '50%',
    transform: isMobile ? 'none' : 'translate(-50%, -50%)',
    zIndex: 3,
    padding: isMobile ? '80px 20px 40px' : '0',
    boxSizing: 'border-box' 
  };

  const columnStyle = { display: 'block', position: 'relative', height: isMobile ? 'auto' : `${svgSize}px`, width: '100%' };

  const renderMobileList = () => (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '40px', 
      marginTop: '20px',
      width: '100%', 
      alignItems: 'center' 
    }}>
      {[...leftSide, ...rightSide].map((item, index) => (
        <div key={index} style={{ 
          textAlign: 'center', 
          maxWidth: '300px', 
          animation: `fadeInUp 0.8s ease-out ${index * 0.2}s forwards`, 
          opacity: 0 
        }}>
          <h3 style={{ color: '#FFCC00', fontSize: '1.5rem', fontWeight: '900', margin: '0 0 10px 0', textTransform: 'uppercase', letterSpacing: '2px' }}>{item.title}</h3>
          <p style={{ color: '#fff', fontSize: '0.9rem', lineHeight: '1.6', margin: 0, opacity: 0.9 }}>{item.desc}</p>
        </div>
      ))}
      <style>{` @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } } `}</style>
    </div>
  );

  return (
    <section ref={sectionRef} style={containerStyle}>
      <div style={luminousWrapperStyle}>
        <video ref={videoRef} src="/mundo.mp4" loop muted playsInline style={videoBackgroundStyle} />
        <div style={videoOverlayStyle}></div>

        {!isMobile && (
            <style>{`
                .item-wrapper { position: absolute; width: 100%; left: 0; transform: translateY(-50%); }
                .detail-item { opacity: 0; transform: translateY(20px); transition: opacity 1s ease-out, transform 1s ease-out; max-width: 350px; padding: 20px; margin: 0 auto; }
                .detail-item.visible { opacity: 1; transform: translateY(0); }
                .detail-title { font-family: 'BBHBartleCustom', sans-serif; font-size: 1.6rem; font-weight: 900; letter-spacing: 3px; margin-bottom: 10px; color: #ffffff; text-transform: uppercase; transition: all 0.5s ease; text-shadow: 0 0 10px rgba(0,0,0,0.8); }
                .detail-title.active { color: #FFCC00; text-shadow: 0 0 20px rgba(255, 204, 0, 0.9), 0 0 40px rgba(0, 0, 0, 0.6); transform: scale(1.1); }
                .detail-desc { font-size: 0.85rem; color: rgba(255, 255, 255, 0.9); font-family: sans-serif; font-weight: 400; line-height: 1.5; transition: color 0.5s ease; text-shadow: 0 0 5px rgba(0,0,0,0.9); }
                .detail-title.active + .detail-desc { color: #ffffff; text-shadow: 0 0 8px rgba(0,0,0,1); }
                .central-svg-container { opacity: 0; transform: scale(0.8); margin-top: 90px; transition: opacity 1.5s ease-out, transform 1.5s cubic-bezier(0.16, 1, 0.3, 1); }
                .central-svg-container.visible { opacity: 1; transform: scale(1); }
                .rotating-group { transform-origin: center; will-change: transform; }
                .circle-stop { fill: #FFFFFF; stroke: #FFFFFF; stroke-width: 2px; opacity: 0; transition: opacity 0.05s linear, r 0.3s ease; }
                .circle-stop.active { fill: #FFFFFF; stroke: #FFFFFF; r: 3.5; }
            `}</style>
        )}

        <div style={gridStyle}>
            {isMobile ? renderMobileList() : (
                <>
                    <div style={{...columnStyle, textAlign: 'right' }}>
                    {leftSide.map((item, index) => {
                        const isActive = activeIndex === index;
                        return (
                        <div key={index} className="item-wrapper" style={{ top: ITEM_POSITIONS[index] }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <div className={`detail-item ${isActive ? 'visible' : ''}`}>
                                <div className={`detail-title ${isActive ? 'active' : ''}`}>{item.title}</div>
                                <div className="detail-desc">{item.desc}</div>
                            </div>
                        </div>
                        </div>
                    )})}
                    </div>

                    <div className={`central-svg-container ${isVisible ? 'visible' : ''}`} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <svg width={svgSize} height={svgSize} viewBox={`0 0 ${svgSize} ${svgSize}`}>
                        <defs>
                        <filter id="glow-white" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur stdDeviation="6" result="coloredBlur" />
                            <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
                        </filter>
                        </defs>
                        <circle cx={svgSize / 2} cy={svgSize / 2} r={circleRadius} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                        <g ref={rotatingLineRef} className="rotating-group" style={{ transformOrigin: `${svgSize/2}px ${svgSize/2}px` }}>
                        <circle cx={svgSize / 2} cy={svgSize / 2} r={circleRadius} fill="none" stroke="#FFFFFF" strokeWidth="1" strokeLinecap="round" filter="url(#glow-white)" strokeDasharray={`${strokeLength} ${circumference}`} strokeDashoffset={0} />
                        </g>
                        <circle ref={el => dotRefs.current[0] = el} cx={posHistoria.cx} cy={posHistoria.cy} r="2" className={`circle-stop ${activeIndex === 0 ? 'active' : ''}`} />
                        <circle ref={el => dotRefs.current[1] = el} cx={posGeografia.cx} cy={posGeografia.cy} r="2" className={`circle-stop ${activeIndex === 1 ? 'active' : ''}`} />
                        <circle ref={el => dotRefs.current[2] = el} cx={posNatureza.cx} cy={posNatureza.cy} r="2" className={`circle-stop ${activeIndex === 2 ? 'active' : ''}`} />
                        <circle ref={el => dotRefs.current[3] = el} cx={posCultura.cx} cy={posCultura.cy} r="2" className={`circle-stop ${activeIndex === 3 ? 'active' : ''}`} />
                        <circle ref={el => dotRefs.current[4] = el} cx={posAventura.cx} cy={posAventura.cy} r="2" className={`circle-stop ${activeIndex === 4 ? 'active' : ''}`} />
                        <circle ref={el => dotRefs.current[5] = el} cx={posGastronomia.cx} cy={posGastronomia.cy} r="2" className={`circle-stop ${activeIndex === 5 ? 'active' : ''}`} />
                    </svg>
                    </div>

                    <div style={{...columnStyle, textAlign: 'left' }}>
                    {rightSide.map((item, index) => {
                        const isActive = activeIndex === index + leftSide.length;
                        return (
                        <div key={index} className="item-wrapper" style={{ top: ITEM_POSITIONS[index] }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                            <div className={`detail-item ${isActive ? 'visible' : ''}`}>
                                <div className={`detail-title ${isActive ? 'active' : ''}`}>{item.title}</div>
                                <div className="detail-desc">{item.desc}</div>
                            </div>
                        </div>
                        </div>
                    )})}
                    </div>
                </>
            )}
        </div>
      </div>
    </section>
  );
};

export default TopicsDetails;