import { useState, useEffect } from 'react';
import './ListeIncidents.css';

function ListeIncidents() {
  const [incidents, setIncidents] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/incidents")
      .then(r => r.json())
      .then(data => setIncidents(data))
      .catch(err => console.error("Erreur incidents :", err));
  }, []);

  if (incidents.length === 0) {
    return (
      <div className="liste-incidents">
        <h2 className="liste-incidents-titre">Incidents signalés</h2>
        <p className="liste-incidents-vide">Aucun incident signalé pour le moment.</p>
      </div>
    );
  }

  return (
    <div className="liste-incidents">
      <h2 className="liste-incidents-titre">Incidents signalés</h2>
      {incidents.map(inc => (
        <div key={inc.id} className="incident-item">
          <span className="incident-id">#{inc.id}</span>
          <div className="incident-info">
            <strong>Ligne {inc.ligne}</strong> — {inc.lieu}
            <p className="incident-desc">{inc.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default ListeIncidents;
