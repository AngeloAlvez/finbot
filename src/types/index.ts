import { Context } from 'telegraf';

export interface Categoria {
  emoji: string;
  subcategorias: string[];
}

export interface Categorias {
  [key: string]: Categoria;
}

export interface CategoriaResult {
  categoria: string;
  subcategoria: string;
}

export interface Gasto {
  id?: number;
  descricao: string;
  valor: number;
  categoria: string;
  subcategoria: string;
  usuario: number;
  data_hora: string;
}

export interface GastoTotais {
  [categoria: string]: {
    [subcategoria: string]: number;
  };
}

export interface DadosMensais {
  [mes: string]: GastoTotais;
}

export interface LinhaGrafico {
  barras: string;
  categoria: string;
  percentual: string;
}

export type ReportType = 'dia' | 'semana' | 'mes' | 'ano';

export type BotContext = Context;
