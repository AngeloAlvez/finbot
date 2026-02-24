import { env } from './config/env';
import { createBot } from './bot';

const bot = createBot();
const PORT = process.env.PORT || 3000;
const WEBHOOK_DOMAIN = process.env.WEBHOOK_DOMAIN || 'finbot.fly.dev';

if (env.botActive) {
  // Use webhook in production, polling in development
  if (process.env.NODE_ENV === 'production') {
    const webhookPath = `/webhook/${env.telegramBotToken}`;
    
    bot.launch({
      webhook: {
        domain: WEBHOOK_DOMAIN,
        port: Number(PORT),
        hookPath: webhookPath,
      },
    });
    console.log(`🤖 FinBot iniciado com webhook em https://${WEBHOOK_DOMAIN}${webhookPath}`);
  } else {
    bot.launch();
    console.log('🤖 FinBot iniciado com polling (desenvolvimento)');
  }

  process.once('SIGINT', () => bot.stop('SIGINT'));
  process.once('SIGTERM', () => bot.stop('SIGTERM'));
}
