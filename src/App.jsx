import React, { useState, useEffect, useMemo } from 'react';
import './App.css';


const CLASS_ICONS = {
  saber: "icons/Saber.webp",
  archer: "icons/Archer.webp",
  lancer: "icons/Lancer.webp",
  rider: "icons/Rider.webp",
  caster: "icons/Caster.webp",
  assassin: "icons/Assassin.webp",
  berserker: "icons/Berserker.webp",
  shielder: "icons/Shielder.webp",
  ruler: "icons/Ruler.webp",
  avenger: "icons/Avenger.webp",
  mooncancer: "icons/MoonCancer.webp",
  alterego: "icons/AlterEgo.png",
  foreigner: "icons/Foreigner.webp",
  pretender: "icons/Pretender.webp",
  beast: "icons/Beast.webp" 
};

const App = () => {
  const [servants, setServants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState("ALL");
  const [selectedServant, setSelectedServant] = useState(null);

  useEffect(() => {
    fetch("https://api.atlasacademy.io/export/JP/nice_servant_lang_en.json")
      .then((res) => res.json())
      .then((data) => {
        // 1. FILTER: Keep Standard + Beasts + U-Olga
        let cleanList = data.filter(s => {
          if (!s.collectionNo || s.collectionNo === 0) return false;
          const isStandard = s.type === "heroine" || s.type === "normal";
          // Explicitly keep U-Olga (444) and Eresh (417)
          const isSpecial = s.collectionNo === 444 || s.collectionNo === 417; 
          const isBeast = s.className.toLowerCase() === "beast";
          return isStandard || isBeast || isSpecial; 
        });

        // 2. DATA PATCHING (Fix Classes Only)
        cleanList = cleanList.map(s => {
          if (s.collectionNo === 444) return { ...s, className: "beast" }; 
          if (s.collectionNo === 417) return { ...s, className: "beast" };
          return s;
        });

        // (Paladin Mash removed as requested)

        cleanList.sort((a, b) => a.collectionNo - b.collectionNo);
        setServants(cleanList);
        setLoading(false);
      })
      .catch((err) => console.error("Error fetching data:", err));
  }, []);

  const filteredServants = useMemo(() => {
    return servants.filter((s) => {
      const name = s.name ? s.name.toLowerCase() : "";
      const sClass = s.className ? s.className.toLowerCase() : "";
      const nameMatch = name.includes(searchTerm.toLowerCase());
      const classMatch = selectedClass === "ALL" || sClass === selectedClass.toLowerCase();
      return nameMatch && classMatch;
    });
  }, [servants, searchTerm, selectedClass]);

  const previewList = useMemo(() => {
    if (searchTerm.length === 0) return [];
    return servants.filter(s => s.name && s.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [servants, searchTerm]);

  const capitalize = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : "";

  // --- TRAIT CLEANER ---
  const formatTrait = (rawName) => {
    const IGNORED = [
      "servant", "canbeinbattle", "unknown", "fivestarservant", 
      "fourstarservant", "threestarservant", "twostarservant", "onestarservant",
      "costumeowning"
    ];
    if (IGNORED.includes(rawName.toLowerCase())) return null;

    let name = rawName
      .replace(/^gender/i, '')       
      .replace(/^attribute/i, '')    
      .replace(/^alignment/i, '')    
      .replace(/^class/i, '');       

    name = name.replace(/([a-z])([A-Z])/g, '$1 $2');
    return name.charAt(0).toUpperCase() + name.slice(1).trim();
  };

  const handlePreviewClick = (servant) => {
    setSelectedServant(servant);
    setSearchTerm("");
  };
       

  if (loading) return (
    <div className="loading-screen">
      <div className="loading-text">Loading Chaldea Database...</div>
      <div className="loading-bar-container">
        <div className="loading-bar-fill"></div>
      </div>
    </div>
  );

  return (
    <div className="app-container">
      <header className="main-header">
        <div className="logo-section"><h1>Chaldea Database</h1></div>
        <div className="search-section">
          <div className="search-wrapper">
            <input 
              type="text" 
              placeholder="Search Servant Name..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-bar"
            />
            {searchTerm.length > 0 && (
              <div className="search-dropdown">
                {previewList.length > 0 ? (
                  previewList.slice(0, 8).map((servant) => (
                    <div key={servant.id} className="dropdown-item" onClick={() => handlePreviewClick(servant)}>
                      <img src={servant.extraAssets?.faces?.ascension?.[4] || servant.extraAssets?.faces?.ascension?.[1]} alt="icon" />
                      <div className="dropdown-text">
                        <span className="name">{servant.name}</span>
                        <span className="class">{capitalize(servant.className)}</span>
                      </div>
                    </div>
                  ))
                ) : ( <div className="dropdown-empty">No Servant Found</div> )}
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="filter-container">
        <div className="class-filter-bar">
          <button className={selectedClass === "ALL" ? "active" : ""} onClick={() => setSelectedClass("ALL")}>ALL</button>
          {Object.keys(CLASS_ICONS).map((className) => (
            <button 
              key={className}
              className={selectedClass === className.toUpperCase() ? "active" : ""}
              onClick={() => setSelectedClass(className.toUpperCase())}
            >
              <img src={CLASS_ICONS[className]} alt={className} />
              <span>{capitalize(className)}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="servant-grid">
        {filteredServants.map((servant) => (
          <div key={servant.id} className="servant-card" onClick={() => setSelectedServant(servant)}>
            <div className="card-face">
              <img src={servant.extraAssets?.faces?.ascension?.[4] || servant.extraAssets?.faces?.ascension?.[1] || "https://static.atlasacademy.io/JP/Faces/1001000.png"} alt={servant.name} loading="lazy" />
            </div>
            <div className="card-info">
              <div className="card-name">{servant.name}</div>
              <div className="card-class-icon">
                <img src={CLASS_ICONS[servant.className?.toLowerCase()] || CLASS_ICONS.shielder} alt={servant.className} onError={(e) => {e.target.style.display = 'none'}} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedServant && (
        <div className="modal-overlay" onClick={() => setSelectedServant(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setSelectedServant(null)}>×</button>
            <div className="detail-header">
              <div className="servant-portrait">
                <img src={selectedServant.extraAssets?.charaGraph?.ascension?.[4] || selectedServant.extraAssets?.charaGraph?.ascension?.[3] || selectedServant.extraAssets?.charaGraph?.ascension?.[1]} alt="Portrait" />
              </div>
              <div className="servant-info">
                <h2>{selectedServant.name} <span className="rarity">{"★".repeat(selectedServant.rarity)}</span></h2>
                <p className="jp-name">JP Name: {selectedServant.originalName}</p>
                <div className="stats-grid">
                  <div className="stat-box"><strong>ID:</strong> {selectedServant.collectionNo > 1000 ? "N/A" : Math.floor(selectedServant.collectionNo)}</div>
                  <div className="stat-box"><strong>Class:</strong> {capitalize(selectedServant.className)}</div>
                  <div className="stat-box"><strong>ATK:</strong> {selectedServant.atkMax}</div>
                  <div className="stat-box"><strong>HP:</strong> {selectedServant.hpMax}</div>
                  <div className="stat-box"><strong>Attr:</strong> {capitalize(selectedServant.attribute)}</div>
                  <div className="stat-box"><strong>Cost:</strong> {selectedServant.cost}</div>
                </div>
                
                <div className="traits-box">
                  <strong>Traits:</strong>
                  <div className="tags">
                    {selectedServant.traits?.map(t => {
                      const cleanName = formatTrait(t.name);
                      return cleanName ? <span key={t.id} className="trait-tag">{cleanName}</span> : null;
                    })}
                  </div>
                </div>

              </div>
            </div>
            <div className="skills-section">
              <h3>Active Skills</h3>
              <div className="skill-row">
                {selectedServant.skills?.map((skill, idx) => (
                  <div key={idx} className="skill-unit">
                    <img src={skill.icon} alt={skill.name} />
                    <div className="skill-text"><h4>{skill.name}</h4><p>{skill.detail}</p></div>
                  </div>
                ))}
              </div>
              <h3>Passive Skills</h3>
              <div className="skill-row">
                {selectedServant.classPassive?.map((skill, idx) => (
                  <div key={idx} className="skill-unit passive">
                    <img src={skill.icon} alt={skill.name} />
                    <div className="skill-text"><h4>{skill.name}</h4><p>{skill.detail}</p></div>
                  </div>
                ))}
              </div>
              <h3>Append Skills</h3>
              <div className="skill-row">
                {selectedServant.appendPassive?.length > 0 ? (
                   selectedServant.appendPassive.map((skill, idx) => (
                    <div key={idx} className="skill-unit append">
                      <img src={skill.icon} alt={skill.name} />
                      <div className="skill-text"><h4>{skill.name}</h4><p>{skill.detail}</p></div>
                    </div>
                  ))
                ) : (<p className="no-skill">No Append Skills available.</p>)}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default App;