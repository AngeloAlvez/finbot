import { AppBar, Box, Button, Container, Toolbar, Typography } from '@mui/material';

export function Navbar() {
  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        backgroundColor: 'rgba(10,10,10,0.8)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}
    >
      <Container maxWidth="lg">
        <Toolbar
          disableGutters
          sx={{
            justifyContent: 'space-between',
            minHeight: { xs: 64, md: 72 },
          }}
        >
          <Typography
            sx={{
              fontSize: '1.25rem',
              fontWeight: 500,
              color: 'text.primary',
              letterSpacing: '0.05em',
            }}
          >
            FinBot
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Button
              sx={{
                color: 'text.secondary',
                '&:hover': {
                  color: 'text.primary',
                  backgroundColor: 'transparent',
                },
              }}
            >
              Entrar
            </Button>
            <Button
              variant="outlined"
              sx={{
                borderColor: 'primary.main',
                color: 'primary.main',
                px: 3,
                '&:hover': {
                  borderColor: 'primary.light',
                  backgroundColor: 'rgba(212,175,55,0.05)',
                },
              }}
            >
              Começar
            </Button>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
