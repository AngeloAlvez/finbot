import { Box, Container, Typography, Stack } from '@mui/material';

const steps = [
  {
    number: '01',
    title: 'Envie uma mensagem',
    description: 'Abra o Telegram e digite algo como "Uber 25" ou "Mercado 180,50"',
  },
  {
    number: '02',
    title: 'IA categoriza',
    description: 'Nossa inteligência artificial identifica a categoria automaticamente',
  },
  {
    number: '03',
    title: 'Acompanhe seus gastos',
    description: 'Veja relatórios, gráficos e receba insights personalizados',
  },
];

export function HowItWorks() {
  return (
    <Box
      component="section"
      sx={{
        py: 16,
        background: 'linear-gradient(180deg, rgba(212,175,55,0.02) 0%, transparent 100%)',
      }}
    >
      <Container maxWidth="md">
        <Typography
          variant="overline"
          sx={{
            color: 'primary.main',
            letterSpacing: '0.3em',
            fontSize: '0.7rem',
            display: 'block',
            textAlign: 'center',
            mb: 2,
          }}
        >
          Como funciona
        </Typography>
        <Typography
          variant="h2"
          sx={{
            textAlign: 'center',
            mb: 10,
            color: 'text.primary',
          }}
        >
          Três passos.
          <br />
          Sem complicação.
        </Typography>

        <Stack spacing={0}>
          {steps.map((step, index) => (
            <Box
              key={index}
              sx={{
                display: 'flex',
                gap: 4,
                py: 5,
                borderBottom: index < steps.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
              }}
            >
              <Typography
                sx={{
                  fontSize: '3rem',
                  fontWeight: 200,
                  color: 'primary.main',
                  opacity: 0.5,
                  lineHeight: 1,
                  minWidth: 80,
                }}
              >
                {step.number}
              </Typography>
              <Box>
                <Typography
                  variant="h3"
                  sx={{
                    color: 'text.primary',
                    mb: 1,
                    fontWeight: 500,
                  }}
                >
                  {step.title}
                </Typography>
                <Typography variant="body1">
                  {step.description}
                </Typography>
              </Box>
            </Box>
          ))}
        </Stack>
      </Container>
    </Box>
  );
}
