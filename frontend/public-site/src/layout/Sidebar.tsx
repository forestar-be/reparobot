 

import { Link } from 'react-router-dom';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';

import CustomButton from '../components/CustomButton';
import { useEffect, useState  } from 'react';

import headerData from '../config/header.json';
import { HeaderProps } from './Header';
import { Logo } from '../components/Logo';

import CalculatorDropdown from '../components/CalculatorDropdown';

interface Props {
  onClose: () => void;
  open: boolean;
}

const Sidebar = ({ open, onClose }: Props): JSX.Element => {
  const theme = useTheme();
  const [header] = useState<HeaderProps>(headerData);
  const [isHomePage, setIsHomePage] = useState(true);

  useEffect(() => {
    // Update isHomePage when the component mounts and when the pathname changes
    setIsHomePage(window.location.pathname === '/');
  }, []);
  return (
    <>
      <Drawer
        disableRestoreFocus // to avoid scroll top on close: https://github.com/mui/material-ui/issues/10756
        anchor="left"
        onClose={() => onClose()}
        open={open}
        variant="temporary"
        PaperProps={{
          sx: {
            backgroundColor: theme.palette.background.default,
            width: 256,
          },
        }}
      >
        <Box height="100%">
          <Box width={1}>
            <Link to="/" style={{ textDecoration: 'none' }}>
              <IconButton size="large" disabled>
                <Logo isDark={theme.palette.mode === 'dark'} />
                <Typography
                  variant="h6"
                  sx={{
                    flexGrow: 1,
                    color: theme.palette.text.primary,
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    textDecoration: 'none',
                    marginLeft: 1,
                  }}
                >
                  {header.title}
                </Typography>
              </IconButton>
            </Link>
          </Box>
          <div className="hidden lg:flex items-center p-8">
            <div className="py-8">
              <CustomButton
                href={isHomePage ? '#services' : '/#services'}
                text="Services"
              />
              <div className="py-4">
                <CustomButton
                  href={isHomePage ? '#about' : '/#about'}
                  text="À propos"
                />
              </div>
              <div className="py-4">
                <CustomButton
                  href={isHomePage ? '#contact' : '/#contact'}
                  text="Contact"
                />
              </div>
              <CalculatorDropdown />
            </div>
          </div>
        </Box>
      </Drawer>
    </>
  );
};

export default Sidebar;
