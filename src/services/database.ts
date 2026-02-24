import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { env } from '../config/env';
import { Gasto } from '../types';

class DatabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(env.supabaseUrl, env.supabaseKey);
  }

  async insertGasto(gasto: Omit<Gasto, 'id'>): Promise<{ error: Error | null }> {
    const { error } = await this.supabase.from('gastos').insert([gasto]);
    return { error: error as Error | null };
  }

  async getGastos(
    usuario: number,
    dataInicio: string,
    dataFim: string
  ): Promise<{ data: Gasto[] | null; error: Error | null }> {
    const { data, error } = await this.supabase
      .from('gastos')
      .select('descricao, valor, categoria, subcategoria, data_hora')
      .eq('usuario', usuario)
      .gte('data_hora', dataInicio)
      .lte('data_hora', dataFim);

    return { data: data as Gasto[] | null, error: error as Error | null };
  }

  async getAllGastos(usuario: number): Promise<{ data: Gasto[] | null; error: Error | null }> {
    const { data, error } = await this.supabase
      .from('gastos')
      .select('categoria, subcategoria, valor, data_hora')
      .eq('usuario', usuario);

    return { data: data as Gasto[] | null, error: error as Error | null };
  }

  async getLastGasto(usuario: number): Promise<{ data: Gasto | null; error: Error | null }> {
    const { data, error } = await this.supabase
      .from('gastos')
      .select('id, descricao, valor, categoria, subcategoria, data_hora')
      .eq('usuario', usuario)
      .order('data_hora', { ascending: false })
      .limit(1);

    return {
      data: data && data.length > 0 ? (data[0] as Gasto) : null,
      error: error as Error | null,
    };
  }

  async deleteGasto(id: number): Promise<{ error: Error | null }> {
    const { error } = await this.supabase.from('gastos').delete().eq('id', id);
    return { error: error as Error | null };
  }
}

export const database = new DatabaseService();
