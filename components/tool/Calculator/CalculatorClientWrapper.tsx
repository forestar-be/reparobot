// components/tool/Calculator/CalculatorClientWrapper.tsx
'use client';

import { useTheme } from '@mui/material/styles';
import Calculator from './Calculator';

export default function CalculatorClientWrapper() {
  const theme = useTheme();

  return <Calculator theme={theme} />;
}