import { Markup } from 'telegraf';
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { BotContext } from '../types';
import { database } from '../services/database';
import { ai } from '../services/ai';
import { gerarRelatorio } from '../services/reports';

export function setupCommands(bot: any): void {
  bot.command(['start', 'ajuda'], handleStart);
  bot.command('relatorio', handleRelatorio);
  bot.command('delete', handleDelete);
  bot.command('insights', handleInsights);

  // Report actions
  bot.action('relatorio_dia', handleRelatorioDia);
  bot.action('relatorio_semana', handleRelatorioSemana);
  bot.action('relatorio_mes', handleRelatorioMes);
  bot.action('relatorio_ano', handleRelatorioAno);
}

async function handleStart(ctx: BotContext): Promise<void> {
  await ctx.reply(
    `👋 Olá! Sou o FinBot 🤖

Estou aqui para tornar o controle dos seus gastos simples, rápido e inteligente!  

💡 *Como funciona?*  
Basta enviar uma mensagem curta, como *"Uber 10"* ou *"padaria 30,99"*, e eu automaticamente categorizo e salvo seu gasto. Nada de planilhas ou apps complicados!  

🔍 *Errei na categorização?*  
Sem problemas! Use */delete* para apagar o último gasto e tente um nome mais descritivo.  

📊 *Quer um resumo dos seus gastos?*  
É só usar */relatorio* e eu te mostro tudo de forma organizada!

✨ *Quer insights inteligentes sobre seus gastos?*
Use */insights* e eu analisarei seus dados para te dar dicas personalizadas de como economizar e otimizar suas finanças!

⚡ Simples, eficiente e sem burocracia. Bora começar? 🚀🚀🚀`,
    { parse_mode: 'Markdown' }
  );
}

async function handleRelatorio(ctx: BotContext): Promise<void> {
  await ctx.reply(
    'Escolha um tipo de relatório:',
    Markup.inlineKeyboard([
      [Markup.button.callback('📅 Relatório do Dia', 'relatorio_dia')],
      [Markup.button.callback('📆 Relatório da Semana', 'relatorio_semana')],
      [Markup.button.callback('🗓 Relatório do Mês', 'relatorio_mes')],
      [Markup.button.callback('📊 Relatório do Ano', 'relatorio_ano')],
    ])
  );
}

async function handleDelete(ctx: BotContext): Promise<void> {
  try {
    const { data, error } = await database.getLastGasto(ctx.from!.id);

    if (error) throw error;
    if (!data) {
      await ctx.reply('Nenhum gasto encontrado para excluir.');
      return;
    }

    const { error: deleteError } = await database.deleteGasto(data.id!);
    if (deleteError) throw deleteError;

    await ctx.reply(
      `❌ Gasto deletado com sucesso!\n\n💸 *${data.descricao}*\n💰 Valor: R$${data.valor.toFixed(2)}\n📂 Categoria: ${data.categoria} - ${data.subcategoria}\n🕒 Data: ${format(new Date(data.data_hora), 'dd/MM/yyyy HH:mm', { locale: ptBR })}`,
      { parse_mode: 'Markdown' }
    );
  } catch (err) {
    console.error('Erro ao deletar gasto:', err);
    await ctx.reply('Ocorreu um erro ao deletar o gasto. Tente novamente mais tarde.');
  }
}

async function handleInsights(ctx: BotContext): Promise<void> {
  try {
    const { data, error } = await database.getAllGastos(ctx.from!.id);

    if (error) {
      console.error('Erro ao buscar gastos para insights:', error);
      await ctx.reply('Ocorreu um erro ao buscar seus dados para gerar insights.');
      return;
    }

    if (!data || data.length === 0) {
      await ctx.reply('Você ainda não possui dados de gastos para gerar insights. Comece a registrar seus gastos!');
      return;
    }

    const insights = await ai.gerarInsights(data);

    if (insights) {
      await ctx.reply(` *Seus Insights:* \n\n${insights}`, { parse_mode: 'Markdown' });
    } else {
      await ctx.reply('Não foi possível gerar insights com os dados fornecidos.');
    }
  } catch (err) {
    console.error('Erro ao gerar insights:', err);
    await ctx.reply('Ocorreu um erro ao gerar seus insights. Tente novamente mais tarde.');
  }
}

async function handleRelatorioDia(ctx: BotContext): Promise<void> {
  const hoje = new Date();
  await gerarRelatorio(ctx, startOfDay(hoje), endOfDay(hoje), 'Relatório do Dia', 'dia');
}

async function handleRelatorioSemana(ctx: BotContext): Promise<void> {
  const hoje = new Date();
  await gerarRelatorio(
    ctx,
    startOfWeek(hoje, { weekStartsOn: 1 }),
    endOfWeek(hoje, { weekStartsOn: 1 }),
    'Relatório da Semana',
    'semana'
  );
}

async function handleRelatorioMes(ctx: BotContext): Promise<void> {
  const hoje = new Date();
  await gerarRelatorio(
    ctx,
    startOfMonth(hoje),
    endOfMonth(hoje),
    `Relatório de ${format(hoje, 'MMMM', { locale: ptBR })}`,
    'mes'
  );
}

async function handleRelatorioAno(ctx: BotContext): Promise<void> {
  const hoje = new Date();
  await gerarRelatorio(ctx, startOfYear(hoje), endOfYear(hoje), 'Relatório do Ano', 'ano');
}
