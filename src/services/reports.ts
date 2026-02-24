import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { BotContext, DadosMensais, Gasto, GastoTotais, ReportType } from '../types';
import { database } from './database';
import { capitalizeFirstLetter, formatarCategoria } from '../utils/formatters';
import { gerarGrafico } from '../utils/charts';

export async function gerarRelatorio(
  ctx: BotContext,
  dataInicio: Date,
  dataFim: Date,
  titulo: string,
  tipo: ReportType
): Promise<void> {
  try {
    const dataInicioISO = dataInicio.toISOString();
    const dataFimISO = dataFim.toISOString();

    const { data, error } = await database.getGastos(ctx.from!.id, dataInicioISO, dataFimISO);

    if (error) {
      console.error('Erro ao buscar informações:', error);
      await ctx.reply('Ocorreu um erro ao gerar o relatório.');
      return;
    }

    let resposta = `*${titulo}*\n\n`;
    const totais: GastoTotais = {};
    let totalGeral = 0;

    if (tipo === 'ano') {
      resposta = processarRelatorioAnual(data || [], resposta, totais, totalGeral);
      totalGeral = calcularTotalGeral(data || []);
    } else {
      const resultado = processarRelatorioSimples(data || [], totais);
      totalGeral = resultado.totalGeral;
      resposta += resultado.texto;
    }

    resposta += `\n*Total Geral:* R$${totalGeral.toFixed(2)}`;

    if (totalGeral > 0) {
      const grafico = gerarGrafico(totais, totalGeral);
      resposta += grafico;
    }

    await ctx.reply(resposta, { parse_mode: 'Markdown' });
  } catch (err) {
    console.error('Erro inesperado ao gerar relatório:', err);
    await ctx.reply('Ocorreu um erro inesperado ao gerar o relatório.');
  }
}

function calcularTotalGeral(data: Gasto[]): number {
  return data.reduce((acc, gasto) => acc + gasto.valor, 0);
}

function processarRelatorioSimples(
  data: Gasto[],
  totais: GastoTotais
): { texto: string; totalGeral: number } {
  let texto = '';
  let totalGeral = 0;

  data.forEach(({ categoria, subcategoria, valor }) => {
    if (!totais[categoria]) totais[categoria] = {};
    if (!totais[categoria][subcategoria]) totais[categoria][subcategoria] = 0;
    totais[categoria][subcategoria] += valor;
    totalGeral += valor;
  });

  for (const [categoria, subcategorias] of Object.entries(totais)) {
    const totalCategoria = Object.values(subcategorias).reduce((a, b) => a + b, 0);
    texto += `*${formatarCategoria(categoria)} - R$${totalCategoria.toFixed(2)}*\n`;
    for (const [subcategoria, total] of Object.entries(subcategorias)) {
      const percentual = ((total / totalGeral) * 100).toFixed(2);
      texto += `  - ${subcategoria}: R$${total.toFixed(2)} \\(${percentual}%\\)\n`;
    }
    texto += '\n';
  }

  return { texto, totalGeral };
}

function processarRelatorioAnual(
  data: Gasto[],
  resposta: string,
  totais: GastoTotais,
  totalGeral: number
): string {
  const mesAtual = new Date().getMonth();
  const meses = Array.from({ length: mesAtual + 1 }, (_, i) =>
    format(new Date(2025, i, 1), 'MMMM', { locale: ptBR })
  );
  const dadosMensais: DadosMensais = {};

  meses.forEach((mes) => (dadosMensais[mes] = {}));

  data.forEach(({ categoria, subcategoria, valor, data_hora }) => {
    const mes = format(new Date(data_hora), 'MMMM', { locale: ptBR });
    if (!dadosMensais[mes]) dadosMensais[mes] = {};
    if (!dadosMensais[mes][categoria]) dadosMensais[mes][categoria] = {};
    if (!dadosMensais[mes][categoria][subcategoria]) dadosMensais[mes][categoria][subcategoria] = 0;
    dadosMensais[mes][categoria][subcategoria] += valor;
    totalGeral += valor;
  });

  meses.forEach((mes) => {
    resposta += `*◇ ${capitalizeFirstLetter(mes)} ◇*\n\n`;

    if (Object.keys(dadosMensais[mes]).length === 0) {
      resposta += `Sem dados\nTotal: R$0,00\n\n`;
    } else {
      for (const [categoria, subcategorias] of Object.entries(dadosMensais[mes])) {
        const totalCategoria = Object.values(subcategorias).reduce((a, b) => a + b, 0);
        resposta += `*${formatarCategoria(categoria)} - R$${totalCategoria.toFixed(2)}*\n`;

        for (const [subcategoria, total] of Object.entries(subcategorias)) {
          const percentual = ((total / totalGeral) * 100).toFixed(2);
          resposta += `  - ${subcategoria}: R$${total.toFixed(2)} \\(${percentual}%\\)\n`;
        }
        resposta += '\n';
      }
      const totalMes = Object.values(dadosMensais[mes])
        .flatMap(Object.values)
        .reduce((a, b) => a + b, 0);
      resposta += `Total de ${mes}: R$${totalMes.toFixed(2)}\n\n`;
    }
  });

  // Reorganiza os dados para o formato esperado por gerarGrafico
  for (const mes in dadosMensais) {
    for (const categoria in dadosMensais[mes]) {
      if (!totais[categoria]) totais[categoria] = {};
      for (const subcategoria in dadosMensais[mes][categoria]) {
        if (!totais[categoria][subcategoria]) totais[categoria][subcategoria] = 0;
        totais[categoria][subcategoria] += dadosMensais[mes][categoria][subcategoria];
      }
    }
  }

  return resposta;
}
