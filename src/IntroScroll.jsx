import React, { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lottie from 'lottie-react';
import arrowDownAnim from './assets/arrowdown.json';
import { useSettings } from './SettingsContext'; 
import './IntroScroll.css';

gsap.registerPlugin(ScrollTrigger);

const IntroScroll = ({ openMenu }) => {
  const containerRef = useRef(null);
  const stickyRef = useRef(null);
  const contentWrapperRef = useRef(null);
  const indicatorRef = useRef(null);
  const overlayRef = useRef(null);

  const { settings } = useSettings();
  const lang = settings.idioma || 'pt';

  const translations = {
    pt: { start: "INICIAR VIAGEM", subtitle: "BEM-VINDO", btn: "EXPLORAR" },
    en: { start: "START JOURNEY", subtitle: "WELCOME", btn: "EXPLORE" },
    fr: { start: "COMMENCER LE VOYAGE", subtitle: "BIENVENUE", btn: "EXPLORER" }
  };

  const t = translations[lang];

  useLayoutEffect(() => {
    let ctx = gsap.context(() => {
      
      gsap.set(contentWrapperRef.current, { opacity: 0, scale: 0.6 });
      gsap.set(indicatorRef.current, { opacity: 1, y: 0 });
      gsap.set(overlayRef.current, { opacity: 0 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "+=2200", 
          scrub: 1.5,
          pin: true, 
          anticipatePin: 1
        }
      });

      tl.to(indicatorRef.current, { 
        opacity: 0, 
        y: 40, 
        duration: 1.5, 
        ease: "power2.out" 
      });

      tl.to(contentWrapperRef.current, {
        opacity: 1, scale: 1, duration: 3, ease: "power1.inOut"
      }, ">0.5");

      tl.to(contentWrapperRef.current, {
        scale: 60, 
        duration: 6, 
        ease: "power2.in", 
        force3D: true
      }, ">"); 

      tl.to(contentWrapperRef.current, {
        opacity: 0,
        duration: 2.5, 
        ease: "power1.in", 
      }, "<"); 

      tl.to(overlayRef.current, {
        opacity: 1, duration: 3, ease: "none"
      }, "-=3"); 

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className="intro-scroll-container" ref={containerRef}>
      <div className="intro-sticky-screen" ref={stickyRef}>
        
        {/* ✅ Nitidez e Brilho ajustados: contrast(1.15) e brightness(1.12) */}
        <video 
          className="intro-background-video" 
          src="/videomain.mp4" 
          autoPlay 
          loop 
          muted 
          playsInline 
          style={{ filter: 'contrast(1.15) brightness(1.12)' }} 
        />
        
        <div className="intro-overlay"></div>
        <div ref={overlayRef} className="black-fade-overlay"></div>

        <div ref={indicatorRef} className="scroll-indicator-wrapper">
           <p className="scroll-text-top">{t.start}</p>
           <div className="lottie-arrow">
              <Lottie animationData={arrowDownAnim} loop={true} />
           </div>
        </div>

        <div ref={contentWrapperRef} className="intro-text-wrapper">
          {/* CORREÇÃO FEITA:
             Removemos var(--active-card-color).
             Definimos a cor como #ffffff (Branco Puro).
             Mantemos background: 'none' para remover quaisquer gradientes do CSS.
          */}
          <h1 
            className="gta-title"
            style={{ 
              color: '#ffffff', 
              WebkitTextFillColor: '#ffffff',
              background: 'none',
              textShadow: '0 4px 15px rgba(0,0,0,0.3)' // Opcional: Melhora leitura sobre o vídeo
            }}
          >
            TRAVEL EXPLORER
          </h1>
          <h2 className="gta-subtitle">{t.subtitle}</h2>
          <div style={{ marginTop: '5vh' }}>
             <button onClick={openMenu} className="btn-explorar">{t.btn}</button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default IntroScroll;
