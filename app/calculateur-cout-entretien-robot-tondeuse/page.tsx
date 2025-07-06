// app/calculator/page.tsx
'use client';

import CalculatorClientWrapper from '../../components/tool/Calculator/CalculatorClientWrapper';
import { Suspense } from 'react';

// app/calculator/page.tsx

// app/calculator/page.tsx

export default function CalculatorPage(): JSX.Element {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
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
