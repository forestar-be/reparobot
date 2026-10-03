// app/calculator/page.tsx
'use client';

import CalculatorClientWrapper from '../../components/tool/Calculator/CalculatorClientWrapper';
import { Suspense, type JSX } from 'react';

// app/calculator/page.tsx

// app/calculator/page.tsx

export default function CalculatorPage(): JSX.Element {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          Loading calculator...
        </div>
      }
    >
      <div id="calculator-page">
        <CalculatorClientWrapper />
      </div>
    </Suspense>
  );
}
