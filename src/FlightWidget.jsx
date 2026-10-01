import React, { useState, useEffect, useRef } from 'react';
import { destinosData } from './dados'; 
import ColorThief from 'colorthief';
import { useSettings } from './SettingsContext'; 

// --- MAPA ESTÁTICO DE MOEDAS (Garante que a conversão não falhe) ---
const COUNTRY_CURRENCY_MAP = {
    "Itália": { code: "EUR", symbol: "€", rate: 1 },
    "França": { code: "EUR", symbol: "€", rate: 1 },
    "Islândia": { code: "ISK", symbol: "kr", rate: 148.50 },
    "Ilhas Faroé": { code: "DKK", symbol: "kr.", rate: 7.45 },
    "EUA": { code: "USD", symbol: "$", rate: 1.09 },
    "Canadá": { code: "CAD", symbol: "$", rate: 1.46 },
    "México": { code: "MXN", symbol: "$", rate: 18.50 },
    "Brasil": { code: "BRL", symbol: "R$", rate: 5.35 },
    "Chile": { code: "CLP", symbol: "$", rate: 960.00 },
    "Peru": { code: "PEN", symbol: "S/.", rate: 4.05 },
    "Japão": { code: "JPY", symbol: "¥", rate: 162.00 },
    "Jordânia": { code: "JOD", symbol: "JD", rate: 0.77 },
    "Nepal": { code: "NPR", symbol: "₨", rate: 145.00 },
    "Turquia": { code: "TRY", symbol: "₺", rate: 32.80 },
    "Nova Zelândia": { code: "NZD", symbol: "$", rate: 1.75 },
    "Namíbia": { code: "NAD", symbol: "$", rate: 20.30 },
    "Austrália": { code: "AUD", symbol: "$", rate: 1.65 },
    "África do Sul": { code: "ZAR", symbol: "R", rate: 20.20 }
};

// --- LISTA DE AEROPORTOS PARA "SNAP" ---
const MAIN_AIRPORTS = [
    { city: "Porto", lat: 41.248, lng: -8.681 },
    { city: "Lisboa", lat: 38.781, lng: -9.135 },
    { city: "Faro", lat: 37.020, lng: -7.968 },
    { city: "Funchal", lat: 32.694, lng: -16.777 },
    { city: "Ponta Delgada", lat: 37.741, lng: -25.697 },
    { city: "Madrid", lat: 40.471, lng: -3.562 },
    { city: "Paris", lat: 49.009, lng: 2.547 },
    { city: "London", lat: 51.470, lng: -0.454 }
];

const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; 
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
};

const getVibrantColor = (palette) => {
    let maxSaturation = 0;
    let bestColor = palette[0] || [242, 201, 76];
    for (const color of palette) {
        const saturation = Math.max(...color) - Math.min(...color);
        const brightness = (color[0] + color[1] + color[2]) / 3;
        if (saturation > maxSaturation && brightness > 40 && brightness < 220) {
            maxSaturation = saturation;
            bestColor = color;
        }
    }
    return bestColor;
};

const getFormattedDate = (addDays = 0) => {
    const date = new Date();
    date.setDate(date.getDate() + addDays);
    return date.toISOString().split('T')[0];
};

class ErrorBoundary extends React.Component {
    constructor(props) { super(props); this.state = { hasError: false }; }
    static getDerivedStateFromError() { return { hasError: true }; }
    componentDidCatch(err, info) { console.error("FlightWidget Error:", err, info); }
    render() { 
        if (this.state.hasError) return <div style={{ height: '100vh', background: '#000', color: '#f2c94c', display:'flex', justifyContent:'center', alignItems:'center' }}><h2>Erro no Calculador. Recarregue a página.</h2></div>; 
        return this.props.children; 
    }
}

const FlightWidgetContent = ({ destinoData, onClose }) => {
    const [step, setStep] = useState(1);
    const [userLoc, setUserLoc] = useState({ city: "Lisboa", currency: "EUR" });
    const [selectedKey, setSelectedKey] = useState("");
    const [ticketData, setTicketData] = useState(null);
    const [apiData, setApiData] = useState({ multiplier: 1, currencySymbol: '€', rate: 1, currencyCode: 'EUR' });
    const [flagUrl, setFlagUrl] = useState(""); 
    const [dynamicRGB, setDynamicRGB] = useState('242, 201, 76'); 
    const [loopIndex, setLoopIndex] = useState(0);
    const [hoverBack, setHoverBack] = useState(false);

    const lastSyncedDestino = useRef(null);
    const { settings, isMobile } = useSettings();
    const lang = settings.idioma || 'pt';

    const translations = {
        pt: {
            back: "VOLTAR", origin: "ORIGEM", dest: "DESTINO", explore_opt: "Explorar Destinos...", depart: "IDA", return: "VINDA", hotel: "HOTEL", h3: "3★ Económico", h4: "4★ Superior", h5: "5★ Luxo", activ: "ATIVIDADES", a_relax: "Relaxar", a_cult: "Cultura", a_adv: "Aventura", meals: "REFEIÇÕES", m_fast: "Económica", m_trad: "Tradicional", m_prem: "Gourmet", car: "Carro", calc_btn: "CALCULAR", new_calc: "NOVO CÁLCULO",
            summary: "RESUMO DA ESTIMATIVA", stay: "Alojamento", food: "Refeições", act_val: "Atividades", car_val: "Transporte", flight_val: "Voo (Estimado)", total_trip: "TOTAL DA VIAGEM", local_conv: "Conversão Moeda Local"
        },
        en: {
            back: "BACK", origin: "ORIGIN", dest: "DESTINATION", explore_opt: "Explore Destinations...", depart: "DEPARTURE", return: "RETURN", hotel: "HOTEL", h3: "3★ Budget", h4: "4★ Superior", h5: "5★ Luxury", activ: "ACTIVITIES", a_relax: "Relax", a_cult: "Culture", a_adv: "Adventure", meals: "MEALS", m_fast: "Budget", m_trad: "Traditional", m_prem: "Gourmet", car: "Car Rental", calc_btn: "CALCULATE", new_calc: "NEW CALCULATION",
            summary: "ESTIMATED SUMMARY", stay: "Accommodation", food: "Meals", act_val: "Activities", car_val: "Transport", flight_val: "Flight (Est.)", total_trip: "TOTAL TRIP COST", local_conv: "Local Currency Conversion"
        },
        fr: {
            back: "RETOUR", origin: "ORIGINE", dest: "DESTINATION", explore_opt: "Explorer les Destinations...", depart: "DÉPART", return: "RETOUR", hotel: "HÔTEL", h3: "3★ Économique", h4: "4★ Supérieur", h5: "5★ Luxe", activ: "ACTIVITÉS", a_relax: "Détente", a_cult: "Culture", a_adv: "Aventure", meals: "REPAS", m_fast: "Économique", m_trad: "Traditionnel", m_prem: "Gourmet", car: "Voiture", calc_btn: "CALCULER", new_calc: "NOUVEAU CALCUL",
            summary: "RÉSUMÉ ESTIMATIF", stay: "Hébergement", food: "Repas", act_val: "Activités", car_val: "Transport", flight_val: "Vol (Est.)", total_trip: "COÛT TOTAL DU VOYAGE", local_conv: "Conversion Monnaie Locale"
        }
    };

    const t = translations[lang];

    const [departureDate, setDepartureDate] = useState(getFormattedDate(0));
    const [returnDate, setReturnDate] = useState(getFormattedDate(7));
    const today = getFormattedDate(0);

    const [hotelStars, setHotelStars] = useState("3");
    const [activityType, setActivityType] = useState("cultura");
    const [foodType, setFoodType] = useState("tradicional");
    const [carRental, setCarRental] = useState(false);

    const allDestinos = Object.values(destinosData);

    useEffect(() => {
        if (!destinoData?.titulo) return;
        if (destinoData.titulo !== lastSyncedDestino.current) {
            const keyFound = Object.keys(destinosData).find(k => destinosData[k].titulo === destinoData.titulo);
            if (keyFound && keyFound !== selectedKey) {
                const timer = setTimeout(() => {
                    setSelectedKey(keyFound);
                    lastSyncedDestino.current = destinoData.titulo;
                }, 0);
                return () => clearTimeout(timer);
            }
        }
    }, [destinoData, selectedKey]);

    const activeDestino = selectedKey ? destinosData[selectedKey] : null;
    const displayDestino = activeDestino || allDestinos[loopIndex];
    const isLooping = !activeDestino;

    useEffect(() => {
        if (activeDestino) return; 
        const interval = setInterval(() => {
            setLoopIndex((prevIndex) => (prevIndex + 1) % allDestinos.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [activeDestino, allDestinos.length]);

    // GEOLOCALIZAÇÃO SEM ERRO DE LINT
    useEffect(() => {
        fetch('https://ipapi.co/json/')
            .then(r => r.json())
            .then(data => { 
                if(data?.latitude && data?.longitude) {
                    let nearestAirport = null;
                    let minDistance = Infinity;
                    MAIN_AIRPORTS.forEach(airport => {
                        const dist = getDistance(data.latitude, data.longitude, airport.lat, airport.lng);
                        if (dist < minDistance) { minDistance = dist; nearestAirport = airport; }
                    });
                    if (nearestAirport) setUserLoc({ city: nearestAirport.city, currency: data.currency || "EUR" });
                    else setUserLoc({ city: data.city || "Lisboa", currency: data.currency || "EUR" });
                }
            })
            .catch(() => {
                setUserLoc({ city: "Lisboa", currency: "EUR" });
            });
    }, []);

    useEffect(() => {
        if (!displayDestino) return;
        const img = new Image();
        img.crossOrigin = "Anonymous"; 
        img.src = displayDestino.imgPrincipal;
        img.onload = () => {
            try {
                const palette = new ColorThief().getPalette(img, 5);
                const vibrant = getVibrantColor(palette);
                setDynamicRGB(`${vibrant[0]}, ${vibrant[1]}, ${vibrant[2]}`);
            } catch { setDynamicRGB('242, 201, 76'); }
        };

        const fetchData = async () => {
            const countryInfo = COUNTRY_CURRENCY_MAP[displayDestino.pais] || { code: "EUR", symbol: "€", rate: 1 };
            
            try {
                const slug = displayDestino.titulo.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ /g, "-");
                const resU = await fetch(`https://api.teleport.org/api/urban_areas/slug:${slug}/details/`);
                let m = 1;
                if (resU.ok) {
                    const d = await resU.json();
                    const meal = d?.categories?.find(c => c.id === "COST-OF-LIVING")?.data?.find(x => x.id === "RESTAURANT-MEAL")?.currency_amount;
                    if(meal) m = meal / 15;
                }

                // Tentar API de moedas real, se falhar, usa o mapa estático acima
                const resR = await fetch(`https://api.frankfurter.app/latest?from=EUR&to=${countryInfo.code}`);
                const rates = await resR.json();
                const finalRate = rates?.rates?.[countryInfo.code] || countryInfo.rate;

                setApiData({ multiplier: m, currencySymbol: countryInfo.symbol, rate: finalRate, currencyCode: countryInfo.code });
                
                const resC = await fetch(`https://restcountries.com/v3.1/name/${displayDestino.pais}?fullText=true`);
                if (resC.ok) {
                    const countryData = await resC.json();
                    if(countryData?.[0]) setFlagUrl(countryData[0].flags.svg);
                }
            } catch {
                setApiData(prev => ({ ...prev, currencySymbol: countryInfo.symbol, rate: countryInfo.rate, currencyCode: countryInfo.code }));
            }
        };
        fetchData();
    }, [displayDestino]);

    const calculate = () => {
        const target = activeDestino || displayDestino;
        if (!target) return alert("Escolha um destino!");
        setStep(2);
        
        setTimeout(() => {
            const nights = Math.max(1, Math.ceil(Math.abs(new Date(returnDate) - new Date(departureDate)) / 86400000));
            const h = { "3": 80, "4": 150, "5": 220 }[hotelStars] || 80;
            const food = { fastfood: 20, tradicional: 50, premium: 120 }[foodType] || 50;
            const act = { relax: 40, cultura: 90, aventura: 160 }[activityType] || 90;

            const totalHotel = h * nights;
            const totalFood = food * apiData.multiplier * (nights + 1);
            const totalAct = act;
            const totalCar = carRental ? 55 * nights : 0;
            
            let totalFlight = 420;
            if (target.continente === "EUROPA") totalFlight = 150;
            else if (target.continente === "AMÉRICA") {
                if (target.pais === "Brasil" || target.pais === "EUA" || target.pais === "México") totalFlight = 750;
                else totalFlight = 1100;
            }
            else if (target.continente === "ÁSIA") {
                if (target.pais === "Turquia" || target.pais === "Jordânia") totalFlight = 450;
                else totalFlight = 950;
            }
            else if (target.continente === "ÁFRICA") totalFlight = 850;
            else if (target.continente === "OCEANIA") totalFlight = 1650;

            const totalEur = totalHotel + totalFood + totalAct + totalCar + totalFlight;
            const totalLocal = totalEur * apiData.rate;

            setTicketData({ 
                valHotel: totalHotel.toFixed(2), 
                valFood: totalFood.toFixed(2), 
                valAct: totalAct.toFixed(2), 
                valCar: totalCar.toFixed(2), 
                valFlight: totalFlight.toFixed(2), 
                eur: totalEur.toFixed(2), 
                local: totalLocal.toFixed(2), 
                nights 
            });
            setStep(3); 
        }, 1200);
    };

    const dynamicAccent = { color: `rgb(${dynamicRGB})` };
    const labelStyle = { fontSize:'0.55rem', color:'#aaa', textTransform:'uppercase', display:'block', marginBottom:'5px', fontWeight: 'bold' };
    const inputStyle = { background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', padding: '0 10px', height: '40px', color: '#fff', fontSize: '0.75rem', width: '100%', boxSizing: 'border-box' };
    const rowStyle = { display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '0.7rem', color: '#ccc' };

    return (
        <div style={{ position: 'fixed', inset: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', background: `radial-gradient(circle at center, rgba(${dynamicRGB}, 0.5) 0%, #000 90%)`, zIndex: 10000, transition: 'background 1s ease' }}>
            <style>{` @keyframes verticalProgress { from { height: 0%; } to { height: 100%; } } `}</style>
            <div style={{ 
                display: 'flex', width: isMobile ? '100vw' : '95vw', maxWidth: '1800px', height: isMobile ? '100vh' : '85vh', background: 'rgba(10, 10, 10, 0.85)', borderRadius: isMobile ? '0' : '30px', overflow: 'hidden', border: isMobile ? 'none' : `1px solid rgba(${dynamicRGB}, 0.3)`, marginTop: isMobile ? '0' : '60px', transition: 'border-color 1s ease', flexDirection: isMobile ? 'column' : 'row' 
            }}>
                
                <div style={{ 
                    width: isMobile ? '100%' : '400px', height: '100%', padding: isMobile ? '30px' : '50px', borderRight: isMobile ? 'none' : '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: 'rgba(0, 0, 0, 0.3)', position: 'relative', boxSizing: 'border-box'
                }}>
                    <button onClick={onClose} onMouseEnter={() => setHoverBack(true)} onMouseLeave={() => setHoverBack(false)} style={{ position: 'absolute', top: '30px', left: '30px', background: 'transparent', borderRadius: '50px', padding: '8px 24px', color: '#fff', fontSize: '0.75rem', cursor: 'pointer', zIndex: 100, transition: 'all 0.3s ease', border: hoverBack ? '1px solid #fff' : '1px solid #444', boxShadow: hoverBack ? '0 0 15px rgba(255, 255, 255, 0.5)' : 'none', textShadow: hoverBack ? '0 0 10px rgba(255, 255, 255, 0.5)' : 'none' }}>{t.back}</button>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px', alignItems: 'center', marginTop: '40px' }}><span style={{ ...dynamicAccent, letterSpacing: '4px', fontWeight: 'bold', fontSize: '0.6rem' }}>TRAVEL EXPLORER</span>{flagUrl && <img src={flagUrl} width="24" alt="flag" />}</div>
                    
                    {step === 1 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div><label style={labelStyle}>{t.origin}</label><input type="text" value={userLoc.city} onChange={(e) => setUserLoc({...userLoc, city: e.target.value})} style={{...inputStyle, opacity: 0.8}} /></div>
                            <div><label style={labelStyle}>{t.dest}</label><select value={selectedKey} onChange={e => setSelectedKey(e.target.value)} style={inputStyle}><option value="">{t.explore_opt}</option>{Object.entries(destinosData).map(([k,v]) => (<option key={k} value={k} style={{background: '#111'}}>{v.titulo}</option>))}</select></div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                <div><label style={labelStyle}>{t.depart}</label><input type="date" min={today} value={departureDate} onChange={e => setDepartureDate(e.target.value)} style={inputStyle} /></div>
                                <div><label style={labelStyle}>{t.return}</label><input type="date" min={departureDate} value={returnDate} onChange={e => setReturnDate(e.target.value)} style={inputStyle} /></div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                <div><label style={labelStyle}>{t.hotel}</label><select value={hotelStars} onChange={e => setHotelStars(e.target.value)} style={inputStyle}><option value="3">{t.h3}</option><option value="4">{t.h4}</option><option value="5">{t.h5}</option></select></div>
                                <div><label style={labelStyle}>{t.activ}</label><select value={activityType} onChange={e => setActivityType(e.target.value)} style={inputStyle}><option value="relax">{t.a_relax}</option><option value="cultura">{t.a_cult}</option><option value="aventura">{t.a_adv}</option></select></div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', alignItems: 'end' }}>
                                <div><label style={labelStyle}>{t.meals}</label><select value={foodType} onChange={e => setFoodType(e.target.value)} style={inputStyle}><option value="fastfood">{t.m_fast}</option><option value="tradicional">{t.m_trad}</option><option value="premium">{t.m_prem}</option></select></div>
                                <div><label style={{color:'#fff', fontSize:'0.7rem', display:'flex', alignItems:'center', gap:'8px', height: '40px', cursor:'pointer'}}><input type="checkbox" checked={carRental} onChange={e => setCarRental(e.target.checked)}/> {t.car}</label></div>
                            </div>
                            <button onClick={calculate} style={{background: `rgb(${dynamicRGB})`, color: '#000', border:'none', height:'45px', borderRadius:'8px', fontWeight:'bold', cursor:'pointer', marginTop:'15px', transition: 'background 1s ease'}}>{t.calc_btn}</button>
                        </div>
                    )}

                    {step === 3 && ticketData && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <div style={{ fontSize: '0.65rem', fontWeight: 'bold', color: `rgb(${dynamicRGB})`, letterSpacing: '2px', textAlign: 'center', marginBottom: '10px' }}>{t.summary} ({ticketData.nights} Noites)</div>
                            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '15px' }}>
                                <div style={rowStyle}><span>{t.stay}:</span> <span>€{ticketData.valHotel}</span></div>
                                <div style={rowStyle}><span>{t.meals}:</span> <span>€{ticketData.valFood}</span></div>
                                <div style={rowStyle}><span>{t.act_val}:</span> <span>€{ticketData.valAct}</span></div>
                                <div style={rowStyle}><span>{t.car_val}:</span> <span>€{ticketData.valCar}</span></div>
                                <div style={rowStyle}><span>{t.flight_val}:</span> <span>€{ticketData.valFlight}</span></div>
                                <div style={{ ...rowStyle, border: 'none', marginTop: '10px', color: '#fff', fontWeight: 'bold', fontSize: '0.85rem' }}><span>TOTAL:</span> <span>€{ticketData.eur}</span></div>
                                
                                <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '15px 0' }} />
                                
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '0.55rem', color: '#888', marginBottom: '5px' }}>{t.local_conv} ({apiData.currencyCode})</div>
                                    <div style={{ ...dynamicAccent, fontSize:'1.8rem', fontWeight:'900' }}>{apiData.currencySymbol}{new Intl.NumberFormat().format(ticketData.local)}</div>
                                </div>
                            </div>
                            <button onClick={() => setStep(1)} style={{ background:'transparent', color:'#fff', border:'1px solid #444', padding:'12px 25px', borderRadius:'8px', cursor:'pointer', marginTop:'10px', fontWeight: 'bold', fontSize: '0.7rem' }}>{t.new_calc}</button>
                        </div>
                    )}
                </div>
                
                {!isMobile && (
                    <div style={{ flex: 1, position: 'relative', background: '#000', overflow: 'hidden' }}>
                        <div key={displayDestino?.titulo} style={{ width: '100%', height: '100%', position: 'relative' }}>
                            <img src={displayDestino?.imgPrincipal} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85, transition: 'opacity 1s ease' }} alt="Destino" crossOrigin="anonymous" />
                            <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', padding: '60px', background: 'linear-gradient(to top, rgba(0,0,0,1), transparent)', display: 'flex', alignItems: 'center', gap: '25px' }}>
                                {isLooping && (
                                    <div style={{ width: '4px', height: '80px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '10px', overflow: 'hidden', flexShrink: 0 }}>
                                         <div key={loopIndex} style={{ width: '100%', backgroundColor: `rgb(${dynamicRGB})`, animation: 'verticalProgress 5s linear forwards', boxShadow: `0 0 10px rgb(${dynamicRGB})` }} />
                                    </div>
                                )}
                                <h1 style={{ ...dynamicAccent, fontSize:'5.5rem', margin:0, textTransform:'uppercase', lineHeight: 0.9, transition: 'color 1s ease' }}>{displayDestino?.titulo}</h1>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default function SafeFlightWidget(props) { return ( <ErrorBoundary> <FlightWidgetContent {...props} /> </ErrorBoundary> ); }