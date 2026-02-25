import { Box, Container, Typography, Grid, Stack } from '@mui/material';
import { ChatBubbleOutline, AutoAwesome, InsightsOutlined } from '@mui/icons-material';

const features = [
  {
    icon: ChatBubbleOutline,
    title: 'Simples como uma mensagem',
    description: 'Digite "Almoço 45" no Telegram e pronto. Sem apps complicados, sem planilhas.',
  },
  {
    icon: AutoAwesome,
    title: 'IA que entende você',
    description: 'Categorização automática inteligente. O FinBot aprende seus padrões de gastos.',
  },
  {
    icon: InsightsOutlined,
    title: 'Insights personalizados',
    description: 'Relatórios claros e recomendações para otimizar suas finanças pessoais.',
  },
];

export function Features() {
  return (
    <Box
      component="section"
      sx={{
        py: 16,
        borderTop: '1px solid rgba(255,255,255,0.05)',
      }}
    >
      <Container maxWidth="lg">
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
          Por que FinBot
        </Typography>
        <Typography
          variant="h2"
          sx={{
            textAlign: 'center',
            mb: 10,
            color: 'text.primary',
          }}
        >
          Finanças pessoais,
          <br />
          simplificadas
        </Typography>

        <Grid container spacing={6}>
          {features.map((feature, index) => (
            <Grid size={{ xs: 12, md: 4 }} key={index}>
              <Stack
                spacing={3}
                sx={{
                  p: 4,
                  height: '100%',
                  borderLeft: '1px solid rgba(255,255,255,0.08)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderLeftColor: 'primary.main',
                  },
                }}
              >
                <feature.icon
                  sx={{
                    fontSize: 32,
                    color: 'primary.main',
                  }}
                />
                <Typography
                  variant="h3"
                  sx={{
                    color: 'text.primary',
                    fontWeight: 500,
                  }}
                >
                  {feature.title}
                </Typography>
                <Typography variant="body1">
                  {feature.description}
                </Typography>
              </Stack>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
