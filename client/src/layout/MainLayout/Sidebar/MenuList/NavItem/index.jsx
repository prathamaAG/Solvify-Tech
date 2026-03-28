import PropTypes from 'prop-types';
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

// material-ui
import { useTheme } from '@mui/material/styles';
import { Avatar, Chip, ListItemButton, ListItemIcon, ListItemText, Typography } from '@mui/material';

// assets
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const NavItem = ({ item, level }) => {
  const theme = useTheme();
  const location = useLocation();
  const Icon = item.icon;
  const itemIcon = item.icon ? <Icon color="inherit" /> : <ArrowForwardIcon color="inherit" fontSize={level > 0 ? 'inherit' : 'default'} />;

  const isSelected = location.pathname.startsWith(item.url);

  let itemTarget = '';
  if (item.target) {
    itemTarget = '_blank';
  }

  let listItemProps = { component: Link, to: item.url };
  if (item.external) {
    listItemProps = { component: 'a', href: item.url };
  }

  return (
    <ListItemButton
      disabled={item.disabled}
      sx={{
        borderRadius: '12px',
        marginBottom: '4px',
        pl: `${level * 16}px`,
        py: '10px',
        transition: 'all 0.2s ease-in-out',
        backgroundColor: isSelected
          ? 'rgba(99, 102, 241, 0.2)'
          : 'transparent',
        color: isSelected ? '#FFFFFF' : 'rgba(255, 255, 255, 0.7)',
        '&:hover': {
          backgroundColor: 'rgba(99, 102, 241, 0.15)',
          color: '#FFFFFF',
          '& .MuiListItemIcon-root': {
            color: '#FFFFFF'
          }
        },
        ...(isSelected && {
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.3) 0%, rgba(139, 92, 246, 0.3) 100%)',
          boxShadow: '0 4px 15px rgba(99, 102, 241, 0.2)',
          '&:hover': {
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.4) 0%, rgba(139, 92, 246, 0.4) 100%)',
          }
        })
      }}
      selected={isSelected}
      {...listItemProps}
    >
      <ListItemIcon
        sx={{
          minWidth: 28,
          color: isSelected ? '#FFFFFF' : 'rgba(255, 255, 255, 0.6)',
          transition: 'color 0.2s ease',
          '& .MuiSvgIcon-root': {
            fontSize: '1.2rem'
          }
        }}
      >
        {itemIcon}
      </ListItemIcon>
      <ListItemText
        primary={
          <Typography
            sx={{
              pl: 1,
              fontSize: '0.85rem',
              fontWeight: isSelected ? 600 : 500,
              letterSpacing: '0.01em'
            }}
            color="inherit"
          >
            {item.title}
          </Typography>
        }
        secondary={
          item.caption && (
            <Typography
              variant="caption"
              sx={{
                pl: 1,
                color: 'rgba(255, 255, 255, 0.4)',
                fontSize: '0.65rem'
              }}
              display="block"
              gutterBottom
            >
              {item.caption}
            </Typography>
          )
        }
      />
      {item.chip && (
        <Chip
          color={item.chip.color}
          variant={item.chip.variant}
          size={item.chip.size}
          label={item.chip.label}
          avatar={item.chip.avatar && <Avatar>{item.chip.avatar}</Avatar>}
        />
      )}
    </ListItemButton>
  );
};

NavItem.propTypes = {
  item: PropTypes.object,
  level: PropTypes.number,
  icon: PropTypes.object,
  target: PropTypes.object,
  url: PropTypes.string,
  disabled: PropTypes.bool,
  id: PropTypes.string,
  title: PropTypes.string,
  caption: PropTypes.string,
  chip: PropTypes.object,
  color: PropTypes.string,
  label: PropTypes.string,
  avatar: PropTypes.object
};

export default NavItem;
