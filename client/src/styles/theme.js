import {
  Button,
  Dialog,
  DialogActions,
  DialogTitle,
  DialogContent,
  DialogContentText
} from "@mui/material";
import { createTheme, adaptV4Theme } from "@mui/material/styles";
import { red, green } from "@mui/material/colors";

export const theme = {
  palette: {
    primary: {
      main: "#2c0940", // dark purple
      light: "#531078" // medium purple
    },
    secondary: {
      main: "#ffce04", // yellow/gold
      light: "#ffffff" //white
    },
    danger: {
      main: red[900], // #b71c1c
      light: red[700] // #d32f2f
    },
    success: {
      main: green[600], // #43A047
      light: green[400] // #66BB6A
    },
    textColor: "#333", // dark gray
    secondaryTextColor: "#531078", // medium purple
    bodyBackground: "#fff", // white
    type: "light"
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 450,
      md: 600,
      lg: 960,
      xl: 1280
    }
  },
  typography: {
    useNextVariants: true,
    fontFamily: [
      '"Source Sans Pro"',
      '"Helvetica Neue"',
      "Helvetica",
      "Arial",
      "sans-serif"
    ].join(",")
  },
  components: {
    MuiMenu: {
      styleOverrides: {
        paper: {
          position: "absolute",
          top: "56px !important",
          right: "0 !important",
          left: "50% !important",
          borderRadius: "0 !important",
          bottom: "0 !important",
          maxHeight: "calc(100vh - 109px) !important",
          filter: "none !important"
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          fontFamily: [
            '"Source Sans Pro"',
            '"Helvetica Neue"',
            "Helvetica",
            "Arial",
            "sans-serif"
          ].join(","),
          fontWeight: 400,
          textDecoration: "none"
        }
      }
    },
    MuiFormLabel: {
      styleOverrides: {
        root: {
          "&$focused": {
            "&$focused": {
              color: "secondary"
            }
          }
        }
      }
    },
    "MuiButton-outlinedSecondary": {
      styleOverrides: {
        border: 2
      }
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          fontFamily: [
            '"Source Sans Pro"',
            '"Helvetica Neue"',
            "Helvetica",
            "Arial",
            "sans-serif"
          ].join(",")
        }
      }
    }
  }
};
export default createTheme(adaptV4Theme(theme));
