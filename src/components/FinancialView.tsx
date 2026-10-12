import React, { useState } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Percent, 
  Plus, 
  Download, 
  Trash2, 
  Edit3, 
  AlertCircle, 
  CheckCircle2
} from 'lucide-react';
import { Expense, ExpenseCategory, Order } from '../types';
import { exportFinancialsCSV, formatCurrencyBRL, formatDateBR } from '../utils/storage';

interface FinancialViewProps {
  orders: Order[];
  expenses: Expense[];
  onNewExpense: () => void;
  onEditExpense: (expense: Expense) => void;
  onDeleteExpense: (expenseId: string) => void;
}

const CATEGORY_NAMES: Record<ExpenseCategory, { label: string; icon: string }> = {
  produtos_quimicos: { label: 'Produtos Químicos', icon: '🧴' },
  combustivel: { label: 'Combustível / Transporte', icon: '⛽' },
  manutencao: { label: 'Manutenção de Extratoras', icon: '🛠️' },
  marketing: { label: 'Marketing & Anúncios', icon: '📢' },
  alimentacao: { label: 'Alimentação em Rota', icon: '🥪' },
  equipamentos: { label: 'Equipamentos', icon: '🧰' },
  outros: { label: 'Outras Despesas', icon: '📦' },
};

export const FinancialView: React.FC<FinancialViewProps> = ({
  orders,
  expenses,
  onNewExpense,
  onEditExpense,
  onDeleteExpense,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'expenses' | 'revenues'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [monthFilter, setMonthFilter] = useState<string>('all');

  const allDates = [
    ...orders.map((o) => o.scheduledDate),
    ...expenses.map((e) => e.date),
  ];
  const uniqueMonths = Array.from(new Set(allDates.map((d) => d.slice(0, 7)))).sort().reverse();

  const filteredOrders = orders.filter((o) => {
    if (monthFilter === 'all') return true;
    return o.scheduledDate.startsWith(monthFilter);
  });

  const filteredExpenses = expenses.filter((e) => {
    const matchesMonth = monthFilter === 'all' || e.date.startsWith(monthFilter);
    const matchesCategory = categoryFilter === 'all' || e.category === categoryFilter;
    return matchesMonth && matchesCategory;
  });

  const totalRevenue = filteredOrders
    .filter((o) => o.paymentStatus === 'pago' || o.status === 'concluido')
    .reduce((acc, curr) => acc + curr.finalAmount, 0);

  const pendingReceivables = filteredOrders
    .filter((o) => o.status !== 'cancelado' && o.paymentStatus === 'pendente')
    .reduce((acc, curr) => acc + curr.finalAmount, 0);

  const totalExpenses = filteredExpenses.reduce((acc, curr) => acc + curr.amount, 0);
  const netProfit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

  const expensesByCategory = filteredExpenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
    return acc;
  }, {} as Record<ExpenseCategory, number>);

  const handleExportCSV = () => {
    exportFinancialsCSV(filteredOrders, filteredExpenses);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-600" />
            Planilha Financeira & Lucros Automáticos
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Cálculo automático de Lucro Bruto, Custos Operacionais e Lucro Líquido Real da ExpressCleanmcz
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 border border-slate-200 transition"
            title="Exportar para Excel / Google Planilhas (CSV)"
          >
            <Download className="w-3.5 h-3.5 text-cyan-600" />
            Exportar CSV
          </button>
          <button
            onClick={onNewExpense}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs sm:text-sm rounded-xl flex items-center gap-1.5 shadow-md shadow-rose-600/20 transition"
          >
            <Plus className="w-4 h-4" />
            Lançar Despesa
          </button>
        </div>
      </div>

      {/* Main KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Receita Bruta */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Receita Bruta</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-600">
            {formatCurrencyBRL(totalRevenue)}
          </div>
          <span className="text-[11px] text-slate-500 font-medium mt-1 block">
            Serviços concluídos / pagos
          </span>
        </div>

        {/* Despesas Totais */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Despesas Operacionais</span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-rose-600">
            {formatCurrencyBRL(totalExpenses)}
          </div>
          <span className="text-[11px] text-slate-500 font-medium mt-1 block">
            Químicos, combustível e maquinário
          </span>
        </div>

        {/* Lucro Líquido Real */}
        <div className="bg-white border border-cyan-300 p-5 rounded-2xl shadow-2xs ring-2 ring-cyan-50">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Lucro Líquido no Bolso</span>
            <div className="p-2 rounded-xl bg-cyan-50 text-cyan-700">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className={`mt-2 text-2xl font-black ${netProfit >= 0 ? 'text-cyan-700' : 'text-rose-600'}`}>
            {formatCurrencyBRL(netProfit)}
          </div>
          <div className="flex items-center gap-1.5 mt-1 text-[11px] font-bold text-slate-600">
            <Percent className="w-3 h-3 text-cyan-600" />
            <span>Margem de Lucro: <strong className="text-slate-800">{profitMargin.toFixed(1)}%</strong></span>
          </div>
        </div>

        {/* Contas a Receber */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Contas a Receber</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-amber-600">
            {formatCurrencyBRL(pendingReceivables)}
          </div>
          <span className="text-[11px] text-slate-500 font-medium mt-1 block">
            Agendamentos pendentes
          </span>
        </div>
      </div>

      {/* Category Breakdown Chips */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
          Detalhamento de Custos por Categoria
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
          {Object.entries(CATEGORY_NAMES).map(([key, info]) => {
            const amount = expensesByCategory[key as ExpenseCategory] || 0;
            return (
              <div key={key} className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                <span className="text-base">{info.icon}</span>
                <p className="text-[11px] text-slate-500 font-medium truncate mt-1">{info.label}</p>
                <p className="text-xs font-black text-slate-900 mt-0.5">{formatCurrencyBRL(amount)}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Spreadsheet Table with Tabs and Month Selector */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/70">
          <div className="flex items-center gap-1.5 bg-slate-200/60 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                activeTab === 'all'
                  ? 'bg-white text-cyan-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Extrato Geral
            </button>
            <button
              onClick={() => setActiveTab('expenses')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                activeTab === 'expenses'
                  ? 'bg-white text-rose-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Apenas Despesas ({filteredExpenses.length})
            </button>
            <button
              onClick={() => setActiveTab('revenues')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                activeTab === 'revenues'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Apenas Receitas ({filteredOrders.length})
            </button>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
              className="bg-white border border-slate-300 text-xs text-slate-700 font-semibold rounded-lg px-2.5 py-1.5 focus:outline-none shadow-2xs"
            >
              <option value="all">Todos os Meses</option>
              {uniqueMonths.map((m) => (
                <option key={m} value={m}>
                  Mês {m}
                </option>
              ))}
            </select>

            {activeTab === 'expenses' && (
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-white border border-slate-300 text-xs text-slate-700 font-semibold rounded-lg px-2.5 py-1.5 focus:outline-none shadow-2xs"
              >
                <option value="all">Todas as Categorias</option>
                {Object.entries(CATEGORY_NAMES).map(([key, info]) => (
                  <option key={key} value={key}>
                    {info.label}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Spreadsheet Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200 text-[10px]">
              <tr>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Data</th>
                <th className="px-4 py-3">Descrição / Cliente</th>
                <th className="px-4 py-3">Categoria / Detalhes</th>
                <th className="px-4 py-3 text-right">Valor</th>
                <th className="px-4 py-3">Pagamento</th>
                <th className="px-4 py-3 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {activeTab !== 'expenses' &&
                filteredOrders.map((o) => (
                  <tr key={`ord-${o.id}`} className="hover:bg-slate-50/80 transition">
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        RECEITA
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-600 font-medium">
                      {formatDateBR(o.scheduledDate)}
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-900">
                      {o.clientName}
                      <span className="block text-[11px] text-slate-500 font-normal">
                        {o.clientNeighborhood}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 font-medium">
                      {o.services.map((s) => `${s.quantity}x ${s.name}`).join(' + ')}
                    </td>
                    <td className="px-4 py-3 text-right font-black text-emerald-600 text-sm">
                      + {formatCurrencyBRL(o.finalAmount)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="uppercase text-[10px] font-bold text-slate-500">
                        {o.paymentMethod} ({o.paymentStatus})
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-slate-400">
                      <CheckCircle2 className="w-4 h-4 mx-auto text-emerald-500" />
                    </td>
                  </tr>
                ))}

              {activeTab !== 'revenues' &&
                filteredExpenses.map((e) => (
                  <tr key={`exp-${e.id}`} className="hover:bg-slate-50/80 transition">
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-rose-50 text-rose-700 border border-rose-200">
                        DESPESA
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-600 font-medium">
                      {formatDateBR(e.date)}
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-900">
                      {e.title}
                      {e.supplier && (
                        <span className="block text-[11px] text-slate-500 font-normal">
                          Fornecedor: {e.supplier}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-600 font-medium">
                      <span className="inline-flex items-center gap-1 font-semibold">
                        {CATEGORY_NAMES[e.category]?.icon} {CATEGORY_NAMES[e.category]?.label}
                      </span>
                      {e.notes && (
                        <span className="block text-[11px] text-slate-500 italic">{e.notes}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-black text-rose-600 text-sm">
                      - {formatCurrencyBRL(e.amount)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="uppercase text-[10px] font-bold text-slate-500">
                        {e.paymentMethod}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => onEditExpense(e)}
                          className="p-1 text-slate-500 hover:text-slate-800 transition"
                          title="Editar Despesa"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteExpense(e.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition"
                          title="Excluir Despesa"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
