import PropTypes from 'prop-types';
import React from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import { Box, Grid, IconButton, Typography } from '@mui/material';

// project import
import ProfileSection from './ProfileSection';
import NotificationSection from './NotificationSection';
import { drawerWidth } from '../../../config';

// assets
import MenuTwoToneIcon from '@mui/icons-material/MenuTwoTone';
import logo from '../../../assets/images/SolvifyTech.png';

// ==============================|| HEADER ||============================== //

const Header = ({ drawerToggle }) => {
  const theme = useTheme();

  return (
    <>
      <Box width={drawerWidth} sx={{ zIndex: 1201 }}>
        <Grid container justifyContent="space-between" alignItems="center">
          <Box sx={{ display: { xs: 'none', md: 'block' } }}>
            <Grid item>
              <Box mt={0.5} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <img
                  src={logo}
                  alt="Logo"
                  style={{
                    height: '36px',
                    width: '110px',
                    filter: 'brightness(0) invert(1)',
                    opacity: 0.95
                  }}
                />
              </Box>
            </Grid>
          </Box>
          <Grid item>
            <IconButton
              edge="start"
              sx={{
                mr: theme.spacing(1.25),
                color: 'rgba(255,255,255,0.9)',
                borderRadius: '10px',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.15)'
                }
              }}
              aria-label="open drawer"
              onClick={drawerToggle}
              size="large"
            >
              <MenuTwoToneIcon sx={{ fontSize: '1.4rem' }} />
            </IconButton>
          </Grid>
        </Grid>
      </Box>
      <Box sx={{ flexGrow: 1 }} />
      <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', mr: 2 }}>
        <Typography
          variant="body2"
          sx={{
            color: 'rgba(255,255,255,0.8)',
            fontWeight: 500,
            fontSize: '0.85rem'
          }}
        >
          Welcome back 👋
        </Typography>
      </Box>
      <NotificationSection />
      <ProfileSection />
    </>
  );
};

Header.propTypes = {
  drawerToggle: PropTypes.func
};

export default Header;
