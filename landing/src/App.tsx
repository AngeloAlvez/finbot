import { ThemeProvider, CssBaseline, Box } from "@mui/material";
import { theme } from "./theme";
import {
  Navbar,
  Hero,
  Features,
  HowItWorks,
  Pricing,
  Footer,
} from "./components";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: "100vh",
          backgroundColor: "background.default",
        }}
      >
        <Navbar />
        <Hero />
        <Features />
        <HowItWorks />
        <Pricing />
        <Footer />
      </Box>
    </ThemeProvider>
  );
}

export default App;
