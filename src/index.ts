import { env } from './config/env';
import { createBot } from './bot';

const bot = createBot();

if (env.botActive) {
  bot.launch();
  console.log('🤖 FinBot iniciado com sucesso!');

  process.once('SIGINT', () => bot.stop('SIGINT'));
  process.once('SIGTERM', () => bot.stop('SIGTERM'));
}
