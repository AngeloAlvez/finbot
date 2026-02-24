import { GastoTotais, LinhaGrafico } from '../types';
import { formatarCategoria } from './formatters';

export function gerarGrafico(totais: GastoTotais, totalGeral: number, maxBarras = 15): string {
  let grafico = '\n\n 📊 Distribuição dos Gastos 📊\n\n';
  const linhasGrafico: LinhaGrafico[] = [];

  for (const categoria in totais) {
    const categoriaFormatada = formatarCategoria(categoria);
    const totalCategoria = Object.values(totais[categoria]).reduce((a, b) => a + b, 0);
    const percentual = ((totalCategoria / totalGeral) * 100).toFixed(0);
    const numBarras = Math.round((Number(percentual) / 100) * maxBarras);
    const barras = '█'.repeat(numBarras);
    linhasGrafico.push({ barras, categoria: categoriaFormatada, percentual });
  }

  linhasGrafico.sort((a, b) => b.barras.length - a.barras.length);

  linhasGrafico.forEach((linha) => {
    grafico += ` ${linha.barras} ${linha.categoria} ${linha.percentual}%\n`;
  });

  return grafico;
}
