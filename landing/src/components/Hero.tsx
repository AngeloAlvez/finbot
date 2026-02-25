import { Box, Container, Typography, Button, Stack } from "@mui/material";
import { ArrowForward } from "@mui/icons-material";
import demoGif from "../assets/demo.gif";

export function Hero() {
  return (
    <Box
      component="section"
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: "20%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "600px",
          height: "600px",
          background:
            "radial-gradient(circle, rgba(212,175,55,0.08) 0%, transparent 70%)",
          pointerEvents: "none",
        },
      }}
    >
      <Container maxWidth="md">
        <Stack spacing={6} alignItems="center" textAlign="center">
          <Box>
            <Typography
              variant="overline"
              sx={{
                color: "primary.main",
                letterSpacing: "0.3em",
                fontSize: "0.75rem",
                mb: 3,
                display: "block",
              }}
            >
              Seu assistente financeiro pessoal
            </Typography>
            <Typography
              variant="h1"
              sx={{
                color: "text.primary",
                mb: 3,
              }}
            >
              Controle suas finanças
              <Box
                component="span"
                sx={{
                  display: "block",
                  color: "primary.main",
                  fontStyle: "italic",
                }}
              >
                sem esforço
              </Box>
            </Typography>
            <Typography
              variant="body1"
              sx={{
                maxWidth: 480,
                mx: "auto",
                color: "text.secondary",
              }}
            >
              Registre gastos com uma simples mensagem no Telegram. Inteligência
              artificial categoriza automaticamente. Relatórios e insights
              personalizados.
            </Typography>
          </Box>

          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              color="primary"
              endIcon={<ArrowForward />}
              sx={{
                px: 4,
                py: 1.5,
                color: "#0A0A0A",
                fontWeight: 600,
              }}
            >
              Começar agora
            </Button>
            <Button
              variant="outlined"
              sx={{
                px: 4,
                py: 1.5,
                borderColor: "rgba(255,255,255,0.2)",
                color: "text.primary",
                "&:hover": {
                  borderColor: "rgba(255,255,255,0.4)",
                  backgroundColor: "rgba(255,255,255,0.02)",
                },
              }}
            >
              Testar agora
            </Button>
          </Stack>

          <Typography
            variant="caption"
            sx={{
              color: "text.secondary",
              opacity: 0.6,
              mt: 4,
            }}
          >
            Sem cartão de crédito • Cancele quando quiser
          </Typography>

          {/* Demo GIF */}
          <Box
            sx={{
              mt: 8,
              position: "relative",
              "&::before": {
                content: '""',
                position: "absolute",
                inset: -2,
                background:
                  "linear-gradient(135deg, rgba(212,175,55,0.3) 0%, transparent 50%, rgba(212,175,55,0.1) 100%)",
                borderRadius: "24px",
                zIndex: 0,
              },
            }}
          >
            <Box
              component="img"
              src={demoGif}
              alt="Demo do FinBot no Telegram"
              sx={{
                position: "relative",
                zIndex: 1,
                width: "100%",
                maxWidth: 320,
                borderRadius: "22px",
                boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
              }}
            />
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}
