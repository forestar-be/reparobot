import React from 'react';
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Image,
  Link,
} from '@react-pdf/renderer';

interface MyDocumentProps {
  dateDuDepot: string;
  gSMClient: string;
  nom: string;
  code: string;
  type: string;
  codeRobot: string;
  modele: string;
  typeReparation: string;
  avecGarantie: string;
  avecDevis: string;
  remarques: string;
  prix: string;
  tempsPasse: string;
  piecesRemplacees: string;
  travailEffectue: string;
}

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 20,
  },
  section: {
    flexDirection: 'row',
    gap: 10,
  },
  header: {
    fontSize: 12,
    marginTop: 10,
    fontWeight: 'bold',
    backgroundColor: '#a6a6a6',
    border: '1px solid black',
    padding: '5px 10px',
    textAlign: 'center',
  },
  textBox: {
    fontSize: 11,
    border: '1px solid black',
    padding: '5px 10px',
    width: '100%',
  },
  textBoxMultipleColumns: {
    flexDirection: 'row',
    width: '100%',
  },
  subHeaderLeftSection: {
    flexGrow: 1,
    maxWidth: '50%',
  },
  subHeaderRightSection: {
    flexGrow: 1,
    maxWidth: '50%',
    gap: 10,
  },
  subSingleSection: {
    flexGrow: 1,
  },
  issuerInfoBox: {
    marginTop: 4,
    padding: 10,
    color: '#000f6a',
    backgroundColor: '#e1e1e1',
    fontSize: 11,
    flexDirection: 'column',
  },
  subIssuerInfoBox: {
    fontSize: 11,
    flexDirection: 'column',
    marginBottom: 15,
  },
});

const MyDocument = ({
  dateDuDepot,
  gSMClient,
  nom,
  code,
  type,
  codeRobot,
  modele,
  typeReparation,
  avecGarantie,
  avecDevis,
  remarques,
  prix,
  tempsPasse,
  piecesRemplacees,
  travailEffectue,
}: MyDocumentProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.section}>
        <View style={styles.subHeaderLeftSection}>
          <Image style={{ width: '66%' }} src="/images/forestar_enhanced.png" />
          <div style={styles.issuerInfoBox}>
            <div style={styles.subIssuerInfoBox}>
              <Text>FORESTAR SHOP</Text>
              <Text>Chaussée d'escaussines 162</Text>
              <Text>7090 Braine-le-Compte</Text>
              <Text>Belgique</Text>
            </div>
            <div>
              <Text>067830706</Text>
              <Link>info@forestar.be</Link>
              <Link>www.forestar.be</Link>
            </div>
          </div>
        </View>
        <View style={styles.subHeaderRightSection}>
          <Text style={styles.header}>Bon d'entretien ou de réparation</Text>
          <Text style={styles.textBox}>Date du dépôt : {dateDuDepot}</Text>
          <Text style={styles.textBox}>GSM Client : {gSMClient}</Text>
          <Text style={styles.textBox}>Nom : {nom}</Text>
          <Text style={styles.textBox}>Numéro de bon : {code}</Text>
        </View>
      </View>
      <View style={styles.section}>
        <View style={styles.subSingleSection}>
          <Text style={styles.header}>Machine</Text>
          <div style={styles.textBoxMultipleColumns}>
            <Text
              style={{
                ...styles.textBox,
                borderRight: 'unset',
                borderTop: 'unset',
                borderBottom: 'unset',
              }}
            >
              Type: {type}
            </Text>
            <Text
              style={{
                ...styles.textBox,
                borderTop: 'unset',
                borderBottom: 'unset',
              }}
            >
              Code robot: {codeRobot}
            </Text>
          </div>
          <Text style={styles.textBox}>Modèle: {modele}</Text>
          <Text style={styles.header}>État</Text>
          <div style={styles.textBoxMultipleColumns}>
            <Text
              style={{
                ...styles.textBox,
                borderRight: 'unset',
                borderTop: 'unset',
              }}
            >
              Type: {typeReparation}
            </Text>
            <Text
              style={{
                ...styles.textBox,
                borderTop: 'unset',
                borderRight: 'unset',
              }}
            >
              Garantie: {avecGarantie}
            </Text>
            <Text
              style={{
                ...styles.textBox,
                borderTop: 'unset',
              }}
            >
              Devis: {avecDevis}
            </Text>
          </div>
          <Text style={styles.header}>Remarques</Text>
          <Text style={{ ...styles.textBox, borderTop: 'unset' }}>
            {remarques}
          </Text>
          <Text style={styles.header}>Travail</Text>
          <div style={styles.textBoxMultipleColumns}>
            <Text
              style={{
                ...styles.textBox,
                borderRight: 'unset',
                borderTop: 'unset',
                borderBottom: 'unset',
              }}
            >
              Temps passé: {tempsPasse}
            </Text>
            <Text
              style={{
                ...styles.textBox,
                borderTop: 'unset',
                borderBottom: 'unset',
              }}
            >
              Prix: {prix}
            </Text>
          </div>
          <div style={styles.textBox}>
            <Text style={{ marginBottom: 5 }}>Travail effectué:</Text>
            <Text>{travailEffectue}</Text>
          </div>
          <div style={{ ...styles.textBox, borderTop: 'unset' }}>
            <Text style={{ marginBottom: 5 }}>Pièces remplacées:</Text>
            <Text>{piecesRemplacees}</Text>
          </div>
          <Text style={styles.header}> Conditions générales de réparation</Text>
          <div style={styles.textBox}>
            <Text>
              *Forfait nettoyage haute pression si machine non néttoyée + 25,00€
              TVAC
            </Text>
            <Text>*Entretien = machine en état de marche.</Text>
            <Text>*Machine en PANNE sur devis</Text>
            <Text>*Machine de Grande surface, sur réserve d’acceptation</Text>
            <Text>
              *Les machines qui nous sont remises à fin de réparation doivent
              être enlevées endéans les 6 mois. Passé ce délai, nous considérons
              les machines comme abandonnées.
            </Text>
            <Text>
              *Au cas où une remise de prix (devis) doit précéder la réparation,
              le prix du démontage et remontage de la machine sera facturé au
              client si celui-ci ne fait pas exécuter la réparation dans nos
              ateliers (25€).
            </Text>
            <Text>
              *Les retards de livraison de pièce de rechange ne peuvent donner
              lieu à dommages et intérêts et ne sont jamais causes de rupture de
              contrats.
            </Text>
            <Text>*Main d'œuvre: 50,00 € / heure TVAC</Text>
          </div>
        </View>
      </View>
    </Page>
  </Document>
);

export default MyDocument;
