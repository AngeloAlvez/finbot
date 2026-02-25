import { Box, Container, Typography, Stack, Link } from '@mui/material';

export function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        py: 8,
        borderTop: '1px solid rgba(255,255,255,0.05)',
      }}
    >
      <Container maxWidth="lg">
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'center', md: 'flex-start' }}
          spacing={4}
        >
          <Box textAlign={{ xs: 'center', md: 'left' }}>
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
            <Typography
              variant="body2"
              sx={{
                color: 'text.secondary',
                mt: 1,
                opacity: 0.6,
              }}
            >
              Seu assistente financeiro pessoal
            </Typography>
          </Box>

          <Stack
            direction="row"
            spacing={4}
            sx={{
              '& a': {
                color: 'text.secondary',
                textDecoration: 'none',
                fontSize: '0.875rem',
                transition: 'color 0.2s ease',
                '&:hover': {
                  color: 'primary.main',
                },
              },
            }}
          >
            <Link href="#">Termos de uso</Link>
            <Link href="#">Privacidade</Link>
            <Link href="#">Contato</Link>
          </Stack>
        </Stack>

        <Typography
          variant="caption"
          sx={{
            display: 'block',
            textAlign: 'center',
            mt: 6,
            color: 'text.secondary',
            opacity: 0.4,
          }}
        >
          © {new Date().getFullYear()} FinBot. Todos os direitos reservados.
        </Typography>
      </Container>
    </Box>
  );
}
