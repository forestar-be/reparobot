'use client';

import React, { useEffect, useState } from 'react';
import styles from './Presentation.module.css';

const Presentation = () => {
  const defaultText = `Entretien et Réparation Robot Tondeuse Husqvarna & Gardena est
  votre expert en robotique pour l'entretien, la réparation et la
  maintenance des robots tondeuses des marques Husqvarna et Gardena.
  Forte de plusieurs années d'expérience, notre entreprise propose
  une large gamme de services spécialisés, incluant l'entretien
  saisonnier, la réparation de composants défectueux, ainsi que des
  services de récupération et de protection à domicile pour vos
  appareils.
  <br />
  <br />
  Nous nous engageons à prolonger la durée de vie de vos robots
  tondeuses tout en assurant une efficacité optimale. Nos experts
  effectuent des vérifications approfondies, des nettoyages
  complets, et des ajustements précis pour que vos robots tondeuses
  maintiennent la beauté et la propreté de vos espaces extérieurs
  tout au long de l'année.
  <br />
  <br />
  Outre les services de réparation, nous offrons également une gamme
  de pièces détachées et d'accessoires indispensables pour
  l'entretien de vos robots tondeuses. Parmi nos articles, vous
  trouverez des lames de rechange, des boîtiers solaires pour
  optimiser la performance énergétique de vos équipements, et bien
  d'autres composants.
  <br />
  <br />
  Chez Entretien et Réparation Robot Tondeuse, notre mission est de
  vous offrir un service client exceptionnel, avec des diagnostics
  rapides, des interventions sur mesure, et une prise en charge
  complète pour tous vos besoins en matière de robotique extérieure.
  <br />
  <br />
  Nous comprenons l'importance d'un espace vert parfaitement
  entretenu, et c'est pourquoi nous nous efforçons d'offrir des
  services de qualité supérieure, que vous soyez un particulier ou
  une entreprise. Que vous cherchiez à prolonger la durée de vie de
  votre robot tondeuse, à améliorer ses performances ou à obtenir
  des conseils d'experts, nous sommes là pour vous accompagner.
  Contactez-nous dès aujourd'hui pour un devis gratuit ou pour en
  savoir plus sur nos solutions sur mesure.`;

  const [text, setText] = useState(defaultText);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlText = params.get('text');
      if (urlText) {
        setText(decodeURIComponent(urlText));
      }
    }
  }, []);

  return (
    <div className={styles['presentation-container']}>
      <div className={styles['presentation-content']}>
        <div className={styles['presentation-card']}>
          <div className={styles['presentation-inner']}>
            <h1 className={styles['presentation-title']}>Pourquoi nous choisir ?</h1>
            <div
              className={styles['presentation-text']}
              dangerouslySetInnerHTML={{ __html: text }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Presentation;
