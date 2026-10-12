import { INITIAL_CLIENTS, INITIAL_EXPENSES, INITIAL_ORDERS } from '../data/mockData';
import { Client, Expense, Order } from '../types';

const CLIENTS_STORAGE_KEY = 'expresscleanmcz_clients_v1';
const ORDERS_STORAGE_KEY = 'expresscleanmcz_orders_v1';
const EXPENSES_STORAGE_KEY = 'expresscleanmcz_expenses_v1';

export function getStoredClients(): Client[] {
  try {
    const raw = localStorage.getItem(CLIENTS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(CLIENTS_STORAGE_KEY, JSON.stringify(INITIAL_CLIENTS));
      return INITIAL_CLIENTS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error loading clients', err);
    return INITIAL_CLIENTS;
  }
}

export function saveStoredClients(clients: Client[]): void {
  try {
    localStorage.setItem(CLIENTS_STORAGE_KEY, JSON.stringify(clients));
  } catch (err) {
    console.error('Error saving clients', err);
  }
}

export function getStoredOrders(): Order[] {
  try {
    const raw = localStorage.getItem(ORDERS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(INITIAL_ORDERS));
      return INITIAL_ORDERS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error loading orders', err);
    return INITIAL_ORDERS;
  }
}

export function saveStoredOrders(orders: Order[]): void {
  try {
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
  } catch (err) {
    console.error('Error saving orders', err);
  }
}

export function getStoredExpenses(): Expense[] {
  try {
    const raw = localStorage.getItem(EXPENSES_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(EXPENSES_STORAGE_KEY, JSON.stringify(INITIAL_EXPENSES));
      return INITIAL_EXPENSES;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error loading expenses', err);
    return INITIAL_EXPENSES;
  }
}

export function saveStoredExpenses(expenses: Expense[]): void {
  try {
    localStorage.setItem(EXPENSES_STORAGE_KEY, JSON.stringify(expenses));
  } catch (err) {
    console.error('Error saving expenses', err);
  }
}

export function exportAllDataAsJSON(clients: Client[], orders: Order[], expenses: Expense[]): void {
  const data = {
    appName: 'ExpressCleanmcz',
    exportDate: new Date().toISOString(),
    clients,
    orders,
    expenses,
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `expresscleanmcz_backup_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportFinancialsCSV(orders: Order[], expenses: Expense[]): void {
  let csv = 'Tipo;Data;Descricao/Cliente;Categoria/Servico;Valor (R$);Forma Pagamento;Status\n';

  // Orders
  orders.forEach((o) => {
    const servicesStr = o.services.map((s) => `${s.name} (${s.quantity}x)`).join(' + ');
    csv += `RECEITA;${o.scheduledDate};"${o.clientName}";"${servicesStr}";${o.finalAmount.toFixed(2)};${o.paymentMethod};${o.paymentStatus}\n`;
  });

  // Expenses
  expenses.forEach((e) => {
    csv += `DESPESA;${e.date};"${e.supplier || '-' }";"${e.title} (${e.category})";${e.amount.toFixed(2)};${e.paymentMethod};PAGO\n`;
  });

  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `expresscleanmcz_financeiro_${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function formatCurrencyBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function formatDateBR(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
}

export function formatPhoneWhatsApp(phone: string): string {
  // Limpa caracteres não numéricos
  const clean = phone.replace(/\D/g, '');
  if (clean.length === 11) {
    return `(${clean.slice(0, 2)}) ${clean.slice(2, 7)}-${clean.slice(7)}`;
  }
  if (clean.length === 10) {
    return `(${clean.slice(0, 2)}) ${clean.slice(2, 6)}-${clean.slice(6)}`;
  }
  return phone;
}

export function getWhatsAppCleanNumber(phone: string): string {
  let clean = phone.replace(/\D/g, '');
  if (clean.length === 10 || clean.length === 11) {
    clean = '55' + clean;
  }
  return clean;
}
