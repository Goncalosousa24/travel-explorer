import React, { useState } from 'react';
import { useSettings } from './SettingsContext';

const Navbar = ({ menuOpen, setMenuOpen, setPage, currentPageKey, onOpenFlights, onOpenMap }) => {
    const { isMobile } = useSettings(); 
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleMobileNav = (action) => {
        if (action) action();
        setMobileMenuOpen(false);
    };

    // =========================================================
    // MODO MOBILE (Ecrã Pequeno: Mostra Hambúrguer)
    // =========================================================
    if (isMobile) {
        return (
            <>
                {/* CSS INJETADO PARA OS EFEITOS (LINHA E ZOOM) */}
                <style>{`
                    .nav-hover-effect {
                        position: relative;
                        text-decoration: none;
                    }
                    .nav-hover-effect::after {
                        content: '';
                        position: absolute;
                        bottom: -5px;
                        left: 0;
                        width: 0%;
                        height: 2px;
                        background-color: currentColor;
                        transition: width 0.3s ease-in-out;
                    }
                    .nav-hover-effect:hover::after {
                        width: 100%;
                    }
                    .explore-zoom {
                        transition: transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                    }
                    .explore-zoom:hover {
                        transform: scale(1.1);
                    }
                `}</style>

                {/* BARRA DE TOPO (FIXA) */}
                <div style={styles.mobileContainer}>
                    <div 
                        onClick={() => handleMobileNav(() => setPage('home'))}
                        style={styles.logoMobile}
                    >
                        TRAVEL EXPLORER
                    </div>

                    <button 
                        onClick={() => setMobileMenuOpen(true)}
                        style={styles.hamburgerBtn}
                    >
                        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="3" y1="12" x2="21" y2="12"></line>
                            <line x1="3" y1="6" x2="21" y2="6"></line>
                            <line x1="3" y1="18" x2="21" y2="18"></line>
                        </svg>
                    </button>
                </div>

                {/* GAVETA DO MENU */}
                <div style={{
                    ...styles.mobileOverlay,
                    transform: mobileMenuOpen ? 'translateX(0)' : 'translateX(100%)',
                    opacity: mobileMenuOpen ? 1 : 0,
                    pointerEvents: mobileMenuOpen ? 'auto' : 'none'
                }}>
                    <button onClick={() => setMobileMenuOpen(false)} style={styles.closeBtn}>✕</button>
                    
                    <div style={styles.mobileLinksContainer}>
                        <button 
                            className="nav-hover-effect"
                            style={{...styles.mobileLink, color: '#f2c94c'}} 
                            onClick={() => handleMobileNav(onOpenFlights)}
                        >
                            TRAVEL +
                        </button>

                        <button 
                            className="nav-hover-effect"
                            style={styles.mobileLink} 
                            onClick={() => handleMobileNav(onOpenMap)}
                        >
                            GLOBE
                        </button>
                        
                        <button 
                            className="explore-zoom"
                            style={styles.mobileExploreBtn}
                            onClick={() => handleMobileNav(() => setMenuOpen(true))}
                        >
                            EXPLORE ▼
                        </button>

                        <button 
                            className="nav-hover-effect"
                            style={styles.mobileLink} 
                            onClick={() => handleMobileNav(() => setPage('home'))}
                        >
                            HOME
                        </button>
                    </div>
                </div>
            </>
        );
    }

    // =========================================================
    // MODO DESKTOP (Ecrã Grande: Mostra Links)
    // =========================================================
    return (
        <div style={styles.container}>
            <style>{`
                .nav-hover-effect {
                    position: relative;
                    text-decoration: none;
                }
                .nav-hover-effect::after {
                    content: '';
                    position: absolute;
                    bottom: -5px;
                    left: 0;
                    width: 0%;
                    height: 2px;
                    background-color: currentColor;
                    transition: width 0.3s ease-in-out;
                }
                .nav-hover-effect:hover::after {
                    width: 100%;
                }
                .explore-zoom {
                    transition: transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                }
                .explore-zoom:hover {
                    transform: scale(1.1);
                }
            `}</style>

            <div 
                className="logo-hover"
                onClick={() => setPage('home')}
                style={styles.logo}
            >
                TRAVEL EXPLORER
            </div>

            <div style={styles.links}>
                <button 
                    className="nav-hover-effect"
                    onClick={onOpenFlights} 
                    style={{ ...styles.link, color: '#f2c94c', fontWeight: 'bold' }}
                >
                    TRAVEL +
                </button>

                <button 
                    className="nav-hover-effect"
                    onClick={onOpenMap} 
                    style={styles.link}
                >
                    GLOBE
                </button>

                <button 
                    className="explore-zoom"
                    onClick={() => setMenuOpen(!menuOpen)} 
                    style={styles.exploreBtn}
                >
                    EXPLORE ▼
                </button>

                <button 
                    className="nav-hover-effect"
                    onClick={() => setPage('home')} 
                    style={{ ...styles.link, opacity: currentPageKey === 'home' ? 1 : 0.6 }}
                >
                    HOME
                </button>
            </div>
        </div>
    );
};

const styles = {
    // --- ESTILOS DESKTOP ---
    container: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '30px 50px',
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.8), transparent)',
        position: 'absolute',
        width: '100%',
        boxSizing: 'border-box',
        zIndex: 1000
    },
    logo: {
        color: '#fff',
        // ✅ CORREÇÃO: Reduzido de 1.5rem para 1.2rem
        fontSize: '1.2rem', 
        fontWeight: '900',
        letterSpacing: '4px',
        cursor: 'pointer',
        textTransform: 'uppercase'
    },
    links: {
        display: 'flex',
        alignItems: 'center',
        gap: '30px'
    },
    link: {
        background: 'none',
        border: 'none',
        color: '#fff',
        fontSize: '0.8rem',
        fontWeight: 'bold',
        letterSpacing: '2px',
        cursor: 'pointer',
        transition: 'opacity 0.3s'
    },
    exploreBtn: {
        background: 'linear-gradient(90deg, #d4a017, #f2c94c)',
        border: 'none',
        padding: '10px 25px',
        borderRadius: '20px',
        color: '#000',
        fontWeight: '900',
        fontSize: '0.8rem',
        letterSpacing: '1px',
        cursor: 'pointer',
        boxShadow: '0 0 15px rgba(242, 201, 76, 0.4)'
    },

    // --- ESTILOS MOBILE ---
    mobileContainer: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '15px 20px', 
        background: 'rgba(0,0,0,0.8)', 
        backdropFilter: 'blur(10px)',
        position: 'fixed', 
        top: 0,
        left: 0,
        width: '100%',
        boxSizing: 'border-box',
        zIndex: 9999, 
        borderBottom: '1px solid rgba(255,255,255,0.1)'
    },
    logoMobile: {
        color: '#fff',
        // ✅ CORREÇÃO: Reduzido de 1rem para 0.85rem
        fontSize: '0.85rem', 
        fontWeight: '900',
        letterSpacing: '2px',
        textTransform: 'uppercase',
        cursor: 'pointer'
    },
    hamburgerBtn: {
        background: 'transparent',
        border: 'none',
        color: '#fff',
        fontSize: '1.8rem', 
        cursor: 'pointer',
        padding: '5px'
    },
    
    // --- ESTILOS DA GAVETA ---
    mobileOverlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: '#0c0c0c', 
        zIndex: 10000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
    },
    closeBtn: {
        position: 'absolute',
        top: '25px',
        right: '25px',
        background: 'transparent',
        border: 'none',
        color: '#fff',
        fontSize: '2rem',
        cursor: 'pointer'
    },
    mobileLinksContainer: {
        display: 'flex',
        flexDirection: 'column',
        gap: '40px',
        alignItems: 'center'
    },
    mobileLink: {
        background: 'transparent',
        border: 'none',
        color: '#fff',
        fontSize: '1.5rem', 
        fontWeight: '900',
        letterSpacing: '3px',
        cursor: 'pointer',
        textTransform: 'uppercase'
    },
    mobileExploreBtn: {
        marginTop: '20px',
        background: 'linear-gradient(90deg, #d4a017, #f2c94c)', 
        border: 'none',
        padding: '15px 40px',
        borderRadius: '50px',
        color: '#000', 
        fontWeight: '900',
        fontSize: '1rem',
        letterSpacing: '2px',
        cursor: 'pointer',
        textTransform: 'uppercase',
        boxShadow: '0 0 20px rgba(242, 201, 76, 0.4)' 
    }
};

export default Navbar;