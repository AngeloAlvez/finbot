import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { BotContext } from '../types';
import { database } from '../services/database';
import { ai } from '../services/ai';

const GASTO_REGEX = /(.+)\s(\d+(?:[.,]\d+)?)/;

export function setupMessageHandler(bot: any): void {
  bot.on('text', handleTextMessage);
}

async function handleTextMessage(ctx: BotContext): Promise<void> {
  try {
    const mensagem = (ctx.message as any).text.trim();
    const match = mensagem.match(GASTO_REGEX);

    if (!match) {
      await ctx.reply(
        '⚠️ Opa! Parece que o formato está incorreto.\n\n📌 Envie algo simples como: *Janta 45* e eu registrarei seu gasto automaticamente! 😉\n\n Precisa de /ajuda?',
        { parse_mode: 'Markdown' }
      );
      return;
    }

    const descricao = match[1].trim();
    const valor = parseFloat(match[2].replace(',', '.'));
    const { categoria, subcategoria } = await ai.categorizarGasto(mensagem);
    const dataHora = new Date().toISOString();

    const { error } = await database.insertGasto({
      descricao,
      valor,
      categoria,
      subcategoria,
      usuario: ctx.from!.id,
      data_hora: dataHora,
    });

    if (error) {
      console.error('Erro Supabase:', error);
      await ctx.reply('Erro ao salvar gasto.');
      return;
    }

    await ctx.reply(
      `✅ Gasto salvo!\n Descrição: ${descricao}\n Valor: R$${valor.toFixed(2)}\n Categoria: ${categoria} - ${subcategoria}\n Data e Hora: ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR })}`
    );
  } catch (err) {
    console.error('Erro inesperado:', err);
    await ctx.reply('Ocorreu um erro inesperado. Tente novamente mais tarde.');
  }
}
