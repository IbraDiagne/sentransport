import { useState, useEffect } from 'react';
import './Meteo.css';

function Meteo() {
  const [meteo, setMeteo] = useState(null);
  const [previsions, setPrevisions] = useState([]);
  const [erreur, setErreur] = useState(null);

  useEffect(() => {
    const API_KEY = process.env.REACT_APP_OWM_KEY;
    if (!API_KEY) {
      setErreur("Cle API manquante (.env)");
      return;
    }

    // Météo actuelle
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=Dakar&appid=${API_KEY}&units=metric&lang=fr`)
      .then(r => {
        if (!r.ok) throw new Error("Erreur : " + r.status);
        return r.json();
      })
      .then(data => {
        setMeteo({
          temperature: Math.round(data.main.temp),
          description: data.weather[0].description,
          condition: data.weather[0].main,
          humidite: data.main.humidity,
          icone: data.weather[0].icon,
        });
      })
      .catch(err => setErreur(err.message));

    // Prévisions 5 jours
    fetch(`https://api.openweathermap.org/data/2.5/forecast?q=Dakar&appid=${API_KEY}&units=metric&lang=fr`)
      .then(r => r.json())
      .then(data => {
        // On prend 1 entrée par jour (toutes les 24h = index 0, 8, 16...)
        const jours = [];
        const joursVus = new Set();
        data.list.forEach(item => {
          const date = item.dt_txt.split(" ")[0];
          if (!joursVus.has(date) && jours.length < 3) {
            joursVus.add(date);
            jours.push({
              date,
              temp: Math.round(item.main.temp),
              description: item.weather[0].description,
              icone: item.weather[0].icon,
            });
          }
        });
        setPrevisions(jours);
      })
      .catch(err => console.error("Erreur prévisions :", err));
  }, []);

  function getAlerte(condition) {
    if (condition === "Rain" || condition === "Drizzle") {
      return { message: "Pluie detectee - risque de retards", classe: "alerte-pluie" };
    }
    if (condition === "Thunderstorm") {
      return { message: "Orage en cours - soyez prudents", classe: "alerte-orage" };
    }
    return null;
  }

  if (erreur) {
    return (
      <div className="meteo meteo-erreur">
        <p>Meteo indisponible</p>
        <p className="meteo-detail">{erreur}</p>
      </div>
    );
  }

  if (!meteo) {
    return <div className="meteo">Chargement meteo...</div>;
  }

  const alerte = getAlerte(meteo.condition);

  return (
    <div className="meteo">
      <div className="meteo-info">
        <img
          src={`https://openweathermap.org/img/wn/${meteo.icone}@2x.png`}
          alt={meteo.description}
          className="meteo-icone"
        />
        <div>
          <span className="meteo-temp">{meteo.temperature}&deg;C</span>
          <span className="meteo-desc">{meteo.description}</span>
        </div>
        <span className="meteo-humidite">Humidite : {meteo.humidite}%</span>
      </div>
      {alerte && (
        <div className={`meteo-alerte ${alerte.classe}`}>
          {alerte.message}
        </div>
      )}
      {previsions.length > 0 && (
        <div className="previsions">
          <p className="previsions-titre">Prévisions 3 prochains jours :</p>
          <div className="previsions-liste">
            {previsions.map(j => (
              <div key={j.date} className="prevision-item">
                <span className="prevision-date">{j.date}</span>
                <img
                  src={`https://openweathermap.org/img/wn/${j.icone}.png`}
                  alt={j.description}
                  className="prevision-icone"
                />
                <span className="prevision-temp">{j.temp}°C</span>
                <span className="prevision-desc">{j.description}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Meteo;
