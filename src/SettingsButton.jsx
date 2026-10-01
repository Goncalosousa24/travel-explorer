import React from 'react';
import Lottie from 'lottie-react';
import { useSettings } from './SettingsContext';
import gearAnim from './assets/definicoes.json';

const SettingsButton = ({ isOpen, setIsOpen }) => {
    const { settings, setSettings, mudarIdioma, t } = useSettings();

    const updateSetting = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    return (
        <>
            {/* BOTÃO FLUTUANTE (SEM BOLA AMARELA E MAIOR) */}
            {!isOpen && (
                <button 
                    onClick={() => setIsOpen(true)} 
                    style={styles.fab}
                    className="settings-gear-btn"
                >
                    {/* ✅ AUMENTADO: de 60px para 85px */}
                    <div style={{ width: '85px', height: '85px' }}>
                        <Lottie animationData={gearAnim} loop={true} autoplay={true} />
                    </div>
                </button>
            )}

            {/* PAINEL LATERAL DE DEFINIÇÕES */}
            <div style={{...styles.sidebar, right: isOpen ? '0' : '-400px'}}>
                
                {/* CABEÇALHO */}
                <div style={styles.header}>
                    <div>
                        <h2 style={styles.title}>{t('settings_title')}</h2>
                        <div style={styles.divider} />
                    </div>
                    <button onClick={() => setIsOpen(false)} style={styles.closeBtn}>✕</button>
                </div>

                {/* IDIOMA */}
                <div style={styles.section}>
                    <label style={styles.label}>{t('set_lang')}</label>
                    <select 
                        value={settings.idioma} 
                        onChange={(e) => mudarIdioma(e.target.value)}
                        style={styles.select}
                    >
                        <option value="pt">Português 🇵🇹</option>
                        <option value="en">English 🇺🇸</option>
                        <option value="fr">Français 🇫🇷</option>
                    </select>
                </div>

                {/* FORMATO DE HORA */}
                <div style={styles.section}>
                    <label style={styles.label}>{t('set_time')}</label>
                    <div style={styles.btnGroup}>
                        <button 
                            onClick={() => updateSetting('formatoHora', '24h')}
                            style={settings.formatoHora === '24h' ? styles.btnActive : styles.btnInactive}
                        > 24H </button>
                        <button 
                            onClick={() => updateSetting('formatoHora', '12h')}
                            style={settings.formatoHora === '12h' ? styles.btnActive : styles.btnInactive}
                        > 12H (AM/PM) </button>
                    </div>
                </div>

                {/* TEMPERATURA */}
                <div style={styles.section}>
                    <label style={styles.label}>{t('set_temp')}</label>
                    <div style={styles.btnGroup}>
                        <button 
                            onClick={() => updateSetting('unidadeTemp', 'C')}
                            style={settings.unidadeTemp === 'C' ? styles.btnActive : styles.btnInactive}
                        > CELSIUS (ºC) </button>
                        <button 
                            onClick={() => updateSetting('unidadeTemp', 'F')}
                            style={settings.unidadeTemp === 'F' ? styles.btnActive : styles.btnInactive}
                        > FAHRENHEIT (ºF) </button>
                    </div>
                </div>

                {/* DISTÂNCIA */}
                <div style={styles.section}>
                    <label style={styles.label}>{t('set_dist')}</label>
                    <div style={styles.btnGroup}>
                        <button 
                            onClick={() => updateSetting('unidadeDist', 'km')}
                            style={settings.unidadeDist === 'km' ? styles.btnActive : styles.btnInactive}
                        > KM </button>
                        <button 
                            onClick={() => updateSetting('unidadeDist', 'mi')}
                            style={settings.unidadeDist === 'mi' ? styles.btnActive : styles.btnInactive}
                        > MI </button>
                    </div>
                </div>

                {/* ACESSIBILIDADE */}
                <div style={styles.section}>
                    <label style={styles.label}>{t('set_color')}</label>
                    <select 
                        value={settings.daltonismo} 
                        onChange={(e) => updateSetting('daltonismo', e.target.value)}
                        style={styles.select}
                    >
                        <option value="nenhum">{t('color_none')}</option>
                        <option value="protanopia">Protanopia (Red)</option>
                        <option value="deuteranopia">Deuteranopia (Green)</option>
                        <option value="tritanopia">Tritanopia (Blue)</option>
                    </select>
                </div>

            </div>
        </>
    );
};

const styles = {
    fab: {
        position: 'fixed', 
        bottom: '20px', // Ajustei ligeiramente para não ficar colado
        right: '20px',
        width: 'auto', 
        height: 'auto',
        background: 'none', 
        border: 'none', 
        cursor: 'pointer',
        zIndex: 5000, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: 0,
        filter: 'drop-shadow(0 0 15px rgba(0,0,0,0.8))', // Sombra mais forte para destacar o icon
        transition: 'transform 0.3s ease'
    },
    sidebar: {
        position: 'fixed', top: 0, width: '350px', height: '100vh',
        backgroundColor: 'rgba(15, 15, 15, 0.95)', backdropFilter: 'blur(20px)',
        zIndex: 6000, padding: '40px', boxSizing: 'border-box',
        borderLeft: '1px solid rgba(255,255,255,0.1)', transition: 'right 0.5s cubic-bezier(0.19, 1, 0.22, 1)',
        display: 'flex', flexDirection: 'column', gap: '25px',
        overflowY: 'auto'
    },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' },
    title: { color: '#fff', fontSize: '1.5rem', fontWeight: '900', margin: 0, letterSpacing: '1px', textTransform: 'uppercase' },
    divider: { width: '40px', height: '4px', backgroundColor: '#FFCC00', marginTop: '8px' },
    closeBtn: { background: 'none', border: 'none', color: '#666', fontSize: '1.5rem', cursor: 'pointer', padding: '0 10px' },
    section: { display: 'flex', flexDirection: 'column', gap: '8px' },
    label: { color: '#666', fontSize: '0.6rem', fontWeight: '900', letterSpacing: '1px', textTransform: 'uppercase' },
    btnGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
    btnActive: { padding: '10px', backgroundColor: '#FFCC00', color: '#000', border: 'none', borderRadius: '8px', fontWeight: '800', cursor: 'pointer', fontSize: '0.8rem' },
    btnInactive: { padding: '10px', backgroundColor: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', fontSize: '0.8rem' },
    select: { padding: '10px', backgroundColor: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', outline: 'none', cursor: 'pointer', fontSize: '0.8rem' }
};

export default SettingsButton;