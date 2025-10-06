import { createTheme } from '@mui/material/styles';

// UBold-inspired color palette
const colors = {
  primary: {
    50: '#e3f2fd',
    100: '#bbdefb',
    200: '#90caf9',
    300: '#64b5f6',
    400: '#42a5f5',
    500: '#2196f3', // Main primary
    600: '#1e88e5',
    700: '#1976d2',
    800: '#1565c0',
    900: '#0d47a1',
  },
  secondary: {
    50: '#f3e5f5',
    100: '#e1bee7',
    200: '#ce93d8',
    300: '#ba68c8',
    400: '#ab47bc',
    500: '#9c27b0', // Main secondary
    600: '#8e24aa',
    700: '#7b1fa2',
    800: '#6a1b9a',
    900: '#4a148c',
  },
  success: {
    50: '#e8f5e8',
    100: '#c8e6c9',
    200: '#a5d6a7',
    300: '#81c784',
    400: '#66bb6a',
    500: '#4caf50', // Main success
    600: '#43a047',
    700: '#388e3c',
    800: '#2e7d32',
    900: '#1b5e20',
  },
  warning: {
    50: '#fff8e1',
    100: '#ffecb3',
    200: '#ffe082',
    300: '#ffd54f',
    400: '#ffca28',
    500: '#ffc107', // Main warning
    600: '#ffb300',
    700: '#ffa000',
    800: '#ff8f00',
    900: '#ff6f00',
  },
  error: {
    50: '#ffebee',
    100: '#ffcdd2',
    200: '#ef9a9a',
    300: '#e57373',
    400: '#ef5350',
    500: '#f44336', // Main error
    600: '#e53935',
    700: '#d32f2f',
    800: '#c62828',
    900: '#b71c1c',
  },
  info: {
    50: '#e1f5fe',
    100: '#b3e5fc',
    200: '#81d4fa',
    300: '#4fc3f7',
    400: '#29b6f6',
    500: '#03a9f4', // Main info
    600: '#039be5',
    700: '#0288d1',
    800: '#0277bd',
    900: '#01579b',
  },
  gray: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#eeeeee',
    300: '#e0e0e0',
    400: '#bdbdbd',
    500: '#9e9e9e',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },
  dark: {
    50: '#f5f6f8',
    100: '#e9ecef',
    200: '#dee2e6',
    300: '#ced4da',
    400: '#adb5bd',
    500: '#6c757d',
    600: '#495057',
    700: '#343a40',
    800: '#212529',
    900: '#0d1117',
  }
};

// Create UBold-inspired theme
const uboldTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: colors.primary[600],
      light: colors.primary[400],
      dark: colors.primary[800],
      contrastText: '#ffffff',
    },
    secondary: {
      main: colors.secondary[500],
      light: colors.secondary[300],
      dark: colors.secondary[700],
      contrastText: '#ffffff',
    },
    success: {
      main: colors.success[500],
      light: colors.success[300],
      dark: colors.success[700],
      contrastText: '#ffffff',
    },
    warning: {
      main: colors.warning[500],
      light: colors.warning[300],
      dark: colors.warning[700],
      contrastText: '#000000',
    },
    error: {
      main: colors.error[500],
      light: colors.error[300],
      dark: colors.error[700],
      contrastText: '#ffffff',
    },
    info: {
      main: colors.info[500],
      light: colors.info[300],
      dark: colors.info[700],
      contrastText: '#ffffff',
    },
    background: {
      default: '#f5f6f8',
      paper: '#ffffff',
    },
    text: {
      primary: colors.dark[800],
      secondary: colors.dark[600],
      disabled: colors.gray[500],
    },
    divider: colors.gray[200],
    action: {
      hover: 'rgba(0, 0, 0, 0.04)',
      selected: 'rgba(33, 150, 243, 0.08)',
      disabled: colors.gray[400],
      disabledBackground: colors.gray[100],
    },
  },
  typography: {
    fontFamily: "Public Sans", sans-serif,
    fontSize: 14,
    fontWeightLight: 300,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 600,
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
      lineHeight: 1.2,
      color: colors.dark[800],
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      lineHeight: 1.3,
      color: colors.dark[800],
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      lineHeight: 1.3,
      color: colors.dark[800],
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
      color: colors.dark[800],
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.4,
      color: colors.dark[800],
    },
    h6: {
      fontSize: '1.125rem',
      fontWeight: 600,
      lineHeight: 1.4,
      color: colors.dark[800],
    },
    subtitle1: {
      fontSize: '1rem',
      fontWeight: 500,
      lineHeight: 1.5,
      color: colors.dark[700],
    },
    subtitle2: {
      fontSize: '0.875rem',
      fontWeight: 500,
      lineHeight: 1.5,
      color: colors.dark[700],
    },
    body1: {
      fontSize: '1rem',
      fontWeight: 400,
      lineHeight: 1.6,
      color: colors.dark[700],
    },
    body2: {
      fontSize: '0.875rem',
      fontWeight: 400,
      lineHeight: 1.6,
      color: colors.dark[600],
    },
    caption: {
      fontSize: '0.75rem',
      fontWeight: 400,
      lineHeight: 1.5,
      color: colors.dark[500],
    },
    overline: {
      fontSize: '0.75rem',
      fontWeight: 500,
      lineHeight: 1.5,
      textTransform: 'uppercase',
      letterSpacing: '0.08em',
      color: colors.dark[500],
    },
    button: {
      fontSize: '0.875rem',
      fontWeight: 500,
      textTransform: 'none',
      letterSpacing: '0.02em',
    },
  },
  spacing: 8,
  shape: {
    borderRadius: 8,
  },
  shadows: [
    'none',
    '0px 1px 3px rgba(0, 0, 0, 0.12), 0px 1px 2px rgba(0, 0, 0, 0.24)',
    '0px 3px 6px rgba(0, 0, 0, 0.16), 0px 3px 6px rgba(0, 0, 0, 0.23)',
    '0px 10px 20px rgba(0, 0, 0, 0.19), 0px 6px 6px rgba(0, 0, 0, 0.23)',
    '0px 14px 28px rgba(0, 0, 0, 0.25), 0px 10px 10px rgba(0, 0, 0, 0.22)',
    '0px 19px 38px rgba(0, 0, 0, 0.30), 0px 15px 12px rgba(0, 0, 0, 0.22)',
    '0px 2px 4px rgba(0, 0, 0, 0.1)',
    '0px 4px 8px rgba(0, 0, 0, 0.12)',
    '0px 8px 16px rgba(0, 0, 0, 0.14)',
    '0px 16px 24px rgba(0, 0, 0, 0.16)',
    '0px 24px 32px rgba(0, 0, 0, 0.18)',
    '0px 32px 40px rgba(0, 0, 0, 0.20)',
    '0px 40px 48px rgba(0, 0, 0, 0.22)',
    '0px 48px 56px rgba(0, 0, 0, 0.24)',
    '0px 56px 64px rgba(0, 0, 0, 0.26)',
    '0px 64px 72px rgba(0, 0, 0, 0.28)',
    '0px 72px 80px rgba(0, 0, 0, 0.30)',
    '0px 80px 88px rgba(0, 0, 0, 0.32)',
    '0px 88px 96px rgba(0, 0, 0, 0.34)',
    '0px 96px 104px rgba(0, 0, 0, 0.36)',
    '0px 104px 112px rgba(0, 0, 0, 0.38)',
    '0px 112px 120px rgba(0, 0, 0, 0.40)',
    '0px 120px 128px rgba(0, 0, 0, 0.42)',
    '0px 128px 136px rgba(0, 0, 0, 0.44)',
    '0px 136px 144px rgba(0, 0, 0, 0.46)',
  ],
  components: {
    // Button Components
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 6,
          fontWeight: 500,
          fontSize: '0.875rem',
          padding: '8px 16px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
          },
        },
        contained: {
          '&:hover': {
            boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.15)',
          },
        },
        outlined: {
          borderWidth: '1.5px',
          '&:hover': {
            borderWidth: '1.5px',
          },
        },
        sizeSmall: {
          padding: '6px 12px',
          fontSize: '0.8125rem',
        },
        sizeLarge: {
          padding: '10px 20px',
          fontSize: '0.9375rem',
        },
      },
    },
    
    // Card Components
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.12), 0px 1px 2px rgba(0, 0, 0, 0.24)',
          border: `1px solid ${colors.gray[200]}`,
          '&:hover': {
            boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.15)',
          },
        },
      },
    },
    
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: '24px',
          '&:last-child': {
            paddingBottom: '24px',
          },
        },
      },
    },
    
    // Paper Components
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          border: `1px solid ${colors.gray[200]}`,
        },
        elevation1: {
          boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.12), 0px 1px 2px rgba(0, 0, 0, 0.24)',
        },
      },
    },
    
    // Input Components
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 6,
            backgroundColor: '#ffffff',
            '& fieldset': {
              borderColor: colors.gray[300],
              borderWidth: '1.5px',
            },
            '&:hover fieldset': {
              borderColor: colors.primary[400],
            },
            '&.Mui-focused fieldset': {
              borderColor: colors.primary[600],
              borderWidth: '2px',
            },
          },
          '& .MuiInputLabel-root': {
            color: colors.dark[600],
            fontWeight: 500,
            '&.Mui-focused': {
              color: colors.primary[600],
            },
          },
        },
      },
    },
    
    MuiSelect: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          backgroundColor: '#ffffff',
        },
      },
    },
    
    // Table Components
    MuiTable: {
      styleOverrides: {
        root: {
          borderCollapse: 'separate',
          borderSpacing: 0,
        },
      },
    },
    
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: colors.gray[50],
          '& .MuiTableCell-head': {
            backgroundColor: colors.gray[50],
            color: colors.dark[800],
            fontWeight: 600,
            fontSize: '0.875rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            borderBottom: `2px solid ${colors.gray[200]}`,
            padding: '16px',
          },
        },
      },
    },
    
    MuiTableBody: {
      styleOverrides: {
        root: {
          '& .MuiTableRow-root': {
            '&:hover': {
              backgroundColor: colors.gray[50],
            },
            '&:nth-of-type(even)': {
              backgroundColor: 'rgba(0, 0, 0, 0.02)',
            },
          },
          '& .MuiTableCell-body': {
            color: colors.dark[700],
            fontSize: '0.875rem',
            borderBottom: `1px solid ${colors.gray[200]}`,
            padding: '16px',
          },
        },
      },
    },
    
    // Chip Components
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 500,
          fontSize: '0.75rem',
        },
        colorPrimary: {
          backgroundColor: colors.primary[100],
          color: colors.primary[800],
        },
        colorSecondary: {
          backgroundColor: colors.secondary[100],
          color: colors.secondary[800],
        },
        colorSuccess: {
          backgroundColor: colors.success[100],
          color: colors.success[800],
        },
        colorWarning: {
          backgroundColor: colors.warning[100],
          color: colors.warning[800],
        },
        colorError: {
          backgroundColor: colors.error[100],
          color: colors.error[800],
        },
        colorInfo: {
          backgroundColor: colors.info[100],
          color: colors.info[800],
        },
      },
    },
    
    // Drawer Components
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#ffffff',
          borderRight: `1px solid ${colors.gray[200]}`,
          boxShadow: '2px 0 8px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    
    // AppBar Components
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          color: colors.dark[800],
          boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.12), 0px 1px 2px rgba(0, 0, 0, 0.24)',
          borderBottom: `1px solid ${colors.gray[200]}`,
        },
      },
    },
    
    // List Components
    MuiListItem: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          margin: '2px 8px',
          '&.Mui-selected': {
            backgroundColor: colors.primary[50],
            color: colors.primary[700],
            '&:hover': {
              backgroundColor: colors.primary[100],
            },
            '& .MuiListItemIcon-root': {
              color: colors.primary[600],
            },
          },
          '&:hover': {
            backgroundColor: colors.gray[50],
          },
        },
      },
    },
    
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          color: colors.dark[600],
          minWidth: '40px',
        },
      },
    },
    
    MuiListItemText: {
      styleOverrides: {
        primary: {
          fontSize: '0.875rem',
          fontWeight: 500,
          color: colors.dark[700],
        },
        secondary: {
          fontSize: '0.75rem',
          color: colors.dark[500],
        },
      },
    },
    
    // Dialog Components
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 12,
          boxShadow: '0px 10px 20px rgba(0, 0, 0, 0.19), 0px 6px 6px rgba(0, 0, 0, 0.23)',
        },
      },
    },
    
    // Tabs Components
    MuiTabs: {
      styleOverrides: {
        root: {
          borderBottom: `1px solid ${colors.gray[200]}`,
        },
        indicator: {
          backgroundColor: colors.primary[600],
          height: 3,
          borderRadius: '3px 3px 0 0',
        },
      },
    },
    
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          fontSize: '0.875rem',
          color: colors.dark[600],
          '&.Mui-selected': {
            color: colors.primary[600],
          },
        },
      },
    },
    
    // Alert Components
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontSize: '0.875rem',
        },
        standardSuccess: {
          backgroundColor: colors.success[50],
          color: colors.success[800],
          border: `1px solid ${colors.success[200]}`,
        },
        standardError: {
          backgroundColor: colors.error[50],
          color: colors.error[800],
          border: `1px solid ${colors.error[200]}`,
        },
        standardWarning: {
          backgroundColor: colors.warning[50],
          color: colors.warning[800],
          border: `1px solid ${colors.warning[200]}`,
        },
        standardInfo: {
          backgroundColor: colors.info[50],
          color: colors.info[800],
          border: `1px solid ${colors.info[200]}`,
        },
      },
    },
  },
});

export default uboldTheme;
export { colors };