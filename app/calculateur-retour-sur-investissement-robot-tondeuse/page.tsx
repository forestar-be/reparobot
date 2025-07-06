'use client';

import ROICalculateurWrapper from '../../components/tool/ROICalculator/ROICalculatorWrapper';
import { Suspense } from 'react';

export default function ROICalculatorPage(): JSX.Element {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-primary-600"></div>
            <p className="text-gray-600">Chargement du calculateur ROI...</p>
          </div>
        </div>
      }
    >
      <div id="roi-calculator-page" className="min-h-screen bg-gray-50">
        <ROICalculateurWrapper />
      </div>
    </Suspense>
  );
}
