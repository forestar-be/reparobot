'use client';

import React, { FormEvent, useRef, useState } from 'react';
import './ROICalculator.css';

interface Errors {
  cEssence?: string;
  cTondeuseManuelle?: string;
  cServiceJardinage?: string;
  moyenneTonteParSaison?: string;
  cAchatRobot?: string;
  cMaintenanceRobot?: string;
  usageRobotParSaison?: string;
  superficiePelouse?: string;
  dureeAnnees?: string;
}

const ROICalculateur = (): JSX.Element => {
  // Références pour les champs de formulaire
  const essenceRef = useRef<HTMLInputElement>(null);
  const tondeuseManuelleRef = useRef<HTMLInputElement>(null);
  const serviceJardinageRef = useRef<HTMLInputElement>(null);
  const moyenneTonteRef = useRef<HTMLInputElement>(null);
  const achatRobotRef = useRef<HTMLInputElement>(null);
  const maintenanceRobotRef = useRef<HTMLInputElement>(null);
  const usageRobotRef = useRef<HTMLInputElement>(null);
  const superficieRef = useRef<HTMLInputElement>(null);
  const dureeRef = useRef<HTMLInputElement>(null);

  // États pour les coûts annuels traditionnels
  const [cEssence, setCEssence] = useState<string>('');
  const [cTondeuseManuelle, setCTondeuseManuelle] = useState<string>('');
  const [cServiceJardinage, setCServiceJardinage] = useState<string>('');
  const [moyenneTonteParSaison, setMoyenneTonteParSaison] =
    useState<string>('');

  // États pour le robot tondeuse
  const [cRobot, setCRobot] = useState<string>('');
  const [cMaintenanceRobot, setCMaintenanceRobot] = useState<string>('');
  const [cAchatRobot, setCAchatRobot] = useState<string>('');
  const [usageRobotParSaison, setUsageRobotParSaison] = useState<string>('');

  // Paramètres généraux
  const [dureeAnnees, setDureeAnnees] = useState<number>(5);
  const [superficiePelouse, setSuperficiePelouse] = useState<string>('');

  // États pour les résultats
  const [totalTraditionnel, setTotalTraditionnel] = useState<number | null>(
    null,
  );
  const [totalRobot, setTotalRobot] = useState<number | null>(null);
  const [economies, setEconomies] = useState<number | null>(null);

  // États pour la gestion des erreurs
  const [errors, setErrors] = useState<Errors>({});

  // Fonction de calcul
  const calculerROI = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Réinitialiser les erreurs
    setErrors({});

    // Vérifier les champs et enregistrer les erreurs
    const newErrors: Errors = {};
    if (cEssence === '') newErrors.cEssence = 'Ce champ est requis.';
    if (cTondeuseManuelle === '')
      newErrors.cTondeuseManuelle = 'Ce champ est requis.';
    if (cServiceJardinage === '')
      newErrors.cServiceJardinage = 'Ce champ est requis.';
    if (moyenneTonteParSaison === '')
      newErrors.moyenneTonteParSaison = 'Ce champ est requis.';
    if (cAchatRobot === '') newErrors.cAchatRobot = 'Ce champ est requis.';
    if (cMaintenanceRobot === '')
      newErrors.cMaintenanceRobot = 'Ce champ est requis.';
    if (usageRobotParSaison === '')
      newErrors.usageRobotParSaison = 'Ce champ est requis.';
    if (superficiePelouse === '')
      newErrors.superficiePelouse = 'Ce champ est requis.';
    if (dureeAnnees === null || dureeAnnees <= 0)
      newErrors.dureeAnnees = 'Ce champ est requis.';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // Défilement vers le premier champ erroné
      if (newErrors.cEssence) {
        essenceRef.current?.scrollIntoView({ behavior: 'smooth' });
      } else if (newErrors.cTondeuseManuelle) {
        tondeuseManuelleRef.current?.scrollIntoView({ behavior: 'smooth' });
      } else if (newErrors.cServiceJardinage) {
        serviceJardinageRef.current?.scrollIntoView({ behavior: 'smooth' });
      } else if (newErrors.moyenneTonteParSaison) {
        moyenneTonteRef.current?.scrollIntoView({ behavior: 'smooth' });
      } else if (newErrors.cAchatRobot) {
        achatRobotRef.current?.scrollIntoView({ behavior: 'smooth' });
      } else if (newErrors.cMaintenanceRobot) {
        maintenanceRobotRef.current?.scrollIntoView({ behavior: 'smooth' });
      } else if (newErrors.usageRobotParSaison) {
        usageRobotRef.current?.scrollIntoView({ behavior: 'smooth' });
      } else if (newErrors.superficiePelouse) {
        superficieRef.current?.scrollIntoView({ behavior: 'smooth' });
      } else if (newErrors.dureeAnnees) {
        dureeRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
      return;
    }

    const duree = Number(dureeAnnees);
    const superficie = Number(superficiePelouse);
    if (isNaN(duree) || duree <= 0 || isNaN(superficie) || superficie <= 0) {
      alert(
        'Veuillez entrer des valeurs numériques positives pour la durée et la superficie.',
      );
      return;
    }

    // Calcul des coûts annuels traditionnels
    const totalTrad =
      (Number(cEssence) +
        Number(cTondeuseManuelle) +
        Number(cServiceJardinage)) *
      Number(moyenneTonteParSaison);
    setTotalTraditionnel(totalTrad);

    // Calcul des coûts totaux du robot tondeuse sur la durée
    const totalRbt =
      Number(cAchatRobot) +
      Number(cMaintenanceRobot) * Number(usageRobotParSaison) * duree;
    setTotalRobot(totalRbt);

    // Calcul des économies
    const eco = totalTrad * duree - totalRbt;
    setEconomies(eco);
  };

  // Fonction pour formater les nombres en euros
  const formatEuro = (nombre: number): string => {
    return nombre.toLocaleString('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    });
  };

  return (
    <div className="calculateur-roi-container">
      <h2>Calculateur de Retour sur Investissement (ROI)</h2>
      <p>
        Comparez les coûts d'entretien traditionnels de votre pelouse avec ceux
        d'un robot tondeuse. Découvrez combien vous pourriez économiser sur
        plusieurs années !
      </p>

      <form className="calculateur-roi-form" onSubmit={calculerROI}>
        <div className="section">
          <h3>Coûts Annuels Traditionnels</h3>
          <p>
            Entrez les coûts annuels estimés pour entretenir votre pelouse de
            manière traditionnelle.
          </p>

          <div className={`form-group ${errors.cEssence ? 'error' : ''}`}>
            <label htmlFor="essence">Essence pour la tondeuse (€)</label>
            <input
              type="number"
              id="essence"
              placeholder="Ex: 50"
              value={cEssence}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setCEssence(e.target.value)
              }
              required
              min="0"
              step="1"
              ref={essenceRef}
            />
            {errors.cEssence && (
              <span className="error-message">{errors.cEssence}</span>
            )}
          </div>

          <div
            className={`form-group ${errors.cTondeuseManuelle ? 'error' : ''}`}
          >
            <label htmlFor="tondeuseManuelle">
              Achat ou entretien de la tondeuse manuelle (€)
            </label>
            <input
              type="number"
              id="tondeuseManuelle"
              placeholder="Ex: 100"
              value={cTondeuseManuelle}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setCTondeuseManuelle(e.target.value)
              }
              required
              min="0"
              step="1"
              ref={tondeuseManuelleRef}
            />
            {errors.cTondeuseManuelle && (
              <span className="error-message">{errors.cTondeuseManuelle}</span>
            )}
          </div>

          <div
            className={`form-group ${errors.cServiceJardinage ? 'error' : ''}`}
          >
            <label htmlFor="serviceJardinage">Service de jardinage (€)</label>
            <input
              type="number"
              id="serviceJardinage"
              placeholder="Ex: 200"
              value={cServiceJardinage}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setCServiceJardinage(e.target.value)
              }
              required
              min="0"
              step="1"
              ref={serviceJardinageRef}
            />
            {errors.cServiceJardinage && (
              <span className="error-message">{errors.cServiceJardinage}</span>
            )}
          </div>

          <div
            className={`form-group ${errors.moyenneTonteParSaison ? 'error' : ''}`}
          >
            <label htmlFor="moyenneTonteParSaison">
              Nombre de tontes par saison
            </label>
            <input
              type="number"
              id="moyenneTonteParSaison"
              placeholder="Ex: 30"
              value={moyenneTonteParSaison}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setMoyenneTonteParSaison(e.target.value)
              }
              required
              min="1"
              step="1"
              ref={moyenneTonteRef}
            />
            {errors.moyenneTonteParSaison && (
              <span className="error-message">
                {errors.moyenneTonteParSaison}
              </span>
            )}
          </div>
        </div>

        <div className="section">
          <h3>Robot Tondeuse</h3>
          <p>
            Entrez les coûts associés à l'achat et à la maintenance d'un robot
            tondeuse.
          </p>

          <div className={`form-group ${errors.cAchatRobot ? 'error' : ''}`}>
            <label htmlFor="achatRobot">
              Coût d'achat du robot tondeuse (€)
            </label>
            <input
              type="number"
              id="achatRobot"
              placeholder="Ex: 500"
              value={cAchatRobot}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setCAchatRobot(e.target.value)
              }
              required
              min="0"
              step="1"
              ref={achatRobotRef}
            />
            {errors.cAchatRobot && (
              <span className="error-message">{errors.cAchatRobot}</span>
            )}
          </div>

          <div
            className={`form-group ${errors.cMaintenanceRobot ? 'error' : ''}`}
          >
            <label htmlFor="maintenanceRobot">Maintenance annuelle (€)</label>
            <input
              type="number"
              id="maintenanceRobot"
              placeholder="Ex: 50"
              value={cMaintenanceRobot}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setCMaintenanceRobot(e.target.value)
              }
              required
              min="0"
              step="1"
              ref={maintenanceRobotRef}
            />
            {errors.cMaintenanceRobot && (
              <span className="error-message">{errors.cMaintenanceRobot}</span>
            )}
          </div>

          <div
            className={`form-group ${errors.usageRobotParSaison ? 'error' : ''}`}
          >
            <label htmlFor="usageRobotParSaison">
              Nombre de tontes par saison avec le robot
            </label>
            <input
              type="number"
              id="usageRobotParSaison"
              placeholder="Ex: 30"
              value={usageRobotParSaison}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setUsageRobotParSaison(e.target.value)
              }
              required
              min="1"
              step="1"
              ref={usageRobotRef}
            />
            {errors.usageRobotParSaison && (
              <span className="error-message">
                {errors.usageRobotParSaison}
              </span>
            )}
          </div>
        </div>

        <div className="section">
          <h3>Paramètres Généraux</h3>

          <div
            className={`form-group ${errors.superficiePelouse ? 'error' : ''}`}
          >
            <label htmlFor="superficiePelouse">
              Superficie de la pelouse (m²)
            </label>
            <input
              type="number"
              id="superficiePelouse"
              placeholder="Ex: 500"
              value={superficiePelouse}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setSuperficiePelouse(e.target.value)
              }
              required
              min="1"
              step="1"
              ref={superficieRef}
            />
            {errors.superficiePelouse && (
              <span className="error-message">{errors.superficiePelouse}</span>
            )}
          </div>

          <div className={`form-group ${errors.dureeAnnees ? 'error' : ''}`}>
            <label htmlFor="dureeAnnees">Durée de calcul (années)</label>
            <input
              type="number"
              id="dureeAnnees"
              placeholder="Ex: 5"
              value={dureeAnnees}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setDureeAnnees(Number(e.target.value))
              }
              required
              min="1"
              step="1"
              ref={dureeRef}
            />
            {errors.dureeAnnees && (
              <span className="error-message">{errors.dureeAnnees}</span>
            )}
          </div>
        </div>

        <button type="submit" className="calculer-button">
          Calculer
        </button>
      </form>

      <div className="resultats">
        <h3>Résultats</h3>
        {totalTraditionnel !== null &&
        totalRobot !== null &&
        economies !== null ? (
          <div className="results-animation">
            <p>
              <strong>
                Coût pour tondeuse traditionnel sur {dureeAnnees} années :
              </strong>{' '}
              {formatEuro(totalTraditionnel * dureeAnnees)}
            </p>
            <p>
              <strong>
                Coût avec robot tondeuse sur {dureeAnnees} années :
              </strong>{' '}
              {formatEuro(totalRobot)}
            </p>
            <p>
              <strong>Économies potentielles :</strong>{' '}
              {economies >= 0
                ? formatEuro(economies)
                : `Vous dépensez ${formatEuro(Math.abs(economies))} de plus avec le robot.`}
            </p>
            {economies >= 0 ? (
              <p className="economies-positive">
                Félicitations ! Vous économisez {formatEuro(economies)} sur{' '}
                {dureeAnnees} années avec le robot tondeuse.
              </p>
            ) : (
              <p className="economies-negative">
                Note : Vous dépensez {formatEuro(Math.abs(economies))} de plus
                avec le robot tondeuse.
              </p>
            )}
            <div className="detailed-results">
              <h4>Détails des Coûts</h4>
              <p>
                <strong>Essence pour la tondeuse :</strong>{' '}
                {formatEuro(Number(cEssence))}€ par tondeuse traditionnelle
              </p>
              <p>
                <strong>Achat ou entretien de la tondeuse manuelle :</strong>{' '}
                {formatEuro(Number(cTondeuseManuelle))}€ par an
              </p>
              <p>
                <strong>Service de jardinage :</strong>{' '}
                {formatEuro(Number(cServiceJardinage))}€ par an
              </p>
              <p>
                <strong>Coût d'achat du robot tondeuse :</strong>{' '}
                {formatEuro(Number(cAchatRobot))}€ (coût initial)
              </p>
              <p>
                <strong>Maintenance annuelle du robot tondeuse :</strong>{' '}
                {formatEuro(Number(cMaintenanceRobot))}€ par an
              </p>
              <p>
                <strong>Superficie de la pelouse :</strong> {superficiePelouse}{' '}
                m²
              </p>
              <p>
                <strong>Nombre de tontes par saison (traditionnel) :</strong>{' '}
                {moyenneTonteParSaison}
              </p>
              <p>
                <strong>Nombre de tontes par saison (robot) :</strong>{' '}
                {usageRobotParSaison}
              </p>
              <p>
                <strong>Durée de calcul :</strong> {dureeAnnees} années
              </p>
              <hr />
              <p>
                <strong>Logique du Calcul :</strong>
              </p>
              <ul>
                <li>
                  Le <strong>coût pour tondeuse traditionnel</strong> est
                  calculé en additionnant les coûts annuels en essence, tondeuse
                  manuelle, et service de jardinage, puis multipliés par le
                  nombre de tontes par saison et la durée en années.
                </li>
                <li>
                  Le <strong>coût avec robot tondeuse</strong> inclut le coût
                  d'achat initial du robot et les coûts de maintenance annuels
                  multipliés par le nombre de tontes par saison et la durée en
                  années.
                </li>
                <li>
                  Les <strong>économies potentielles</strong> sont déterminées
                  en soustrayant le coût avec robot tondeuse du coût
                  traditionnel sur la durée choisie.
                </li>
              </ul>
              <p>
                En choisissant un robot tondeuse, vous bénéficiez de :
                <ul>
                  <li>Réduction des coûts en essence et entretien manuel.</li>
                  <li>
                    Automatisation des tontes, ce qui vous fait gagner du temps.
                  </li>
                  <li>
                    Une pelouse entretenue régulièrement sans effort
                    supplémentaire.
                  </li>
                </ul>
              </p>
            </div>
          </div>
        ) : (
          <p>Veuillez remplir le formulaire pour voir les résultats.</p>
        )}
      </div>
    </div>
  );
};

export default ROICalculateur;
