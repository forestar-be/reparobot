import {useState  } from 'react';

import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import {  useTheme } from '@mui/material/styles';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';

// Helper function to get the correct href
const getHref = (path: string): string => {
    // If we're not on the homepage (/)
    if (window.location.pathname !== '/') {
      return `/${path}`;
    }
    return path;
  };
  
  

const CalculatorDropdown = (): JSX.Element => {
    const theme = useTheme();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
  
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      setAnchorEl(event.currentTarget);
    };
  
    const handleClose = () => {
      setAnchorEl(null);
    };
  
  
  
    return (
      <Box>
        <Button
          id="calculator-button"
          aria-controls={open ? 'calculator-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
          onClick={handleClick}
          endIcon={<KeyboardArrowDownIcon />}
          sx={{
            color: theme.palette.text.primary,
            fontWeight: 500,
            size: 'large',
            marginX: 1,
          }}
        >
          Calculateurs
        </Button>
        <Menu
          id="calculator-menu"
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          MenuListProps={{
            'aria-labelledby': 'calculator-button',
          }}
        >
          <MenuItem
            onClick={handleClose}
            component="a"
            href="/calculator"
          >
            Calculateur entretien
          </MenuItem>
          <MenuItem
            onClick={handleClose}
            component="a"
            href="/roi-calculator"
          >
            Calculateur économies
          </MenuItem>
        </Menu>
      </Box>
    );
  };
  
  export default CalculatorDropdown