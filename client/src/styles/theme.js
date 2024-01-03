import {
  Button,
  Dialog,
  DialogActions,
  DialogTitle,
  DialogContent,
  DialogContentText
} from "@mui/material";

import { orange, green } from "@mui/material/colors";
import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    primary: {
      main: "#2c0940", // dark purple
      light: "#531078" // medium purple
    },
    secondary: {
      main: "#ffce04", // yellow/gold
      light: "#ffffff" // white
    },
    danger: {
      main: orange[500], // #b71c1c
      light: orange[300] // #d32f2f
    },
    success: {
      main: green[800], // #43A047
      light: green[500] // #66BB6A
    },
    textColor: "#333", // dark gray
    secondaryTextColor: "#531078", // medium purple
    bodyBackground: "#fff", // white
    mode: "light"
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
          "&.Mui-focused": {
            "&.Mui-focused": {
              color: "secondary"
            }
          }
        }
      }
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {},
        shrink: {
          transform: "translate(12px, -9px) scale(0.75)",
          background: "white",
          padding: "0 4px"
        },
        outlined: {}
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
});

// import { createTheme, adaptV4Theme } from "@mui/material/styles";
// import { red, green } from "@mui/material/colors";
// import { styled } from '@mui/system';

// export const theme = createTheme(adaptV4Theme({
//   palette: {
//     primary: {
//       main: "#2c0940", // dark purple
//       light: "#531078" // medium purple
//     },
//     secondary: {
//       main: "#ffce04", // yellow/gold
//       light: "#ffffff" //white
//     },
//     danger: {
//       main: red[900], // #b71c1c
//       light: red[700] // #d32f2f
//     },
//     success: {
//       main: green[600], // #43A047
//       light: green[400] // #66BB6A
//     },
//     textColor: "#333", // dark gray
//     secondaryTextColor: "#531078", // medium purple
//     bodyBackground: "#fff", // white
//     type: "light"
//   },
//   breakpoints: {
//     values: {
//       xs: 0,
//       sm: 450,
//       md: 600,
//       lg: 960,
//       xl: 1280
//     }
//   },
//   typography: {
//     useNextVariants: true,
//     fontFamily: [
//       '"Source Sans Pro"',
//       '"Helvetica Neue"',
//       "Helvetica",
//       "Arial",
//       "sans-serif"
//     ].join(",")
//   },
//   components: {
//     MuiMenu: {
//       styleOverrides: {
//         paper: {
//           position: "absolute",
//           top: "56px !important",
//           right: "0 !important",
//           left: "50% !important",
//           borderRadius: "0 !important",
//           bottom: "0 !important",
//           maxHeight: "calc(100vh - 109px) !important",
//           filter: "none !important"
//         }
//       }
//     },
//     MuiButton: {
//       styleOverrides: {
//         root: {
//           borderRadius: 0,
//           fontFamily: [
//             '"Source Sans Pro"',
//             '"Helvetica Neue"',
//             "Helvetica",
//             "Arial",
//             "sans-serif"
//           ].join(","),
//           fontWeight: 400,
//           textDecoration: "none"
//         }
//       }
//     },
//     MuiFormLabel: {
//       styleOverrides: {
//         root: {
//           "&.Mui-focused": {
//             "&.Mui-focused": {
//               color: "secondary"
//             }
//           }
//         }
//       }
//     },
//     "MuiButton-outlinedSecondary": {
//       styleOverrides: {
//         border: 2
//       }
//     },
//     MuiTypography: {
//       styleOverrides: {
//         root: {
//           fontFamily: [
//             '"Source Sans Pro"',
//             '"Helvetica Neue"',
//             "Helvetica",
//             "Arial",
//             "sans-serif"
//           ].join(",")
//         }
//       }
//     }
//   }
// }));
export default theme;
