import { Telegraf } from 'telegraf';
import { env } from './config/env';
import { setupCommands } from './handlers/commands';
import { setupMessageHandler } from './handlers/messages';

export function createBot(): Telegraf {
  const bot = new Telegraf(env.telegramBotToken);

  setupCommands(bot);
  setupMessageHandler(bot);

  return bot;
}
