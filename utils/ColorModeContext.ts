// utils/ColorModeContext.ts
import React from 'react';

interface ColorModeContextType {
  toggleColorMode: () => void;
  isDark: boolean; // Add isDark property
}

const ColorModeContext = React.createContext<ColorModeContextType>({
  toggleColorMode: () => {},
  isDark: false, // Default value
});

export default ColorModeContext;
