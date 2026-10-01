import React, { useState, useEffect } from 'react';
import CardSwap, { Card } from './CardSwap';
import { destinosData } from './dados';

const ArrowIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ModelViewer = ({ onNavigate }) => {
  const destinos = Object.entries(destinosData);
  
  // --- DETEÇÃO DE MOBILE ---
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // --- LÓGICA DE CORES (Igual à anterior) ---
  const getCor = (key) => {
    const chave = key.toLowerCase();
    if (chave === 'sainttropez') return '#0066FF'; // Azul
    if (chave === 'islandia') return '#00FF99';    // Verde
    return null; // Automático
  };

  return (
    <div style={{ 
      width: '100%', 
      height: '100vh', 
      background: '#050505', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', // Centra tudo verticalmente
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      overflow: 'hidden', 
      position: 'relative' 
    }}>
      
      {/* --- TEXTO EDITORIAL --- */}
      <div style={{ 
        position: 'absolute', 
        // No Mobile: Texto no topo, centrado. No Desktop: Esquerda.
        top: isMobile ? '60px' : '80px', 
        left: isMobile ? '50%' : '80px', 
        transform: isMobile ? 'translateX(-50%)' : 'none',
        textAlign: isMobile ? 'center' : 'left',
        zIndex: 20, 
        pointerEvents: 'none',
        width: isMobile ? '90%' : 'auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: isMobile ? 'center' : 'flex-start'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px', opacity: 0.8 }}>
           <span style={{ textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.7rem', color: '#fff', fontWeight: '600', background: 'rgba(255,255,255,0.15)', padding: '6px 12px', borderRadius: '100px', border: '1px solid rgba(255,255,255,0.1)' }}>
             Coleção 2026
           </span>
        </div>
        
        <h1 
          className="titulo-reactivo" 
          style={{ 
            // Fonte menor no mobile para não cortar
            fontSize: isMobile ? '2.8rem' : '4.5rem', 
            fontWeight: '700', 
            margin: 0, 
            lineHeight: '1.05', 
            letterSpacing: '-0.03em',
            color: 'var(--active-card-color, #ffffff)', 
            transition: 'color 0.5s ease',
            textShadow: '0 10px 30px rgba(0,0,0,0.5)' // Ajuda a ler por cima dos cartões no mobile
          }}
        >
          O mundo, <br /> 
          <span style={{ opacity: 0.9 }}>redefinido.</span>
        </h1>

        <p style={{ 
          color: '#888', 
          marginTop: '20px', 
          fontSize: isMobile ? '1rem' : '1.1rem', 
          maxWidth: '320px', 
          lineHeight: '1.5', 
          fontWeight: '400',
          display: isMobile ? 'none' : 'block' // Oculta a descrição longa no mobile para limpar a vista
        }}>
          Experiências desenhadas para quem exige o extraordinário em cada detalhe.
        </p>
      </div>

      {/* --- ÁREA DOS CARTÕES --- */}
      <div style={{ 
        zIndex: 10, 
        // No Mobile: Mais margem no topo para não tapar o título
        marginTop: isMobile ? '120px' : '250px', 
        // No Mobile: Remove o padding left gigante
        paddingLeft: isMobile ? '0' : '350px', 
        height: isMobile ? '500px' : '600px', 
        width: '100%', 
        display: 'flex', 
        justifyContent: 'center', 
        position: 'relative' 
      }}>
        
        <CardSwap 
          // Dimensões dinâmicas para Mobile vs Desktop
          width={isMobile ? 320 : 700} 
          height={isMobile ? 420 : 450} 
          cardDistance={isMobile ? 10 : 15} // Menor distância 3D no mobile
          verticalDistance={20} 
          delay={4000} 
          pauseOnHover={true}
        >
          
          {destinos.map(([key, item]) => {
            const corFinal = getCor(key);

            return (
              <Card 
                key={key} 
                bg={`linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.1) 40%, rgba(0,0,0,0.9) 100%), url(${item.imgPrincipal})`}
                accent={corFinal} 
                style={{ 
                  backgroundSize: 'cover', 
                  backgroundPosition: 'center', 
                  borderRadius: '40px', 
                  border: '1.5px solid rgba(255, 255, 255, 0.6)', 
                  boxShadow: `inset 0 0 20px rgba(255, 255, 255, 0.3), inset 0 0 2px rgba(255, 255, 255, 0.9), 0 40px 80px -20px #000000` 
                }}
              >
                {/* CONTEÚDO DO CARTÃO */}
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: isMobile ? '20px' : '25px'}}>
                  <div>
                    <h4 style={{textTransform: 'uppercase', opacity: 0.9, margin: '0 0 5px 0', letterSpacing: '1px', fontSize: '0.8rem', fontWeight: '700', color: '#FFFFFF'}}>{item.pais}</h4>
                    <h3 style={{fontSize: isMobile ? '2.5rem' : '3.5rem', margin: 0, fontWeight: '700', lineHeight: 1, letterSpacing: '-0.03em', color: '#FFFFFF'}}>{item.titulo}</h3>
                  </div>
                </div>

                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', padding: isMobile ? '20px' : '25px'}}>
                  <div style={{maxWidth: '60%'}}>
                     <p style={{fontSize: isMobile ? '0.95rem' : '1.1rem', color: 'rgba(255,255,255,0.85)', margin: '0 0 15px 0', lineHeight: '1.4', display: isMobile ? 'none' : 'block' }}>{item.subtitulo}</p>
                     
                     <div style={{display: 'flex', gap: '8px', flexWrap: 'wrap'}}>
                        {item.tags.slice(0, isMobile ? 2 : 3).map(tag => (
                          <span key={tag} style={{ fontSize: '0.75rem', fontWeight: '600', background: 'rgba(0, 0, 0, 0.6)', color: '#fff', padding: '8px 16px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.3)' }}>
                            {tag}
                          </span>
                        ))}
                     </div>
                  </div>

                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onNavigate) {
                          onNavigate(key); 
                      }
                    }}
                    style={{ 
                        display: 'flex', alignItems: 'center', gap: '10px', 
                        padding: isMobile ? '10px 20px' : '14px 28px', // Botão ligeiramente menor no mobile
                        borderRadius: '100px', cursor: 'pointer', fontWeight: '600', fontSize: '0.95rem', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.4)', color: '#fff', backdropFilter: 'blur(4px)', transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' 
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.color = '#000000'; e.currentTarget.style.border = '1px solid #ffffff'; e.currentTarget.style.transform = 'scale(1.05) translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 25px rgba(255, 255, 255, 0.3)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'; e.currentTarget.style.color = '#ffffff'; e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.4)'; e.currentTarget.style.transform = 'scale(1) translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 10px rgba(0,0,0,0.1)'; }}
                  >
                    {isMobile ? 'Ver' : 'Explorar'}
                    <ArrowIcon />
                  </button>
                </div>
              </Card>
            );
          })}

        </CardSwap>
      </div>
    </div>
  );
};

export default ModelViewer;