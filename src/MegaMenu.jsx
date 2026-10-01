import React, { useState } from 'react';
import { destinosData } from './dados'; 
import { useSettings } from './SettingsContext'; 

const MegaMenu = ({ menuOpen, setMenuOpen, setPage }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("TODOS");
  const [showFilters, setShowFilters] = useState(false);

  const { settings, isMobile } = useSettings();
  const lang = settings.idioma || 'pt';

  const translations = {
    pt: {
      search_ph: "PESQUISAR DESTINO...",
      filters_btn_open: "FILTROS +",
      filters_btn_close: "FECHAR FILTROS",
      close_menu: "FECHAR MENU",
      all: "TODOS",
      eu: "EUROPA", na: "AMÉRICA DO NORTE", sa: "AMÉRICA DO SUL", as: "ÁSIA & MÉDIO ORIENTE", oc: "OCEANIA & ÁFRICA",
      adv: "AVENTURA", beach: "PRAIA", lux: "LUXO", nat: "NATUREZA",
      gast: "GASTRONOMIA", hist: "HISTÓRIA", cold: "FRIO", desert: "DESERTO",
      rom: "ROMANCE", saf: "SAFARI", mount: "MONTANHA", cult: "CULTURA",
      relax: "RELAX", wild: "VIDA SELVAGEM", isl: "ILHAS"
    },
    en: {
      search_ph: "SEARCH DESTINATION...",
      filters_btn_open: "FILTERS +",
      filters_btn_close: "CLOSE FILTERS",
      close_menu: "CLOSE MENU",
      all: "ALL",
      eu: "EUROPE", na: "NORTH AMERICA", sa: "SOUTH AMERICA", as: "ASIA & MIDDLE EAST", oc: "OCEANIA & AFRICA",
      adv: "ADVENTURE", beach: "BEACH", lux: "LUXURY", nat: "NATURE",
      gast: "GASTRONOMY", hist: "HISTORY", cold: "COLD", desert: "DESERT",
      rom: "ROMANCE", saf: "SAFARI", mount: "MOUNTAIN", cult: "CULTURE",
      relax: "RELAX", wild: "WILDLIFE", isl: "ISLANDS"
    },
    fr: {
      search_ph: "RECHERCHER...",
      filters_btn_open: "FILTRES +",
      filters_btn_close: "FERMER FILTRES",
      close_menu: "FERMER MENU",
      all: "TOUS",
      eu: "EUROPE", na: "AMÉRIQUE DU NORD", sa: "AMÉRIQUE DU SUD", as: "ASIE & MOYEN-ORIENT", oc: "OCÉANIE & AFRIQUE",
      adv: "AVENTURE", beach: "PLAGE", lux: "LUXE", nat: "NATURE",
      gast: "GASTRONOMIE", hist: "HISTOIRE", cold: "FROID", desert: "DÉSERT",
      rom: "ROMANCE", saf: "SAFARI", mount: "MONTAGNE", cult: "CULTURE",
      relax: "DÉTENTE", wild: "VIE SAUVAGE", isl: "ÎLES"
    }
  };

  const destNames = {
    pt: { como: "Lago di Como", sainttropez: "Saint-Tropez", islandia: "Islândia", ilhasfaroe: "Ilhas Faroé", alaska: "Alaska", banff: "Banff", zion: "Zion", bacalar: "Bacalar", patagonia: "Patagónia", machupicchu: "Machu Picchu", atacama: "Atacama", lencois: "Lençóis Maranhenses", yakushima: "Yakushima", petra: "Petra", everest: "Monte Everest", cappadocia: "Capadócia", milford: "Milford Sound", sossusvlei: "Sossusvlei", whitsunday: "Whitsunday", kruger: "Parque Kruger" },
    en: { como: "Lake Como", sainttropez: "Saint-Tropez", islandia: "Iceland", ilhasfaroe: "Faroe Islands", alaska: "Alaska", banff: "Banff", zion: "Zion", bacalar: "Bacalar", patagonia: "Patagonia", machupicchu: "Machu Picchu", atacama: "Atacama", lencois: "Lençóis Maranhenses", yakushima: "Yakushima", petra: "Petra", everest: "Mount Everest", cappadocia: "Cappadocia", milford: "Milford Sound", sossusvlei: "Sossusvlei", whitsunday: "Whitsunday", kruger: "Kruger Park" },
    fr: { como: "Lac de Côme", sainttropez: "Saint-Tropez", islandia: "Islande", ilhasfaroe: "Îles Féroé", alaska: "Alaska", banff: "Banff", zion: "Zion", bacalar: "Bacalar", patagonia: "Patagonie", machupicchu: "Machu Picchu", atacama: "Atacama", lencois: "Lençóis Maranhenses", yakushima: "Yakushima", petra: "Pétra", everest: "Mont Everest", cappadocia: "Cappadoce", milford: "Milford Sound", sossusvlei: "Sossusvlei", whitsunday: "Whitsunday", kruger: "Parc Kruger" }
  };

  const t = translations[lang];
  const names = destNames[lang];

  const handleNav = (destinoKey) => {
    if (setPage) setPage(destinoKey);
    if (setMenuOpen) setMenuOpen(false);
  };

  const filtersMap = [
    { label: t.all, value: "TODOS" }, { label: t.adv, value: "AVENTURA" }, { label: t.beach, value: "PRAIA" },
    { label: t.lux, value: "LUXO" }, { label: t.nat, value: "NATUREZA" }, { label: t.gast, value: "GASTRONOMIA" },
    { label: t.hist, value: "HISTÓRIA" }, { label: t.cold, value: "FRIO" }, { label: t.desert, value: "DESERTO" },
    { label: t.rom, value: "ROMANCE" }, { label: t.saf, value: "SAFARI" }, { label: t.mount, value: "MONTANHA" },
    { label: t.cult, value: "CULTURA" }, { label: t.relax, value: "RELAX" }, { label: t.wild, value: "VIDA SELVAGEM" },
    { label: t.isl, value: "ILHAS" }
  ];

  const menuData = [
    { title: t.eu, items: [{ key: 'como', label: names.como, flag: '🇮🇹' }, { key: 'sainttropez', label: names.sainttropez, flag: '🇫🇷' }, { key: 'islandia', label: names.islandia, flag: '🇮🇸' }, { key: 'ilhasfaroe', label: names.ilhasfaroe, flag: '🇫🇴' }] },
    { title: t.na, items: [{ key: 'alaska', label: names.alaska, flag: '🇺🇸' }, { key: 'banff', label: names.banff, flag: '🇨🇦' }, { key: 'zion', label: names.zion, flag: '🇺🇸' }, { key: 'bacalar', label: names.bacalar, flag: '🇲🇽' }] },
    { title: t.sa, items: [{ key: 'patagonia', label: names.patagonia, flag: '🇨🇱' }, { key: 'machupicchu', label: names.machupicchu, flag: '🇵🇪' }, { key: 'atacama', label: names.atacama, flag: '🇨🇱' }, { key: 'lencois', label: names.lencois, flag: '🇧🇷' }] },
    { title: t.as, items: [{ key: 'yakushima', label: names.yakushima, flag: '🇯🇵' }, { key: 'petra', label: names.petra, flag: '🇯🇴' }, { key: 'everest', label: names.everest, flag: '🇳🇵' }, { key: 'cappadocia', label: names.cappadocia, flag: '🇹🇷' }] },
    { title: t.oc, items: [{ key: 'milford', label: names.milford, flag: '🇳🇿' }, { key: 'sossusvlei', label: names.sossusvlei, flag: '🇳🇦' }, { key: 'whitsunday', label: names.whitsunday, flag: '🇦🇺' }, { key: 'kruger', label: names.kruger, flag: '🇿🇦' }] }
  ];

  const styles = {
    overlay: {
      position: 'fixed', top: 0, left: 0, width: '100vw', 
      height: isMobile ? '100vh' : (showFilters ? '85vh' : '50vh'), 
      backgroundColor: '#111', zIndex: 2147483647,
      transform: menuOpen ? 'translateY(0)' : 'translateY(-100%)',
      transition: 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1), height 0.5s cubic-bezier(0.25, 1, 0.5, 1)',
      display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center',
      color: 'white', fontFamily: 'sans-serif',
      paddingTop: isMobile ? '80px' : '60px', 
      overflowY: 'auto',
      paddingBottom: isMobile ? '200px' : '0' 
    },
    topControlBar: {
      display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '20px', 
      flexDirection: isMobile ? 'column' : 'row', 
      width: isMobile ? '90%' : 'auto'
    },
    // ✅ ALTERAÇÃO: DESIGN OVAL (PILL)
    searchInput: {
      width: isMobile ? '100%' : '300px', 
      padding: '12px 25px', 
      background: 'rgba(255,255,255,0.05)',
      border: '1px solid #444',
      borderRadius: '30px', // Retângulo Oval
      color: 'white', 
      fontSize: '13px', 
      textAlign: 'center',
      outline: 'none', 
      letterSpacing: '2px', 
      textTransform: 'uppercase',
      transition: 'all 0.3s ease'
    },
    filterToggleButton: {
      background: showFilters ? 'white' : 'transparent',
      color: showFilters ? 'black' : 'white',
      border: '1px solid white',
      padding: '8px 20px',
      borderRadius: '20px',
      cursor: 'pointer',
      fontSize: '11px',
      letterSpacing: '1px',
      transition: 'all 0.3s',
      width: isMobile ? '100%' : 'auto' 
    },
    filtersPanel: {
      display: showFilters ? 'grid' : 'none',
      gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', 
      gap: '10px',
      marginBottom: '30px',
      padding: '20px',
      background: 'rgba(255,255,255,0.05)',
      borderRadius: '10px',
      maxWidth: '700px',
      width: isMobile ? '90%' : 'auto',
      opacity: showFilters ? 1 : 0,
      transition: 'opacity 0.3s ease-in'
    },
    filterTag: (isActive) => ({
      background: isActive ? 'white' : 'transparent',
      color: isActive ? 'black' : '#aaa',
      border: '1px solid #444',
      padding: '8px 12px',
      borderRadius: '4px',
      fontSize: '10px',
      letterSpacing: '1px',
      cursor: 'pointer',
      textAlign: 'center',
      transition: 'all 0.2s',
      textTransform: 'uppercase'
    }),
    gridContainer: {
      display: 'flex', 
      justifyContent: 'center', 
      gap: isMobile ? '40px' : '50px',
      width: '90%', maxWidth: '1600px', 
      textAlign: isMobile ? 'center' : 'left',
      flexDirection: isMobile ? 'column' : 'row',
      flexWrap: 'wrap',
      marginBottom: '30px' 
    },
    column: { 
      display: 'flex', flexDirection: 'column', gap: '12px', minWidth: '150px',
      alignItems: isMobile ? 'center' : 'flex-start'
    },
    continentTitle: {
      color: '#666', fontSize: '11px', letterSpacing: '3px', fontWeight: 'bold',
      borderBottom: '1px solid #333', paddingBottom: '10px', marginBottom: '10px', textTransform: 'uppercase',
      width: isMobile ? '100%' : 'auto'
    },
    itemText: {
      fontSize: isMobile ? '20px' : '18px',
      color: '#999', textDecoration: 'none', fontFamily: 'serif',    
      padding: isMobile ? '8px 0' : '4px 0',
      display: 'block', transition: 'color 0.3s ease', pointerEvents: 'auto'
    },
    closeButton: {
      marginTop: '30px',
      marginBottom: '120px', 
      background: 'black', 
      border: '1px solid #333', color: '#888', 
      padding: '12px 50px', borderRadius: '30px', 
      cursor: 'pointer',
      fontSize: '12px', textTransform: 'uppercase', letterSpacing: '2px', 
      transition: 'all 0.3s',
      boxShadow: '0 5px 20px rgba(0,0,0,0.5)',
      alignSelf: 'center'
    }
  };

  const hoverOn = (e) => e.target.style.color = 'white'; 
  const hoverOff = (e) => e.target.style.color = '#999'; 

  return (
    <div style={styles.overlay}>
      
      <div style={styles.topControlBar}>
        {/* ✅ ATUALIZADO: Foco agora muda a cor da borda completa */}
        <input 
          type="text" 
          placeholder={t.search_ph} 
          style={styles.searchInput}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={(e) => {
            e.target.style.borderColor = 'white';
            e.target.style.background = 'rgba(255,255,255,0.1)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#444';
            e.target.style.background = 'rgba(255,255,255,0.05)';
          }}
        />
        <button 
          style={styles.filterToggleButton} 
          onClick={() => setShowFilters(!showFilters)}
        >
          {showFilters ? t.filters_btn_close : t.filters_btn_open}
        </button>
      </div>

      {showFilters && (
        <div style={styles.filtersPanel}>
          {filtersMap.map(f => (
            <button
              key={f.value}
              style={styles.filterTag(activeFilter === f.value)}
              onClick={() => setActiveFilter(f.value)}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}

      <div style={styles.gridContainer}>
        {menuData.map((continent, index) => {
          
          const filteredItems = continent.items.filter(item => {
            const realData = destinosData[item.key];
            const tags = realData?.tags || [];
            const term = searchTerm.toLowerCase();

            const matchesSearch = 
              searchTerm === "" ||
              item.label.toLowerCase().includes(term) ||
              continent.title.toLowerCase().includes(term) ||
              tags.some(tag => tag.toLowerCase().includes(term));

            const matchesFilter = 
              activeFilter === "TODOS" ||
              tags.some(tag => tag.toUpperCase() === activeFilter);

            return matchesSearch && matchesFilter;
          });

          if (filteredItems.length === 0) return null;

          return (
            <div style={styles.column} key={index}>
              <div style={styles.continentTitle}>{continent.title}</div>
              {filteredItems.map((item) => (
                <div 
                  key={item.key}
                  style={{...styles.itemText, cursor: 'pointer'}} 
                  onClick={() => handleNav(item.key)} 
                  onMouseOver={hoverOn} 
                  onMouseOut={hoverOff}
                >
                  {item.flag} {item.label}
                </div>
              ))}
            </div>
          );
        })}
      </div>

      <button 
        style={styles.closeButton} 
        onClick={() => setMenuOpen(false)}
        onMouseOver={(e) => {e.target.style.borderColor = 'white'; e.target.style.color = 'white'}}
        onMouseOut={(e) => {e.target.style.borderColor = '#333'; e.target.style.color = '#888'}}
      >
        {t.close_menu}
      </button>
    </div>
  );
};

export default MegaMenu;