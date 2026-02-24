import 'dotenv/config';

interface EnvConfig {
  telegramBotToken: string;
  geminiApiKey: string;
  supabaseUrl: string;
  supabaseKey: string;
  botActive: boolean;
}

function getEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

export const env: EnvConfig = {
  telegramBotToken: getEnvVar('TELEGRAM_BOT_TOKEN'),
  geminiApiKey: getEnvVar('GEMINI_API_KEY'),
  supabaseUrl: getEnvVar('SUPABASE_URL'),
  supabaseKey: getEnvVar('SUPABASE_KEY'),
  botActive: process.env.BOT_ACTIVE === 'true',
};
