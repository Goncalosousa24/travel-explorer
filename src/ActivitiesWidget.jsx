import React, { useState, useEffect, useRef, useCallback } from 'react';
import Lottie from 'lottie-react';
import loadingCircleAnim from './assets/loadingcircle.json';

const ActivitiesWidget = ({ location, isMobile, lang }) => {
    const [activities, setActivities] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isHovered, setIsHovered] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const timerRef = useRef(null);

    const t = {
        pt: "LOCAIS E ATIVIDADES DE INTERESSE",
        en: "PLACES AND ACTIVITIES OF INTEREST",
        fr: "LIEUX ET ACTIVITÉS D'INTÉRÊT"
    }[lang] || "PLACES AND ACTIVITIES OF INTEREST";

    useEffect(() => {
        const fetchActivities = async () => {
            if (!window.google || !location) return;
            setIsLoading(true);
            try {
                const { places } = await window.google.maps.places.Place.searchByText({
                    textQuery: `top tourist attractions and landmarks in ${location}`,
                    fields: ['displayName', 'photos', 'editorialSummary', 'types', 'formattedAddress', 'rating', 'userRatingCount', 'id'],
                    maxResultCount: 8
                });
                setActivities(places || []);
            } catch (err) { console.error(err); } finally { setIsLoading(false); }
        };
        fetchActivities();
    }, [location]);

    const startTimer = useCallback(() => {
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % (activities.length || 1));
        }, 5000);
    }, [activities.length]);

    useEffect(() => {
        if (!isHovered && activities.length > 0) {
            startTimer();
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
        }
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [isHovered, activities.length, startTimer]);

    const handleNext = (e) => { 
        e?.stopPropagation(); 
        setCurrentIndex((prev) => (prev + 1) % activities.length);
        if (!isHovered) startTimer();
    };

    const handlePrev = (e) => { 
        e?.stopPropagation(); 
        setCurrentIndex((prev) => (prev - 1 + activities.length) % activities.length);
        if (!isHovered) startTimer();
    };

    const getRealDescription = (act, index) => {
        if (act.editorialSummary?.text) return act.editorialSummary.text;

        const typeRaw = act.types?.find(t => !['point_of_interest', 'establishment', 'tourist_attraction'].includes(t)) || 'local de interesse';
        let type = typeRaw.replace(/_/g, ' ');
        type = type.charAt(0).toUpperCase() + type.slice(1);
        
        const address = act.formattedAddress?.split(',')[0] || location;
        const rating = act.rating ? act.rating : '';

        let templates = [];
        if (lang === 'pt') {
            templates = [
                `${type} situado em ${address}. Com uma classificação de ${rating}★, é um ponto de referência na região.`,
                `Localizado em ${address}, este ${type} é uma das atrações mais procuradas para quem visita a cidade.`,
                `Uma visita a ${address} não fica completa sem passar por este ${type}. Destaca-se pela sua popularidade.`,
                `Descubra este ${type} em ${address}. Um local emblemático com uma avaliação média de ${rating}★.`,
                `Em plena zona de ${address}, este ${type} oferece uma perspetiva única sobre a cultura local.`
            ];
        } else if (lang === 'fr') {
            templates = [
                `${type} situé à ${address}. Avec une note de ${rating}★, c'est un point de repère dans la région.`,
                `Situé à ${address}, ce ${type} est l'une des attractions les plus recherchées par les visiteurs.`,
                `Une visite à ${address} n'est pas complète sans voir ce ${type}. Il se distingue par sa popularité.`,
                `Découvrez ce ${type} à ${address}. Un lieu emblématique avec une note moyenne de ${rating}★.`,
                `En plein cœur de ${address}, ce ${type} offre une perspective unique sur la culture locale.`
            ];
        } else {
            templates = [
                `${type} located at ${address}. With a rating of ${rating}★, it is a key landmark in the region.`,
                `Situated in ${address}, this ${type} is one of the most sought-after attractions for visitors.`,
                `A trip to ${address} isn't complete without stopping by this ${type}. Known for its popularity.`,
                `Discover this ${type} in ${address}. An iconic spot with an average rating of ${rating}★.`,
                `Right in the area of ${address}, this ${type} offers a unique perspective on local culture.`
            ];
        }
        return templates[index % templates.length];
    };

    const cardStyle = {
        width: '100%', 
        height: '100%', 
        // Mobile: Altura flexível ou mínima suficiente
        minHeight: isMobile ? '480px' : '320px', 
        borderRadius: '45px', 
        overflow: 'hidden', 
        display: 'flex', 
        flexDirection: 'column',
        padding: '25px', 
        boxSizing: 'border-box',
        backgroundColor: 'rgba(17, 17, 17, 0.5)', 
        backdropFilter: 'blur(20px)', 
        WebkitBackdropFilter: 'blur(20px)',
        border: isHovered ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid rgba(255, 255, 255, 0.05)',
        transition: 'all 0.5s ease', 
        position: 'relative'
    };

    const currentActivity = activities[currentIndex];
    const imageUri = currentActivity?.photos?.[0]?.getURI({ maxWidth: 1000 });

    return (
        <div style={{ width: '100%', height: '100%' }} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
            <div style={cardStyle}>
                
                <div style={{ textAlign: 'center', marginBottom: '15px' }}>
                    <span style={{ fontSize: '0.6rem', fontWeight: '900', color: '#FFCC00', letterSpacing: '3px', textTransform: 'uppercase' }}>
                        {t}
                    </span>
                </div>
                
                {/* CONTEÚDO PRINCIPAL */}
                <div style={{ 
                    flex: 1, 
                    display: 'flex', 
                    // No mobile, column-reverse mete a imagem (que está em baixo no código) no topo visual
                    flexDirection: isMobile ? 'column-reverse' : 'row', 
                    gap: '25px', 
                    alignItems: 'center', 
                    overflow: 'hidden' 
                }}>
                    
                    {/* COLUNA DE TEXTO */}
                    <div style={{ 
                        flex: isMobile ? 1 : 1.3, // No mobile ocupa o espaço restante
                        height: isMobile ? 'auto' : '100%', 
                        width: '100%', 
                        display: 'flex', 
                        flexDirection: 'column', 
                        justifyContent: 'center', 
                        overflow: 'hidden' 
                    }}>
                        <h3 style={{ color: '#fff', fontSize: '1.4rem', fontWeight: '900', margin: '0 0 12px 0', lineHeight: '1.1' }}>
                            {currentActivity?.displayName}
                        </h3>
                        
                        <div className="custom-scroll" style={{ overflowY: 'auto', maxHeight: isMobile ? 'none' : '140px', paddingRight: '10px' }}>
                            <p style={{ color: '#bbb', fontSize: '0.9rem', lineHeight: '1.6', margin: 0, fontStyle: 'normal' }}>
                                {currentActivity && getRealDescription(currentActivity, currentIndex)}
                            </p>
                        </div>
                    </div>

                    {/* COLUNA DE IMAGEM */}
                    <div style={{ 
                        // AJUSTE CRÍTICO PARA MOBILE:
                        // 'flex: none' impede que o flexbox estique ou encolha a imagem de forma estranha
                        // Altura fixa de 200px garante que "cabe" sempre bem no topo
                        flex: isMobile ? 'none' : 1, 
                        width: '100%', 
                        height: isMobile ? '200px' : '100%', 
                        borderRadius: '30px', 
                        overflow: 'hidden', 
                        position: 'relative', 
                        border: '1px solid rgba(255,255,255,0.1)',
                        flexShrink: 0 // Impede encolhimento
                    }}>
                        {isLoading ? (
                            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', filter: 'invert(1)' }}>
                                <Lottie animationData={loadingCircleAnim} style={{ width: 50 }} />
                            </div>
                        ) : (
                            <div key={currentIndex} style={{
                                width: '100%', height: '100%',
                                backgroundImage: `url(${imageUri})`,
                                backgroundSize: 'cover', 
                                backgroundPosition: 'center',
                                transition: 'all 1s ease',
                                animation: 'imgFade 1s ease-out'
                            }} />
                        )}
                    </div>
                </div>

                {/* CONTROLOS (PAGINAÇÃO) */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' }}>
                    <div style={{ display: 'flex', gap: '6px' }}>
                        {activities.map((_, idx) => (
                            <div key={idx} onClick={() => setCurrentIndex(idx)} style={{ 
                                width: idx === currentIndex ? '25px' : '8px', height: '4px', 
                                borderRadius: '10px', backgroundColor: idx === currentIndex ? '#FFCC00' : 'rgba(255,255,255,0.2)', 
                                cursor: 'pointer', transition: 'all 0.4s ease' 
                            }} />
                        ))}
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={handlePrev} style={btnStyle}>‹</button>
                        <button onClick={handleNext} style={btnStyle}>›</button>
                    </div>
                </div>
            </div>
            <style>{`
                @keyframes imgFade { from { opacity: 0; transform: scale(1.05); } to { opacity: 1; transform: scale(1); } }
                .custom-scroll::-webkit-scrollbar { width: 4px; }
                .custom-scroll::-webkit-scrollbar-track { background: rgba(255,255,255,0.05); }
                .custom-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.3); border-radius: 4px; }
                .custom-scroll::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.5); }
            `}</style>
        </div>
    );
};

const btnStyle = {
    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', 
    color: '#fff', borderRadius: '50%', width: '32px', height: '32px', 
    cursor: 'pointer', fontSize: '1.2rem', display: 'flex', alignItems: 'center', 
    justifyContent: 'center', transition: '0.3s'
};

export default ActivitiesWidget;