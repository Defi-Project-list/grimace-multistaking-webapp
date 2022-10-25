import { createTheme } from "@mui/material/styles"
import { colors } from "./colors"

// Create a theme instance.
const theme = createTheme({
  // @ts-ignore
  shadows: ["none"],
  palette: {
    mode: "dark",
    background: {
      default: "#131723",
    },
    primary: {
      main: colors.app.primary,
    },
    secondary: {
      main: "hsla(210, 19.2%, 20.4%, 1)",
    },
    common: {
      black: "hsla(206, 10.1%, 13.5%, 1)"
    },
  },
  typography: {
    fontFamily: "Satoshi",
  },
  components: {
    MuiAppBar: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          backgroundColor: "inherit",
        },
      },
    },
    MuiButtonBase: {
      styleOverrides: {
        root: {
          textTransform: "capitalize",
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        outlined: {
          borderWidth: '2px'       
          // borderInline: "2px solid"
        },
        root: {          
          textTransform: "capitalize",          
        },        
        contained: {
          boxShadow: "none",
          textTransform: "capitalize",
        },
      },
    },
  },
})

export default theme