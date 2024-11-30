'use client';

import { Suspense } from 'react';
// import dynamic from 'next/dynamic';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import ROICalculateurWrapper from  '../../components/tool/ROICalculator/ROICalculatorWrapper'

// // Dynamically import the wrapper with no SSR
// const ROICalculateurWrapper = dynamic(
//   () => import('../../components/tool/ROICalculator/ROICalculatorWrapper'),
//   { ssr: false }
// );

const theme = createTheme(); // You can customize the theme here

export default function ROICalculatorPage(): JSX.Element {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        Loading ROI calculator...
      </div>
    }>
      <ThemeProvider theme={theme}>
        <div id="roi-calculator-page">
          <ROICalculateurWrapper />
        </div>
      </ThemeProvider>
    </Suspense>
  );
}