// material-ui
import { createTheme } from '@mui/material/styles';

// project import
import value from '../assets/scss/_themes-vars.module.scss';

// ==============================|| SOLVIFY MODERN THEME ||============================== //

export function theme(customization) {
  let textPrimary;
  let textSecondary;
  let textDark;
  let textHint;
  let background;
  let paper;
  let menuCaption;
  let textInversePrimary;

  switch (customization.navType) {
    case 'light':
    default:
      textPrimary = textInversePrimary = menuCaption = value.textPrimary;
      textSecondary = value.textSecondary;
      textDark = value.textDark;
      textHint = value.textHint;
      background = value.background;
      paper = value.paper;
      break;
  }

  return createTheme({
    breakpoints: {
      values: {
        xs: 0,
        sm: 768,
        md: 1024,
        lg: 1266,
        xl: 1440
      }
    },
    direction: 'ltr',
    palette: {
      mode: 'light',
      common: {
        black: value.paperDark
      },
      primary: {
        light: value.primaryLight,
        main: value.primary,
        dark: value.primaryDark,
        100: value.primary100
      },
      secondary: {
        light: value.secondaryLight,
        main: value.secondary,
        dark: value.secondaryDark
      },
      error: {
        light: value.errorLight,
        main: value.error,
        dark: value.errorDark
      },
      warning: {
        light: value.warningLight,
        main: value.warning,
        dark: value.warningDark
      },
      info: {
        light: value.infoLight,
        main: value.info,
        dark: value.infoDark
      },
      success: {
        light: value.successLight,
        main: value.success,
        dark: value.successDark
      },
      grey: {
        300: value.grey300,
        400: value.grey400
      },
      bg: {
        100: value.bg100
      },
      textDark: {
        color: textDark
      },
      text: {
        primary: textPrimary,
        secondary: textSecondary,
        dark: textDark,
        hint: textHint
      },
      background: {
        paper: paper,
        default: background
      }
    },
    typography: {
      fontFamily: `'Inter', 'Poppins', sans-serif`,
      h6: {
        fontWeight: 600,
        color: textSecondary,
        fontSize: '0.875rem',
        letterSpacing: '-0.01em'
      },
      h5: {
        fontSize: '1.125rem',
        color: textSecondary,
        fontWeight: 600,
        letterSpacing: '-0.01em'
      },
      h4: {
        fontSize: '1.25rem',
        color: textSecondary,
        fontWeight: 600,
        letterSpacing: '-0.02em'
      },
      h3: {
        fontSize: '1.5rem',
        color: textDark,
        fontWeight: 700,
        letterSpacing: '-0.02em'
      },
      h2: {
        fontSize: '2rem',
        color: textDark,
        fontWeight: 700,
        letterSpacing: '-0.02em'
      },
      h1: {
        fontSize: '2.2rem',
        color: textDark,
        fontWeight: 800,
        letterSpacing: '-0.03em'
      },
      subtitle1: {
        fontSize: '0.875rem',
        fontWeight: 500,
        color: textSecondary,
        lineHeight: '1.643em'
      },
      subtitle2: {
        fontSize: '0.8125rem',
        fontWeight: 400
      },
      caption: {
        fontSize: '0.68rem',
        color: textHint,
        fontWeight: 500
      },
      body1: {
        fontSize: '0.875rem',
        fontWeight: 400,
        lineHeight: '1.643em'
      },
      body2: {
        letterSpacing: '0em',
        fontWeight: 400,
        lineHeight: '1.643em'
      },
      menuCaption: {
        fontSize: '0.6875rem',
        fontWeight: 700,
        color: value.primary,
        padding: '5px 15px 5px',
        textTransform: 'uppercase',
        marginTop: '10px',
        letterSpacing: '0.08em'
      },
      subMenuCaption: {
        fontSize: '0.6875rem',
        fontWeight: 400,
        color: menuCaption,
        textTransform: 'capitalize'
      }
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          '@import': "url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap')",
          body: {
            scrollbarWidth: 'thin',
            scrollbarColor: `${value.primaryLight} transparent`,
            '&::-webkit-scrollbar': {
              width: '6px',
              height: '6px'
            },
            '&::-webkit-scrollbar-thumb': {
              background: value.primaryLight,
              borderRadius: '3px'
            },
            '&::-webkit-scrollbar-track': {
              background: 'transparent'
            }
          }
        }
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: '12px',
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '0.875rem',
            padding: '8px 20px',
            boxShadow: 'none',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.25)',
              transform: 'translateY(-1px)'
            },
            '&:active': {
              transform: 'translateY(0)'
            }
          },
          contained: {
            '&:hover': {
              boxShadow: '0 6px 16px rgba(99, 102, 241, 0.3)'
            }
          },
          outlined: {
            borderWidth: '1.5px',
            '&:hover': {
              borderWidth: '1.5px'
            }
          }
        }
      },
      MuiList: {
        styleOverrides: {
          root: {
            overflow: 'hidden'
          }
        }
      },
      MuiSvgIcon: {
        styleOverrides: {
          root: {
            fontSize: '1.3rem'
          },
          fontSizeInherit: {
            fontSize: 'inherit'
          },
          fontSizeLarge: {
            fontSize: '2.1875rem'
          }
        }
      },
      MuiListItem: {
        styleOverrides: {
          root: {
            color: textInversePrimary,
            paddingTop: '10px',
            paddingBottom: '10px',
            '&.Mui-selected': {
              '& .MuiListItemIcon-root': {
                color: '#fff'
              },
              color: '#fff',
              backgroundColor: value.primary,
              borderRadius: '12px',
              '&:hover': {
                backgroundColor: value.primaryDark
              }
            },
            '&:hover': {
              backgroundColor: value.menuHover,
              borderRadius: '12px',
              '& .MuiListItemIcon-root': {
                color: value.primary
              }
            }
          }
        }
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            color: textInversePrimary,
            paddingTop: '10px',
            paddingBottom: '10px',
            borderRadius: '12px',
            marginBottom: '4px',
            transition: 'all 0.2s ease-in-out',
            '&.Mui-selected': {
              '& .MuiListItemIcon-root': {
                color: '#fff'
              },
              color: '#fff',
              background: `linear-gradient(135deg, ${value.primary} 0%, ${value.secondary} 100%)`,
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
              '&:hover': {
                background: `linear-gradient(135deg, ${value.primaryDark} 0%, ${value.secondaryDark} 100%)`
              }
            },
            '&:hover': {
              backgroundColor: value.menuHover,
              borderRadius: '12px',
              color: value.primary,
              '& .MuiListItemIcon-root': {
                color: value.primary
              }
            }
          }
        }
      },
      MuiListItemIcon: {
        styleOverrides: {
          root: {
            minWidth: '36px',
            color: textInversePrimary
          }
        }
      },
      MuiAccordion: {
        styleOverrides: {
          root: {
            boxShadow: 'none'
          }
        }
      },
      MuiAccordionSummary: {
        styleOverrides: {
          root: {
            fontWeight: 600,
            fontSize: '0.875rem'
          },
          content: {
            color: textSecondary,
            fontWeight: 500
          }
        }
      },
      MuiPaper: {
        styleOverrides: {
          elevation1: {
            boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.03)'
          },
          rounded: {
            borderRadius: '16px'
          }
        }
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: '16px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.03)',
            transition: 'all 0.3s ease-in-out',
            '&:hover': {
              boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
              transform: 'translateY(-2px)'
            }
          }
        }
      },
      MuiCardHeader: {
        styleOverrides: {
          root: {
            color: textDark,
            padding: '24px'
          }
        }
      },
      MuiCardContent: {
        styleOverrides: {
          root: {
            padding: '24px'
          }
        }
      },
      MuiCardActions: {
        styleOverrides: {
          root: {
            padding: '24px'
          }
        }
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: '8px',
            fontWeight: 500,
            fontSize: '0.75rem'
          }
        }
      },
      MuiTab: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '0.875rem',
            minHeight: '40px',
            borderRadius: '10px',
            margin: '0 4px',
            transition: 'all 0.2s ease',
            '&.Mui-selected': {
              color: value.primary,
              backgroundColor: value.menuHover
            }
          }
        }
      },
      MuiTabs: {
        styleOverrides: {
          indicator: {
            height: '3px',
            borderRadius: '3px 3px 0 0'
          }
        }
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: '12px',
              transition: 'all 0.2s ease',
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: value.primary
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderWidth: '2px'
              }
            }
          }
        }
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: '20px',
            boxShadow: '0 25px 50px rgba(0,0,0,0.15)'
          }
        }
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            borderRadius: '8px',
            fontSize: '0.75rem',
            fontWeight: 500
          }
        }
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            borderRadius: '10px',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              transform: 'scale(1.05)'
            }
          }
        }
      }
    }
  });
}

export default theme;
