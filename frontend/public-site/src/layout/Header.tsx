import { useContext,useEffect, useState  } from 'react';

import AppBar from '@mui/material/AppBar';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import MenuIcon from '@mui/icons-material/Menu';
import { alpha, useTheme } from '@mui/material/styles';

import CalculatorDropdown from '../components/CalculatorDropdown';
import CustomButton from '../components/CustomButton';


import ColorModeContext from '../utils/ColorModeContext';
import headerData from '../config/header.json';
import { Logo } from '../components/Logo';


interface Props {
  onSidebarOpen: () => void;
}

export interface HeaderProps {
  title: string;
}







const Header = ({ onSidebarOpen }: Props): JSX.Element => {
  const theme = useTheme();
  const colorMode = useContext(ColorModeContext);
  const [header] = useState<HeaderProps>(headerData);
  const [isHomePage, setIsHomePage] = useState(true);

  useEffect(() => {
    // Update isHomePage when the component mounts and when the pathname changes
    setIsHomePage(window.location.pathname === '/');
  }, []);
  return (
    <>
      <AppBar
        color="transparent"
        position="sticky"
        sx={{
          border: 0,
          padding: '10px 0',
          top: 'auto',
          boxShadow:
            '0 4px 18px 0px rgba(0, 0, 0, 0.12), 0 7px 10px -5px rgba(0, 0, 0, 0.15)',
        }}
      >
        <Toolbar sx={{ minHeight: 70 }}>
          <Link href="/" sx={{ textDecoration: 'none' }}>
            <IconButton size="large" disabled>
              <Logo isDark={theme.palette.mode === 'dark'} />
              <Box sx={{ display: { md: 'inline', xs: 'none' } }}>
                <Typography
                  variant="h6"
                  sx={{
                    flexGrow: 1,
                    color: theme.palette.text.primary,
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    textDecoration: 'none',
                    marginLeft: '10px',
                  }}
                >
                  {header.title}
                </Typography>
              </Box>
            </IconButton>
          </Link>
          <Box sx={{ flexGrow: 1 }} />
          <Box
            sx={{
              alignItems: 'center',
              display: { lg: 'flex', md: 'none', xs: 'none' },
            }}
          >
            <CustomButton
              href={isHomePage ? '#services' : '/#services'}
              text="Services"
            />
            <CustomButton
              href={isHomePage ? '#about' : '/#about'}
              text="À propos"
            />
            <CustomButton
              href={isHomePage ? '#contact' : '/#contact'}
              text="Contact"
            />
            {/* <CalculatorDropdown /> */}
          </Box>

          <Divider
            orientation="vertical"
            sx={{
              height: 32,
              marginX: 2,
              display: { lg: 'flex', md: 'none', xs: 'none' },
            }}
          />
          <Box sx={{ display: 'flex' }}>
            <IconButton
              onClick={colorMode.toggleColorMode}
              aria-label="Theme Mode"
              color={theme.palette.mode === 'dark' ? 'warning' : 'inherit'}
            >
              {theme.palette.mode === 'dark' ? (
                <Tooltip title="Passer en mode clair">
                  <LightModeIcon fontSize="medium" />
                </Tooltip>
              ) : (
                <Tooltip title="Passer en mode sombre">
                  <DarkModeIcon fontSize="medium" />
                </Tooltip>
              )}
            </IconButton>
          </Box>
          <Box
            sx={{
              display: { md: 'block', lg: 'none' },
            }}
            alignItems="center"
          >
            <Button
              onClick={() => onSidebarOpen()}
              aria-label="Menu"
              variant="outlined"
              sx={{
                borderRadius: 0,
                minWidth: 'auto',
                padding: 1,
                borderColor: alpha(theme.palette.divider, 0.2),
              }}
            >
              <MenuIcon
                sx={{
                  color:
                    theme.palette.mode === 'dark'
                      ? theme.palette.primary.main
                      : theme.palette.success.dark,
                }}
              />
            </Button>
          </Box>
        </Toolbar>
      </AppBar>
    </>
  );
};

export default Header;
