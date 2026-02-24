import { Categorias } from '../types';

export const CATEGORIAS: Categorias = {
  Transporte: {
    emoji: '🏍️',
    subcategorias: ['Combustível', 'Manutenção', 'Uber', 'Estacionamento', 'Ônibus', 'Outros'],
  },
  Alimentação: {
    emoji: '🍽️',
    subcategorias: ['Mercado', 'Restaurantes', 'Delivery', 'Lanchonete', 'Outros'],
  },
  Lazer: {
    emoji: '🎉',
    subcategorias: ['Jogos', 'Assinaturas', 'Shows', 'Viagens', 'Hobbies', 'Alcool', 'Fumo', 'Jardinagem', 'Outros'],
  },
  Moradia: {
    emoji: '🏠',
    subcategorias: ['Aluguel', 'Contas Fixas', 'Manutenção', 'Melhorias', 'Outros'],
  },
  Saúde: {
    emoji: '❤️',
    subcategorias: ['Consultas', 'Medicamentos', 'Academia', 'Outros'],
  },
  Educação: {
    emoji: '📚',
    subcategorias: ['Cursos', 'Livros', 'Mensalidade escolar', 'Material escolar', 'Outros'],
  },
  Pessoal: {
    emoji: '🧍',
    subcategorias: ['Cabelo', 'Estética', 'Roupas', 'Acessórios', 'Investimentos', 'Outros'],
  },
  Pets: {
    emoji: '🐾',
    subcategorias: ['Ração', 'Veterinário', 'Brinquedos', 'Higiene', 'Outros'],
  },
  Outros: {
    emoji: '📦',
    subcategorias: ['Presentes', 'Doações', 'Imprevistos', 'Parcelamentos', 'Outros'],
  },
};
