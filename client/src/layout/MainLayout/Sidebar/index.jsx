import PropTypes from 'prop-types';
import React from 'react';

// material-ui
import { useTheme, styled } from '@mui/material/styles';
import { useMediaQuery, Divider, Drawer, Grid, Box } from '@mui/material';

// third party
import PerfectScrollbar from 'react-perfect-scrollbar';

// project import
import MenuList from './MenuList';
import { drawerWidth } from '../../../config';

// assets
import logo from '../../../assets/images/SolvifyTech.png';

// custom style
const Nav = styled((props) => <nav {...props} />)(({ theme }) => ({
  [theme.breakpoints.up('md')]: {
    width: drawerWidth,
    flexShrink: 0
  }
}));

// ==============================|| SIDEBAR ||============================== //

const Sidebar = ({ drawerOpen, drawerToggle, window }) => {
  const theme = useTheme();
  const matchUpMd = useMediaQuery(theme.breakpoints.up('md'));
  const drawer = (
    <>
      <Box sx={{ display: { md: 'none', xs: 'block' } }}>
        <Grid
          container
          direction="row"
          justifyContent="center"
          elevation={5}
          alignItems="center"
          spacing={0}
          sx={{
            ...theme.mixins.toolbar,
            lineHeight: 0,
            background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
          }}
        >
          <Grid item>
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
          </Grid>
        </Grid>
      </Box>
      <PerfectScrollbar
        style={{
          height: 'calc(100vh - 65px)',
          padding: '16px 12px'
        }}
      >
        <MenuList />
      </PerfectScrollbar>
    </>
  );

  const container = window !== undefined ? () => window().document.body : undefined;

  return (
    <Nav>
      <Drawer
        container={container}
        variant={matchUpMd ? 'persistent' : 'temporary'}
        anchor="left"
        open={drawerOpen}
        onClose={drawerToggle}
        sx={{
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            borderRight: 'none',
            background: '#1E1B4B',
            boxShadow: '4px 0 24px rgba(30, 27, 75, 0.15)',
            top: { md: 64, sm: 0 }
          }
        }}
        ModalProps={{ keepMounted: true }}
      >
        {drawer}
      </Drawer>
    </Nav>
  );
};

Sidebar.propTypes = {
  drawerOpen: PropTypes.bool,
  drawerToggle: PropTypes.func,
  window: PropTypes.object
};

export default Sidebar;
