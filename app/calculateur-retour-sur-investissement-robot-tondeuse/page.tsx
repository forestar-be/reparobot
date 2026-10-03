'use client';

import ROICalculateurWrapper from '../../components/tool/ROICalculator/ROICalculatorWrapper';
import { Suspense, type JSX } from 'react';

export default function ROICalculatorPage(): JSX.Element {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-primary-600"></div>
            <p className="text-gray-600">Chargement du calculateur ROI...</p>
          </div>
        </div>
      }
    >
      <div id="roi-calculator-page">
        <ROICalculateurWrapper />
      </div>
    </Suspense>
  );
}
