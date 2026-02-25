import { Box, Container, Typography, Button, Stack, Chip } from '@mui/material';
import { Check } from '@mui/icons-material';

const features = [
  'Gastos ilimitados',
  'Categorização automática com IA',
  'Relatórios diários, semanais e mensais',
  'Insights personalizados',
  'Suporte prioritário',
  'Acesso a novas funcionalidades',
];

export function Pricing() {
  return (
    <Box
      component="section"
      sx={{
        py: 16,
        borderTop: '1px solid rgba(255,255,255,0.05)',
      }}
    >
      <Container maxWidth="sm">
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
          Investimento
        </Typography>
        <Typography
          variant="h2"
          sx={{
            textAlign: 'center',
            mb: 8,
            color: 'text.primary',
          }}
        >
          Um preço.
          <br />
          Tudo incluso.
        </Typography>

        <Box
          sx={{
            p: 6,
            border: '1px solid rgba(212,175,55,0.3)',
            position: 'relative',
            background: 'linear-gradient(180deg, rgba(212,175,55,0.03) 0%, transparent 100%)',
          }}
        >
          <Chip
            label="Mais popular"
            size="small"
            sx={{
              position: 'absolute',
              top: -12,
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: 'primary.main',
              color: '#0A0A0A',
              fontWeight: 600,
              fontSize: '0.7rem',
              letterSpacing: '0.05em',
            }}
          />

          <Stack spacing={4} alignItems="center">
            <Box textAlign="center">
              <Typography
                sx={{
                  fontSize: '4rem',
                  fontWeight: 200,
                  color: 'text.primary',
                  lineHeight: 1,
                }}
              >
                R$19
                <Typography
                  component="span"
                  sx={{
                    fontSize: '1.25rem',
                    color: 'text.secondary',
                    ml: 0.5,
                  }}
                >
                  /mês
                </Typography>
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: 'text.secondary',
                  mt: 1,
                }}
              >
                Cancele quando quiser
              </Typography>
            </Box>

            <Stack spacing={2} sx={{ width: '100%' }}>
              {features.map((feature, index) => (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                  }}
                >
                  <Check
                    sx={{
                      fontSize: 18,
                      color: 'primary.main',
                    }}
                  />
                  <Typography
                    sx={{
                      color: 'text.secondary',
                      fontSize: '0.95rem',
                    }}
                  >
                    {feature}
                  </Typography>
                </Box>
              ))}
            </Stack>

            <Button
              variant="contained"
              color="primary"
              fullWidth
              sx={{
                py: 2,
                color: '#0A0A0A',
                fontWeight: 600,
                fontSize: '1rem',
                mt: 2,
              }}
            >
              Começar agora
            </Button>

            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                opacity: 0.6,
              }}
            >
              7 dias grátis • Sem compromisso
            </Typography>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}
