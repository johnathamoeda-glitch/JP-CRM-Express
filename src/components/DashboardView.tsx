import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Award
} from 'lucide-react';
import { Expense, Order } from '../types';
import { formatCurrencyBRL } from '../utils/storage';

interface DashboardViewProps {
  orders: Order[];
  expenses: Expense[];
}

export const DashboardView: React.FC<DashboardViewProps> = ({ orders, expenses }) => {
  const paidOrders = orders.filter((o) => o.paymentStatus === 'pago' || o.status === 'concluido');
  const totalRevenue = paidOrders.reduce((acc, curr) => acc + curr.finalAmount, 0);
  const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const netProfit = totalRevenue - totalExpenses;
  const marginPct = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

  const totalItemsCleaned = paidOrders.reduce((acc, o) => {
    return acc + o.services.reduce((sAcc, s) => sAcc + s.quantity, 0);
  }, 0);

  const avgTicket = paidOrders.length > 0 ? totalRevenue / paidOrders.length : 0;

  const serviceDemandMap: Record<string, { count: number; revenue: number }> = {};
  orders.forEach((o) => {
    o.services.forEach((s) => {
      if (!serviceDemandMap[s.name]) {
        serviceDemandMap[s.name] = { count: 0, revenue: 0 };
      }
      serviceDemandMap[s.name].count += s.quantity;
      serviceDemandMap[s.name].revenue += s.price * s.quantity;
    });
  });

  const sortedServices = Object.entries(serviceDemandMap)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  const maxServiceRevenue = Math.max(...sortedServices.map((s) => s.revenue), 1);

  const expenseCatMap: Record<string, number> = {};
  expenses.forEach((e) => {
    expenseCatMap[e.category] = (expenseCatMap[e.category] || 0) + e.amount;
  });

  const maxExpenseAmount = Math.max(...Object.values(expenseCatMap), 1);

  const paymentMethodsMap: Record<string, number> = {};
  orders.forEach((o) => {
    paymentMethodsMap[o.paymentMethod] = (paymentMethodsMap[o.paymentMethod] || 0) + o.finalAmount;
  });

  const monthMap: Record<string, { revenue: number; expense: number; profit: number }> = {};
  orders.forEach((o) => {
    const m = o.scheduledDate.slice(0, 7);
    if (!monthMap[m]) monthMap[m] = { revenue: 0, expense: 0, profit: 0 };
    if (o.paymentStatus === 'pago' || o.status === 'concluido') {
      monthMap[m].revenue += o.finalAmount;
    }
  });

  expenses.forEach((e) => {
    const m = e.date.slice(0, 7);
    if (!monthMap[m]) monthMap[m] = { revenue: 0, expense: 0, profit: 0 };
    monthMap[m].expense += e.amount;
  });

  Object.keys(monthMap).forEach((m) => {
    monthMap[m].profit = monthMap[m].revenue - monthMap[m].expense;
  });

  const sortedMonths = Object.keys(monthMap).sort();
  const maxMonthValue = Math.max(
    ...sortedMonths.map((m) => Math.max(monthMap[m].revenue, monthMap[m].expense)),
    100
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-cyan-600" />
            Painel de Gráficos & Desempenho
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Análise visual de rentabilidade, serviços mais vendidos e eficiência operacional
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-600 font-semibold">Atualização em tempo real</span>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
        </div>
      </div>

      {/* Quick KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Ticket Médio</span>
          <span className="text-xl font-black text-emerald-600">{formatCurrencyBRL(avgTicket)}</span>
          <span className="text-[10px] text-slate-500 mt-0.5 block">por atendimento</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Estofados Lavados</span>
          <span className="text-xl font-black text-cyan-700">{totalItemsCleaned} peças</span>
          <span className="text-[10px] text-slate-500 mt-0.5 block">sofás, colchões, etc.</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Margem Líquida</span>
          <span className="text-xl font-black text-slate-900">{marginPct.toFixed(1)}%</span>
          <span className="text-[10px] text-slate-500 mt-0.5 block">rentabilidade real</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Taxa de Conclusão</span>
          <span className="text-xl font-black text-amber-600">
            {orders.length > 0
              ? `${Math.round((paidOrders.length / orders.length) * 100)}%`
              : '100%'}
          </span>
          <span className="text-[10px] text-slate-500 mt-0.5 block">atendimentos realizados</span>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Evolução Mensal */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-cyan-600" />
                Evolução Financeira Mensal
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">Comparativo entre faturamento bruto e despesas</p>
            </div>
            <div className="flex items-center gap-3 text-[10px] font-bold">
              <span className="flex items-center gap-1 text-emerald-700">
                <span className="w-2.5 h-2.5 rounded bg-emerald-500" /> Faturamento
              </span>
              <span className="flex items-center gap-1 text-rose-700">
                <span className="w-2.5 h-2.5 rounded bg-rose-500" /> Despesas
              </span>
            </div>
          </div>

          <div className="pt-2 space-y-4">
            {sortedMonths.length === 0 ? (
              <p className="text-center py-8 text-xs text-slate-400">Nenhum dado mensal registrado ainda.</p>
            ) : (
              sortedMonths.map((m) => {
                const data = monthMap[m];
                const revPct = Math.min(100, (data.revenue / maxMonthValue) * 100);
                const expPct = Math.min(100, (data.expense / maxMonthValue) * 100);

                return (
                  <div key={m} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-700 font-mono font-bold">Mês {m}</span>
                      <span className="text-cyan-700 font-extrabold">
                        Lucro Líquido: {formatCurrencyBRL(data.profit)}
                      </span>
                    </div>

                    <div className="space-y-1.5 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-500 w-12 font-medium">Receita:</span>
                        <div className="flex-1 bg-slate-200 rounded-full h-2.5 overflow-hidden">
                          <div
                            className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                            style={{ width: `${Math.max(4, revPct)}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-bold text-emerald-700 w-16 text-right">
                          {formatCurrencyBRL(data.revenue)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-500 w-12 font-medium">Gasto:</span>
                        <div className="flex-1 bg-slate-200 rounded-full h-2.5 overflow-hidden">
                          <div
                            className="bg-rose-500 h-full rounded-full transition-all duration-500"
                            style={{ width: `${Math.max(4, expPct)}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-bold text-rose-700 w-16 text-right">
                          {formatCurrencyBRL(data.expense)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Chart 2: Serviços Mais Lucrativos */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-cyan-600" />
              Serviços Mais Demandados & Lucrativos
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">Classificação por faturamento gerado para a empresa</p>
          </div>

          <div className="space-y-3 pt-2">
            {sortedServices.map((svc, idx) => {
              const pct = (svc.revenue / maxServiceRevenue) * 100;

              return (
                <div key={idx} className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-900 flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-cyan-100 text-cyan-700 text-[10px] flex items-center justify-center font-black">
                        {idx + 1}
                      </span>
                      {svc.name}
                    </span>
                    <span className="font-black text-emerald-600 text-xs">
                      {formatCurrencyBRL(svc.revenue)}
                    </span>
                  </div>

                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-cyan-600 to-blue-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>{svc.count} estofados lavados</span>
                    <span>Representa {( (svc.revenue / (totalRevenue || 1)) * 100 ).toFixed(0)}% da receita</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 3: Distribuição de Despesas */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-rose-500" />
              Onde o Dinheiro Está Sendo Gasto
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">Distribuição percentual dos custos operacionais</p>
          </div>

          <div className="space-y-3 pt-2">
            {Object.entries(expenseCatMap).map(([category, amount]) => {
              const catPct = totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0;
              const barPct = (amount / maxExpenseAmount) * 100;

              const labelMap: Record<string, string> = {
                produtos_quimicos: '🧴 Produtos Químicos (Flotador, Peróxido)',
                combustivel: '⛽ Combustível / Gasolina',
                manutencao: '🛠️ Manutenção Máquinas & Bicos',
                marketing: '📢 Marketing & Divulgação',
                alimentacao: '🥪 Alimentação em Rota',
                equipamentos: '🧰 Equipamentos',
                outros: '📦 Outros Custos',
              };

              return (
                <div key={category} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-700">{labelMap[category] || category}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 text-[10px] font-mono">({catPct.toFixed(0)}%)</span>
                      <span className="font-extrabold text-rose-600">{formatCurrencyBRL(amount)}</span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                    <div
                      className="bg-rose-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${barPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 4: Formas de Pagamento */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              Formas de Pagamento Preferidas
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">Como os clientes mais costumam pagar pelos serviços</p>
          </div>

          <div className="space-y-3 pt-2">
            {Object.entries(paymentMethodsMap).map(([method, amount]) => {
              const methodTotal = orders.reduce((acc, curr) => acc + curr.finalAmount, 0);
              const pct = methodTotal > 0 ? (amount / methodTotal) * 100 : 0;

              const methodLabel: Record<string, { label: string; icon: string }> = {
                pix: { label: 'Pix (Transferência Instantânea)', icon: '⚡' },
                cartao_credito: { label: 'Cartão de Crédito', icon: '💳' },
                cartao_debito: { label: 'Cartão de Débito', icon: '💳' },
                dinheiro: { label: 'Dinheiro em Espécie', icon: '💵' },
                pendente: { label: 'A Definir no Local', icon: '⏳' },
              };

              return (
                <div key={method} className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg">{methodLabel[method]?.icon || '💰'}</span>
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">
                        {methodLabel[method]?.label || method}
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium">
                        {pct.toFixed(1)}% do volume total
                      </span>
                    </div>
                  </div>

                  <span className="text-xs font-black text-cyan-800">
                    {formatCurrencyBRL(amount)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
