import MyDocument from './Document';
import React from 'react';
import {
  getFormattedWorkingTime,
  getSuffixPriceDevis,
  getTotalPrice,
  getTotalPriceParts,
  getWorkingTimePrice,
  replacedPartToString,
} from '../../utils/singleRepair.utils';
import { MachineRepair } from '../../utils/types';

export const SingleRepairDocument = (
  repair: MachineRepair,
  hourlyRate: number,
  priceDevis: number,
  conditions: string,
  address: string,
  phone: string,
  email: string,
  website: string,
  pdfTitle: string,
) => {
  return (
    <MyDocument
      dateDuDepot={new Date(repair.createdAt).toLocaleDateString('fr-FR')}
      gSMClient={repair.phone}
      nom={`${repair.first_name} ${repair.last_name}`}
      code={repair.id.toString()}
      type={repair.machine_type_name}
      codeRobot={repair.robot_code}
      modele={repair.brand_name}
      typeReparation={repair.repair_or_maintenance}
      avecGarantie={repair.warranty ? 'Oui' : 'Non'}
      remarques={repair.fault_description}
      prix={getWorkingTimePrice(repair, hourlyRate)}
      tempsPasse={getFormattedWorkingTime(repair.working_time_in_sec, false)}
      piecesRemplacees={
        repair.replaced_part_list.map(replacedPartToString).join(', ') ||
        'Aucune'
      }
      travailEffectue={repair.remark ?? ''}
      avecDevis={
        repair.devis ? `Oui${getSuffixPriceDevis(repair, priceDevis)}` : 'Non'
      }
      prixPieces={getTotalPriceParts(repair)}
      prixTotal={getTotalPrice(repair, hourlyRate)}
      conditions={conditions}
      address={address}
      phone={phone}
      email={email}
      website={website}
      pdfTitle={pdfTitle}
    />
  );
};
