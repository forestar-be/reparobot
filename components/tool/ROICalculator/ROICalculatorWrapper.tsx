'use client';

// import dynamic from 'next/dynamic';
import { useTheme } from '@mui/material/styles';
import ROICalculator from "./ROICalculator";
// // Dynamically import ROICalculator with no SSR
// const ROICalculator = dynamic(
//   () => import('./ROICalculator'),
//   { ssr: false }
// );

export default function ROICalculateurWrapper() {
  const theme = useTheme();
  return <ROICalculator theme={theme} />;
}