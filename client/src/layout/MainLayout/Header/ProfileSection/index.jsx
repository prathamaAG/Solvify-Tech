import React from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import {
  Fade, Button, ClickAwayListener, Paper, Popper,
  List, ListItemText, ListItemIcon, ListItemButton, ListItem,
  Box, Typography, Divider, Avatar
} from '@mui/material';

// assets
import AccountCircleTwoToneIcon from '@mui/icons-material/AccountCircleTwoTone';
import MeetingRoomTwoToneIcon from '@mui/icons-material/MeetingRoomTwoTone';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import { logoutUser } from '../../../../store/actions/loginActions';

// ==============================|| PROFILE SECTION ||============================== //

const ProfileSection = () => {
  const { email, name } = useSelector((state) => state.login);
  const theme = useTheme();

  const [selectedIndex, setSelectedIndex] = React.useState(1);
  const [open, setOpen] = React.useState(false);
  const anchorRef = React.useRef(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleListItemClick = (event, index) => {
    setSelectedIndex(index);
  };

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }
    setOpen(false);
  };

  const prevOpen = React.useRef(open);
  React.useEffect(() => {
    if (prevOpen.current === true && open === false) {
      anchorRef.current.focus();
    }
    prevOpen.current = open;
  }, [open]);

  const logout = () => {
    dispatch(logoutUser());
    navigate("/login");
  };

  const getInitials = (email) => {
    if (!email) return '?';
    return email.charAt(0).toUpperCase();
  };

  return (
    <>
      <Button
        sx={{
          minWidth: 'auto',
          p: 0.5,
          borderRadius: '12px',
          '&:hover': {
            backgroundColor: 'rgba(255,255,255,0.15)'
          }
        }}
        ref={anchorRef}
        aria-controls={open ? 'menu-list-grow' : undefined}
        aria-haspopup="true"
        aria-label="Profile"
        onClick={handleToggle}
        color="inherit"
      >
        <Avatar
          sx={{
            width: 36,
            height: 36,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.1) 100%)',
            border: '2px solid rgba(255,255,255,0.3)',
            fontSize: '0.9rem',
            fontWeight: 700,
            color: '#fff',
            transition: 'all 0.2s ease',
            '&:hover': {
              borderColor: 'rgba(255,255,255,0.6)',
              transform: 'scale(1.05)'
            }
          }}
        >
          {getInitials(email)}
        </Avatar>
      </Button>
      <Popper
        placement="bottom-end"
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
        modifiers={[
          {
            name: 'offset',
            options: {
              offset: [0, 12]
            }
          },
          {
            name: 'preventOverflow',
            options: {
              altAxis: true
            }
          }
        ]}
      >
        {({ TransitionProps }) => (
          <Fade {...TransitionProps}>
            <Paper
              sx={{
                borderRadius: '16px',
                boxShadow: '0 20px 60px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.06)',
                border: '1px solid rgba(0,0,0,0.06)',
                overflow: 'hidden',
                minWidth: 260
              }}
            >
              <ClickAwayListener onClickAway={handleClose}>
                <Box>
                  {/* User Info Header */}
                  <Box
                    sx={{
                      p: 2.5,
                      background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
                      color: '#fff'
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar
                        sx={{
                          width: 44,
                          height: 44,
                          background: 'rgba(255,255,255,0.2)',
                          border: '2px solid rgba(255,255,255,0.4)',
                          fontSize: '1.1rem',
                          fontWeight: 700
                        }}
                      >
                        {getInitials(email)}
                      </Avatar>
                      <Box>
                        <Typography
                          variant="subtitle1"
                          sx={{ color: '#fff', fontWeight: 600, fontSize: '0.9rem', lineHeight: 1.3 }}
                        >
                          {name || 'User'}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.75rem' }}
                        >
                          {email || "No Email"}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  <List sx={{ p: 1 }}>
                    <ListItemButton
                      sx={{
                        borderRadius: '10px',
                        mb: 0.5,
                        '&:hover': {
                          backgroundColor: '#FEE2E2',
                          '& .MuiListItemIcon-root': { color: '#EF4444' },
                          '& .MuiListItemText-primary': { color: '#EF4444' }
                        }
                      }}
                      onClick={(event) => {
                        handleListItemClick(event, 4);
                        logout();
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 36, color: '#64748B' }}>
                        <MeetingRoomTwoToneIcon sx={{ fontSize: '1.2rem' }} />
                      </ListItemIcon>
                      <ListItemText
                        primary="Logout"
                        primaryTypographyProps={{
                          fontSize: '0.85rem',
                          fontWeight: 500
                        }}
                      />
                    </ListItemButton>
                  </List>
                </Box>
              </ClickAwayListener>
            </Paper>
          </Fade>
        )}
      </Popper>
    </>
  );
};

export default ProfileSection;
