import './StatReseau.css';

function StatReseau({ lignes }) {
  const totalLignes = lignes.length;
  const totalArrets = lignes.reduce((sum, ligne) => sum + ligne.arrets, 0);
  const ligneMax = lignes.reduce((max, ligne) => ligne.arrets > max.arrets ? ligne : max, lignes[0]);

  return (
    <div className="stat-reseau">
      <div className="stat-carte">
        <div className="stat-nombre">{totalLignes}</div>
        <div className="stat-label">Lignes au total</div>
      </div>
      <div className="stat-carte">
        <div className="stat-nombre">{totalArrets}</div>
        <div className="stat-label">Arrêts au total</div>
      </div>
      <div className="stat-carte">
        <div className="stat-nombre">Ligne {ligneMax.numero}</div>
        <div className="stat-label">Plus d'arrêts ({ligneMax.arrets})</div>
      </div>
    </div>
  );
}

export default StatReseau;
