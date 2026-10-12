import React from 'react';
import { 
  Sparkles, 
  Calendar, 
  Users, 
  DollarSign, 
  MapPin, 
  BarChart3, 
  PlusCircle, 
  Download,
  Instagram,
  ExternalLink,
  Droplets
} from 'lucide-react';
import { formatCurrencyBRL } from '../utils/storage';

interface NavbarProps {
  currentTab: 'orders' | 'clients' | 'financial' | 'map' | 'dashboard' | 'instagram';
  setCurrentTab: (tab: 'orders' | 'clients' | 'financial' | 'map' | 'dashboard' | 'instagram') => void;
  onNewOrder: () => void;
  onNewExpense: () => void;
  onExportBackup: () => void;
  monthlyProfit: number;
  todayOrdersCount: number;
  pendingReceivables: number;
  totalClientsCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  onNewOrder,
  onNewExpense,
  onExportBackup,
  monthlyProfit,
  todayOrdersCount,
  pendingReceivables,
}) => {
  const navTabs = [
    {
      id: 'orders' as const,
      label: 'Agendamentos & Pedidos',
      icon: Calendar,
      badge: todayOrdersCount > 0 ? `${todayOrdersCount} hoje` : undefined,
    },
    {
      id: 'clients' as const,
      label: 'CRM de Clientes',
      icon: Users,
    },
    {
      id: 'financial' as const,
      label: 'Planilha Gastos & Lucros',
      icon: DollarSign,
      badge: monthlyProfit !== 0 ? formatCurrencyBRL(monthlyProfit) : undefined,
      badgeColor: monthlyProfit >= 0 ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : 'text-rose-700 bg-rose-50 border-rose-200',
    },
    {
      id: 'map' as const,
      label: 'Rotas & Mapa',
      icon: MapPin,
    },
    {
      id: 'dashboard' as const,
      label: 'Painel de Gráficos',
      icon: BarChart3,
    },
    {
      id: 'instagram' as const,
      label: 'Estúdio Instagram',
      icon: Instagram,
      badge: '@expresscleanmcz',
      badgeColor: 'text-purple-700 bg-purple-50 border-purple-200',
    },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Header: Brand & Key Financial Ticker */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-3.5 gap-3 border-b border-slate-100">
          {/* Logo & Slogan */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-sky-600 via-cyan-600 to-blue-700 flex items-center justify-center shadow-md shadow-cyan-600/25 text-white ring-2 ring-cyan-500/20">
                <Droplets className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-black tracking-tight text-slate-900">
                    ExpressClean<span className="text-cyan-600">mcz</span>
                  </h1>
                  <a
                    href="https://www.instagram.com/expresscleanmcz/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-slate-600 hover:text-purple-700 bg-slate-100 hover:bg-purple-50 border border-slate-200 hover:border-purple-200 px-2 py-0.5 rounded-full transition"
                    title="Acessar o perfil oficial no Instagram"
                  >
                    <Instagram className="w-3 h-3 text-rose-500" />
                    @expresscleanmcz
                  </a>
                </div>
                <p className="text-xs text-slate-500 font-medium">
                  Rápido e Limpo • Higienização & Estofados
                </p>
              </div>
            </div>

            {/* Mobile Action Button */}
            <div className="flex items-center gap-2 md:hidden">
              <button
                onClick={onNewOrder}
                className="px-3 py-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold text-xs rounded-lg flex items-center gap-1 shadow-sm transition"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                Pedido
              </button>
            </div>
          </div>

          {/* Quick Real-Time Metrics & Action Buttons */}
          <div className="flex items-center justify-between md:justify-end gap-3 flex-wrap">
            <div className="hidden sm:flex items-center gap-4 text-xs bg-slate-50 px-4 py-2 rounded-xl border border-slate-200/80 shadow-2xs">
              <div className="flex flex-col">
                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Hoje</span>
                <span className="font-extrabold text-cyan-700">{todayOrdersCount} agendamentos</span>
              </div>
              <div className="w-px h-6 bg-slate-200" />
              <div className="flex flex-col">
                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Lucro do Mês</span>
                <span className={`font-extrabold ${monthlyProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {formatCurrencyBRL(monthlyProfit)}
                </span>
              </div>
              <div className="w-px h-6 bg-slate-200" />
              <div className="flex flex-col">
                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">A Receber</span>
                <span className="font-extrabold text-amber-600">{formatCurrencyBRL(pendingReceivables)}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onNewExpense}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 border border-slate-200 transition"
                title="Cadastrar despesa com produtos químicos, combustível, etc."
              >
                <DollarSign className="w-3.5 h-3.5 text-rose-500" />
                + Gasto
              </button>
              <button
                onClick={onNewOrder}
                className="hidden md:flex px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs rounded-xl items-center gap-1.5 shadow-md shadow-cyan-600/20 transition transform active:scale-95"
              >
                <PlusCircle className="w-4 h-4" />
                Novo Agendamento
              </button>
              <button
                onClick={onExportBackup}
                className="p-2 text-slate-500 hover:text-cyan-700 hover:bg-slate-100 rounded-xl border border-slate-200 transition"
                title="Exportar backup dos dados (JSON)"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Organized Navigation Tabs */}
        <div className="py-2.5">
          <nav className="flex space-x-1.5 p-1 bg-slate-100/90 rounded-xl border border-slate-200/80 overflow-x-auto scrollbar-none">
            {navTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = currentTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setCurrentTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-bold rounded-lg whitespace-nowrap transition-all duration-150 ${
                    isActive
                      ? 'bg-white text-cyan-800 shadow-xs border border-slate-200 font-extrabold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-600' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        tab.badgeColor || (isActive ? 'bg-cyan-50 text-cyan-700 border-cyan-200' : 'bg-slate-200/70 text-slate-700 border-slate-300/60')
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};
