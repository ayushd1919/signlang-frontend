import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  typography: {
    fontFamily: `'Inter', system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif`,
    h1: { fontWeight: 900 }
  },
  shape: { borderRadius: 16 },
  palette: {
    primary: { main: "#6366f1" } // indigo
  }
});

export default theme;
