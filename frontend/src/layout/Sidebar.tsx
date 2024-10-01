import { Link } from 'react-router-dom';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';

import CustomButton from '../components/CustomButton';
import { useState } from 'react';
import headerData from '../config/header.json';
import { HeaderProps } from './Header';
import { Logo } from '../components/Logo';

interface Props {
  onClose: () => void;
  open: boolean;
}

const Sidebar = ({ open, onClose }: Props): JSX.Element => {
  const theme = useTheme();
  const [header] = useState<HeaderProps>(headerData);

  return (
    <>
      <Drawer
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
          <Box padding={2}>
            <Box paddingY={2}>
              <CustomButton href="#services" text="Services" />
              <Box paddingY={1}>
                <CustomButton href="#about" text="À propos" />
              </Box>
              <Box paddingY={1}>
                <CustomButton href="#contact" text="Contact" />
              </Box>
            </Box>
          </Box>
        </Box>
      </Drawer>
    </>
  );
};

export default Sidebar;
