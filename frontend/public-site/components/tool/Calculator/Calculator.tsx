'use client';

import React, { useState, useEffect } from 'react';
import './Calculator.css';
import { Theme } from '@mui/material/styles';


interface Answers {
  brand: string;
  model: string;
  lawnSize: string;
  usageFrequency: string;
  terrainType: string;
  technicalIssues: string;
  maintenanceHistory: string;
  accessories: string[];
}


interface CalculatorProps {
  theme: Theme;
}


const CostCalculator = ({ theme }: CalculatorProps): JSX.Element => {
  const [step, setStep] = useState<number>(1);
  const [answers, setAnswers] = useState<Answers>({
    brand: '',
    model: '',
    lawnSize: '',
    usageFrequency: '',
    terrainType: '',
    technicalIssues: '',
    maintenanceHistory: '',
    accessories: [],
  });

  const [estimatedCost, setEstimatedCost] = useState<number | null>(null);
  const [costBreakdown, setCostBreakdown] = useState<string[]>([]);
  const [explanations, setExplanations] = useState<string[]>([]);

  const handleNext = () => {
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleInputChange = (field: string, value: any) => {
    setAnswers({ ...answers, [field]: value });
  };

  const handleCheckboxChange = (value: any) => {
    const newAccessories = answers.accessories.includes(value)
      ? answers.accessories.filter((item) => item !== value)
      : [...answers.accessories, value];
    setAnswers({ ...answers, accessories: newAccessories });
  };

  const calculateEstimate = () => {
    let cost = 0;
    let breakdown: string[] = [];
    let explanationTexts: string[] = [];

    // 1. Coût de base en fonction de la taille de la pelouse
    const lawnSize = parseInt(answers.lawnSize);
    const baseCost = lawnSize * 0.1; // 0.1€ par m²
    cost += baseCost;
    breakdown.push(`Coût de base pour une pelouse de ${lawnSize} m² : ${baseCost.toFixed(2)} €`);
    explanationTexts.push(`La taille de votre pelouse est de ${lawnSize} m². Plus la pelouse est grande, plus le robot tondeuse doit travailler, ce qui augmente le coût de maintenance de base.`);

    // 2. Ajustement en fonction de la fréquence d'utilisation
    let usageMultiplier = 1;
    if (answers.usageFrequency === 'Quotidienne') {
      usageMultiplier = 1.2;
      breakdown.push('Ajustement pour utilisation quotidienne : +20%');
      explanationTexts.push('Une utilisation quotidienne augmente l\'usure du robot tondeuse, nécessitant plus de maintenance.');
    } else if (answers.usageFrequency === 'Hebdomadaire') {
      usageMultiplier = 1.0;
      breakdown.push('Ajustement pour utilisation hebdomadaire : aucun ajustement');
      explanationTexts.push('Une utilisation hebdomadaire maintient une usure régulière, sans impact supplémentaire sur les coûts de maintenance.');
    } else if (answers.usageFrequency === 'Mensuelle') {
      usageMultiplier = 0.8;
      breakdown.push('Ajustement pour utilisation mensuelle : -20%');
      explanationTexts.push('Une utilisation mensuelle réduit l\'usure du robot tondeuse, diminuant ainsi les besoins en maintenance.');
    }
    cost *= usageMultiplier;

    // 3. Ajustement en fonction du type de terrain
    if (answers.terrainType === 'Accidenté') {
      cost += 50;
      breakdown.push('Coût supplémentaire pour terrain accidenté : +50 €');
      explanationTexts.push('Un terrain accidenté peut causer plus de stress et d\'usure sur le robot tondeuse, augmentant les coûts de réparation et de maintenance.');
    } else if (answers.terrainType === 'En pente') {
      cost += 30;
      breakdown.push('Coût supplémentaire pour terrain en pente : +30 €');
      explanationTexts.push('Un terrain en pente exige plus de puissance et de résistance de la part du robot tondeuse, ce qui peut entraîner des coûts de maintenance supplémentaires.');
    } else {
      breakdown.push('Terrain plat : aucun coût supplémentaire');
      explanationTexts.push('Un terrain plat permet un fonctionnement optimal du robot tondeuse sans usure additionnelle.');
    }

    // 4. Coût supplémentaire si des problèmes techniques ont été signalés
    if (answers.technicalIssues === 'Oui') {
      cost += 100;
      breakdown.push('Coût supplémentaire pour problèmes techniques : +100 €');
      explanationTexts.push('Des problèmes techniques indiquent des réparations ou des remplacements de pièces, augmentant ainsi les coûts de maintenance.');
    } else {
      breakdown.push('Aucun problème technique signalé : aucun coût supplémentaire');
      explanationTexts.push('Aucun problème technique détecté, ce qui signifie moins de réparations et donc des coûts de maintenance réduits.');
    }

    // 5. Réduction si un entretien régulier a été effectué
    if (answers.maintenanceHistory === 'Oui') {
      cost *= 0.9;
      breakdown.push('Réduction pour entretien régulier : -10%');
      explanationTexts.push('Un entretien régulier prolonge la durée de vie du robot tondeuse et réduit les besoins en réparations majeures.');
    } else {
      breakdown.push('Pas d\'entretien régulier : aucune réduction du coût');
      explanationTexts.push('L\'absence d\'entretien régulier peut entraîner une usure plus rapide et des coûts de maintenance plus élevés.');
    }

    // 6. Coût pour les accessoires
    const accessoriesCost = answers.accessories.length * 20; // 20€ par accessoire
    cost += accessoriesCost;
    if (accessoriesCost > 0) {
      breakdown.push(`Coût pour les accessoires (${answers.accessories.join(', ')}): +${accessoriesCost.toFixed(2)} €`);
      explanationTexts.push(`Vous utilisez les accessoires suivants : ${answers.accessories.join(', ')}. Chaque accessoire ajoute 20 € aux coûts de maintenance.`);
    } else {
      breakdown.push('Aucun accessoire utilisé : aucun coût supplémentaire');
      explanationTexts.push('Vous n\'utilisez aucun accessoire, ce qui évite des coûts de maintenance additionnels.');
    }

    // Arrondir le coût final
    cost = parseFloat(cost.toFixed(2));

    setEstimatedCost(cost);
    setCostBreakdown(breakdown);
    setExplanations(explanationTexts);
    handleNext();
  };

  return (
    <div className="diagnostic-quiz">
      <h2>Quiz de Diagnostic pour Coût d'Entretien</h2>
      <div className="quiz-step">
        {step === 1 && (
          <>
            <h3>Question 1 sur 8</h3>
            <p>Quelle est la marque de votre robot tondeuse ?</p>
            <select
              value={answers.brand}
              onChange={(e: any) => handleInputChange('brand', e.target.value)}
            >
              <option value="">Sélectionnez une marque</option>
              <option value="Husqvarna">Husqvarna</option>
              <option value="Gardena">Gardena</option>
              <option value="Autre">Autre</option>
            </select>
            <div className="navigation-buttons">
              <button disabled>Précédent</button>
              <button
                disabled={!answers.brand}
                onClick={handleNext}
              >
                Suivant
              </button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h3>Question 2 sur 8</h3>
            <p>Quel est le modèle de votre robot tondeuse ?</p>
            <input
              type="text"
              value={answers.model}
              onChange={(e: any) => handleInputChange('model', e.target.value)}
              placeholder="Entrez le modèle"
            />
            <div className="navigation-buttons">
              <button onClick={handleBack}>Précédent</button>
              <button
                disabled={!answers.model}
                onClick={handleNext}
              >
                Suivant
              </button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <h3>Question 3 sur 8</h3>
            <p>Quelle est la taille de votre pelouse (en m²) ?</p>
            <input
              type="number"
              value={answers.lawnSize}
              onChange={(e: any) => handleInputChange('lawnSize', e.target.value)}
              min="0"
              placeholder="Entrez la taille en m²"
            />
            <div className="navigation-buttons">
              <button onClick={handleBack}>Précédent</button>
              <button
                disabled={!answers.lawnSize || parseInt(answers.lawnSize) <= 0}
                onClick={handleNext}
              >
                Suivant
              </button>
            </div>
          </>
        )}

        {step === 4 && (
          <>
            <h3>Question 4 sur 8</h3>
            <p>À quelle fréquence utilisez-vous votre robot tondeuse ?</p>
            <select
              value={answers.usageFrequency}
              onChange={(e: any) => handleInputChange('usageFrequency', e.target.value)}
            >
              <option value="">Sélectionnez une fréquence</option>
              <option value="Quotidienne">Quotidienne</option>
              <option value="Hebdomadaire">Hebdomadaire</option>
              <option value="Mensuelle">Mensuelle</option>
            </select>
            <div className="navigation-buttons">
              <button onClick={handleBack}>Précédent</button>
              <button
                disabled={!answers.usageFrequency}
                onClick={handleNext}
              >
                Suivant
              </button>
            </div>
          </>
        )}

        {step === 5 && (
          <>
            <h3>Question 5 sur 8</h3>
            <p>Quel est le type de votre terrain ?</p>
            <select
              value={answers.terrainType}
              onChange={(e: any) => handleInputChange('terrainType', e.target.value)}
            >
              <option value="">Sélectionnez un type de terrain</option>
              <option value="Plat">Plat</option>
              <option value="Accidenté">Accidenté</option>
              <option value="En pente">En pente</option>
            </select>
            <div className="navigation-buttons">
              <button onClick={handleBack}>Précédent</button>
              <button
                disabled={!answers.terrainType}
                onClick={handleNext}
              >
                Suivant
              </button>
            </div>
          </>
        )}

        {step === 6 && (
          <>
            <h3>Question 6 sur 8</h3>
            <p>Avez-vous rencontré des problèmes techniques au cours de l'année passée ?</p>
            <select
              value={answers.technicalIssues}
              onChange={(e: any) => handleInputChange('technicalIssues', e.target.value)}
            >
              <option value="">Sélectionnez une option</option>
              <option value="Oui">Oui</option>
              <option value="Non">Non</option>
            </select>
            <div className="navigation-buttons">
              <button onClick={handleBack}>Précédent</button>
              <button
                disabled={!answers.technicalIssues}
                onClick={handleNext}
              >
                Suivant
              </button>
            </div>
          </>
        )}

        {step === 7 && (
          <>
            <h3>Question 7 sur 8</h3>
            <p>Avez-vous effectué un entretien régulier de votre robot tondeuse ?</p>
            <select
              value={answers.maintenanceHistory}
              onChange={(e: any) => handleInputChange('maintenanceHistory', e.target.value)}
            >
              <option value="">Sélectionnez une option</option>
              <option value="Oui">Oui</option>
              <option value="Non">Non</option>
            </select>
            <div className="navigation-buttons">
              <button onClick={handleBack}>Précédent</button>
              <button
                disabled={!answers.maintenanceHistory}
                onClick={handleNext}
              >
                Suivant
              </button>
            </div>
          </>
        )}

        {step === 8 && (
          <>
            <h3>Question 8 sur 8</h3>
            <p>Utilisez-vous des accessoires avec votre robot tondeuse ? (Sélectionnez tout ce qui s'applique)</p>
            <div className="checkbox-group">
              <input
                type="checkbox"
                id="accessory-gps"
                checked={answers.accessories.includes('Module GPS')}
                onChange={() => handleCheckboxChange('Module GPS')}
              />
              <label htmlFor="accessory-gps">Module GPS</label>
            </div>
            <div className="checkbox-group">
              <input
                type="checkbox"
                id="accessory-bluetooth"
                checked={answers.accessories.includes('Connectivité Bluetooth')}
                onChange={() => handleCheckboxChange('Connectivité Bluetooth')}
              />
              <label htmlFor="accessory-bluetooth">Connectivité Bluetooth</label>
            </div>
            <div className="checkbox-group">
              <input
                type="checkbox"
                id="accessory-rain-sensor"
                checked={answers.accessories.includes('Capteur de pluie')}
                onChange={() => handleCheckboxChange('Capteur de pluie')}
              />
              <label htmlFor="accessory-rain-sensor">Capteur de pluie</label>
            </div>
            <div className="checkbox-group">
              <input
                type="checkbox"
                id="accessory-other"
                checked={answers.accessories.includes('Autre')}
                onChange={() => handleCheckboxChange('Autre')}
              />
              <label htmlFor="accessory-other">Autre (précisez)</label>
            </div>
            {answers.accessories.includes('Autre') && (
              <input
                type="text"
                placeholder="Précisez les accessoires"
                onChange={(e: any) => {
                  const otherAccessories = e.target.value.split(',').map((item: string) => item.trim());
                  setAnswers({
                    ...answers,
                    accessories: [
                      ...answers.accessories.filter((a) => a !== 'Autre'),
                      ...otherAccessories,
                    ],
                  });
                }}
              />
            )}
            <div className="navigation-buttons">
              <button onClick={handleBack}>Précédent</button>
              <button onClick={calculateEstimate}>Voir le résultat</button>
            </div>
          </>
        )}

        {step === 9 && estimatedCost !== null && (
          <>
            <h3>Résultat du Diagnostic</h3>
            <p>Sur la base de vos réponses, voici une estimation détaillée du coût annuel d'entretien de votre robot tondeuse :</p>
            <ul className="cost-breakdown">
              {costBreakdown.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
            <div className="total-cost">
              <h2>Coût d'entretien annuel estimé : {estimatedCost.toFixed(2)} €</h2>
            </div>
            <h4>Explications :</h4>
            <ul className="explanations">
              {explanations.map((text, index) => (
                <li key={index}>{text}</li>
              ))}
            </ul>
            <p>Merci d'avoir utilisé notre simulateur de coût de maintenance !</p>
            <button onClick={() => window.location.reload()}>Recommencer le quiz</button>
          </>
        )}
      </div>
    </div>
  );
};

export default CostCalculator;
