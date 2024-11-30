// app/calculator/page.tsx
'use client';

import { Suspense } from 'react';
import CalculatorClientWrapper from '../../components/tool/Calculator/CalculatorClientWrapper';

export default function CalculatorPage(): JSX.Element {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        Loading calculator...
      </div>
    }>
      <div id="calculator-page">
        <CalculatorClientWrapper />
      </div>
    </Suspense>
  );
}