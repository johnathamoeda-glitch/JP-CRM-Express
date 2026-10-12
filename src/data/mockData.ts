import { Client, Expense, Order } from '../types';

export const COMMON_SERVICES = [
  { id: 'sofa_2l', name: 'Sofá 2 Lugares (Fixo)', defaultPrice: 150 },
  { id: 'sofa_3l', name: 'Sofá 3 Lugares (Fixo)', defaultPrice: 190 },
  { id: 'sofa_ret_2l', name: 'Sofá 2 Lugares Retrátil/Reclinável', defaultPrice: 180 },
  { id: 'sofa_ret_3l', name: 'Sofá 3 Lugares Retrátil/Reclinável', defaultPrice: 240 },
  { id: 'sofa_canto', name: 'Sofá em L / Canto (4 a 5 Lugares)', defaultPrice: 320 },
  { id: 'poltrona', name: 'Poltrona Individual', defaultPrice: 80 },
  { id: 'colchao_casal', name: 'Colchão Casal (Ambos os lados)', defaultPrice: 180 },
  { id: 'colchao_queen', name: 'Colchão Queen / King', defaultPrice: 220 },
  { id: 'colchao_solt', name: 'Colchão Solteiro', defaultPrice: 130 },
  { id: 'cadeira_jantar', name: 'Cadeira de Jantar (Assento + Encosto)', defaultPrice: 35 },
  { id: 'impermeabilizacao', name: 'Impermeabilização de Sofá (Proteção)', defaultPrice: 220 },
  { id: 'banco_auto', name: 'Higienização de Bancos Automotivos', defaultPrice: 190 },
  { id: 'tapete_p', name: 'Tapete Pequeno / Médio', defaultPrice: 90 },
  { id: 'carrinho_bebe', name: 'Carrinho de Bebê / Bebê Conforto', defaultPrice: 110 },
];

// ZERADO: Pronto para o usuário cadastrar os clientes reais
export const INITIAL_CLIENTS: Client[] = [];

// ZERADO: Pronto para novos agendamentos reais
export const INITIAL_ORDERS: Order[] = [];

// ZERADO: Pronto para novos lançamentos de despesas reais
export const INITIAL_EXPENSES: Expense[] = [];
