import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  MessageCircle, 
  FileText, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  PlayCircle, 
  XCircle, 
  Search, 
  Plus, 
  Sparkles,
  Map
} from 'lucide-react';
import { Order, OrderStatus } from '../types';
import { formatCurrencyBRL, formatDateBR, getWhatsAppCleanNumber } from '../utils/storage';

interface OrdersViewProps {
  orders: Order[];
  onNewOrder: () => void;
  onEditOrder: (order: Order) => void;
  onDeleteOrder: (orderId: string) => void;
  onUpdateStatus: (orderId: string, status: OrderStatus) => void;
  onOpenReceipt: (order: Order) => void;
  onOpenMapWithOrder: (order: Order) => void;
}

export const OrdersView: React.FC<OrdersViewProps> = ({
  orders,
  onNewOrder,
  onEditOrder,
  onDeleteOrder,
  onUpdateStatus,
  onOpenReceipt,
  onOpenMapWithOrder,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | OrderStatus>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');

  const todayStr = new Date().toISOString().split('T')[0];

  // Helper date filtering
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.clientNeighborhood.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.clientPhone.includes(searchTerm) ||
      order.services.some((s) => s.name.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;

    if (statusFilter !== 'all' && order.status !== statusFilter) {
      return false;
    }

    if (dateFilter === 'today') {
      return order.scheduledDate === todayStr;
    }
    if (dateFilter === 'week') {
      const now = new Date();
      const orderDate = new Date(order.scheduledDate);
      const diffTime = orderDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays >= -1 && diffDays <= 7;
    }
    if (dateFilter === 'month') {
      const now = new Date();
      const currentYearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      return order.scheduledDate.startsWith(currentYearMonth);
    }

    return true;
  });

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    if (a.scheduledDate === b.scheduledDate) {
      return a.scheduledTime.localeCompare(b.scheduledTime);
    }
    return b.scheduledDate.localeCompare(a.scheduledDate);
  });

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'agendado':
        return (
          <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
            <Clock className="w-3 h-3" /> Agendado
          </span>
        );
      case 'em_andamento':
        return (
          <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-amber-50 text-amber-700 border border-amber-300 flex items-center gap-1">
            <PlayCircle className="w-3 h-3 text-amber-600 animate-spin" /> Em Andamento
          </span>
        );
      case 'concluido':
        return (
          <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Concluído
          </span>
        );
      case 'cancelado':
        return (
          <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
            <XCircle className="w-3 h-3" /> Cancelado
          </span>
        );
    }
  };

  const sendWhatsAppQuickMessage = (order: Order, type: 'confirmar' | 'a_caminho' | 'conclusao') => {
    const cleanPhone = getWhatsAppCleanNumber(order.clientPhone);
    let msg = '';

    if (type === 'confirmar') {
      msg = `Olá ${order.clientName}! Aqui é da *ExpressCleanmcz*. Passando para confirmar seu agendamento de higienização de estofados para *${formatDateBR(order.scheduledDate)} às ${order.scheduledTime}* no endereço: ${order.clientAddress}. Tudo certo para esse horário? 🛋️✨`;
    } else if (type === 'a_caminho') {
      msg = `Olá ${order.clientName}! O técnico da *ExpressCleanmcz* já está a caminho do seu endereço (${order.clientAddress}, ${order.clientNeighborhood}). Previsão de chegada em breve! 🚗💨`;
    } else if (type === 'conclusao') {
      msg = `Olá ${order.clientName}! Seu estofado foi 100% higienizado pela *ExpressCleanmcz*! ✨\nLembre-se de deixar o ambiente bem ventilado para secagem (tempo estimado de 6 a 12h). Agradecemos a confiança! Qualquer dúvida estamos à disposição. 🌊🧼`;
    }

    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner and Quick Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-cyan-600" />
            Gerenciador de Agendamentos & Pedidos
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Controle de serviços de lavagem de estofados, status e comunicação direta via WhatsApp
          </p>
        </div>

        <button
          onClick={onNewOrder}
          className="px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs sm:text-sm rounded-xl flex items-center gap-2 shadow-md shadow-cyan-600/20 transition self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          Novo Agendamento
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-3">
        <div className="sm:col-span-2 relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por cliente, bairro, telefone ou serviço..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 shadow-2xs"
          />
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-700 focus:outline-none focus:border-cyan-500 font-semibold shadow-2xs"
          >
            <option value="all">Todos os Status</option>
            <option value="agendado">📅 Agendados</option>
            <option value="em_andamento">⏳ Em Andamento</option>
            <option value="concluido">✅ Concluídos</option>
            <option value="cancelado">❌ Cancelados</option>
          </select>
        </div>

        <div>
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value as any)}
            className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-700 focus:outline-none focus:border-cyan-500 font-semibold shadow-2xs"
          >
            <option value="all">Todas as Datas</option>
            <option value="today">Hoje</option>
            <option value="week">Próximos 7 Dias</option>
            <option value="month">Este Mês</option>
          </select>
        </div>
      </div>

      {/* Orders List / Cards */}
      {sortedOrders.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">Nenhum agendamento encontrado</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Ajuste os filtros de pesquisa ou clique no botão acima para agendar um novo serviço.
          </p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {sortedOrders.map((order) => {
            const isToday = order.scheduledDate === todayStr;

            return (
              <div
                key={order.id}
                className={`bg-white hover:bg-slate-50/60 border rounded-2xl p-4 sm:p-5 transition shadow-xs ${
                  isToday 
                    ? 'border-cyan-400 ring-2 ring-cyan-100' 
                    : 'border-slate-200'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left Column: Client & Appointment Details */}
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span 
                        className="font-extrabold text-base text-slate-900 hover:text-cyan-700 transition cursor-pointer" 
                        onClick={() => onEditOrder(order)}
                      >
                        {order.clientName}
                      </span>
                      {getStatusBadge(order.status)}
                      {isToday && (
                        <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-md bg-cyan-600 text-white">
                          HOJE
                        </span>
                      )}
                      <span className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-cyan-600" />
                        <strong className="text-slate-700">{order.clientNeighborhood}</strong>
                      </span>
                    </div>

                    {/* Date, Time, Duration & Address */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
                      <div className="flex items-center gap-1 font-bold text-slate-800">
                        <Calendar className="w-3.5 h-3.5 text-cyan-600" />
                        {formatDateBR(order.scheduledDate)}
                      </div>
                      <div className="flex items-center gap-1 font-bold text-slate-800">
                        <Clock className="w-3.5 h-3.5 text-cyan-600" />
                        {order.scheduledTime} ({order.estimatedDurationMinutes || 90}min)
                      </div>
                      <div className="text-slate-500 truncate max-w-md">
                        {order.clientAddress}
                      </div>
                    </div>

                    {/* Services Chips */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {order.services.map((item, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded-md text-[11px] border border-slate-200 font-medium flex items-center gap-1"
                        >
                          <Sparkles className="w-3 h-3 text-cyan-600" />
                          <span>{item.quantity}x {item.name}</span>
                          <span className="text-emerald-700 font-bold">
                            ({formatCurrencyBRL(item.price * item.quantity)})
                          </span>
                        </span>
                      ))}
                    </div>

                    {/* Notes if present */}
                    {order.upholsteryDetails && (
                      <p className="text-[11px] text-slate-600 italic bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200 inline-block">
                        Estofado: {order.upholsteryDetails}
                      </p>
                    )}
                  </div>

                  {/* Middle: Financial & Payment Info */}
                  <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end justify-between sm:justify-end gap-2 lg:gap-1 border-t lg:border-t-0 sm:border-slate-100 pt-3 lg:pt-0">
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Total do Serviço</span>
                      <span className="text-lg font-black text-emerald-600">
                        {formatCurrencyBRL(order.finalAmount)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded border ${
                        order.paymentStatus === 'pago' 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {order.paymentStatus === 'pago' ? 'PAGO' : 'PENDENTE'} • {order.paymentMethod.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Right Column: Actions */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                    {order.status === 'agendado' && (
                      <button
                        onClick={() => onUpdateStatus(order.id, 'em_andamento')}
                        className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold rounded-lg border border-amber-200 flex items-center gap-1 transition"
                        title="Iniciar atendimento"
                      >
                        <PlayCircle className="w-3.5 h-3.5 text-amber-600" />
                        Iniciar
                      </button>
                    )}
                    {order.status === 'em_andamento' && (
                      <button
                        onClick={() => onUpdateStatus(order.id, 'concluido')}
                        className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-lg border border-emerald-200 flex items-center gap-1 transition"
                        title="Concluir serviço e registrar faturamento"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Concluir
                      </button>
                    )}

                    {/* WhatsApp Quick Message Menu */}
                    <div className="flex items-center bg-slate-50 p-1 rounded-lg border border-slate-200">
                      <button
                        onClick={() => sendWhatsAppQuickMessage(order, 'confirmar')}
                        className="px-2 py-1 text-[11px] text-slate-700 hover:text-emerald-700 hover:bg-white rounded flex items-center gap-1 transition font-medium"
                        title="Confirmar Agendamento no WhatsApp"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="hidden sm:inline">Confirmar</span>
                      </button>
                      <button
                        onClick={() => sendWhatsAppQuickMessage(order, 'a_caminho')}
                        className="px-2 py-1 text-[11px] text-slate-700 hover:text-cyan-700 hover:bg-white rounded flex items-center gap-1 transition font-medium"
                        title="Avisar que está a caminho"
                      >
                        🚗 <span className="hidden sm:inline">A caminho</span>
                      </button>
                      <button
                        onClick={() => sendWhatsAppQuickMessage(order, 'conclusao')}
                        className="px-2 py-1 text-[11px] text-slate-700 hover:text-purple-700 hover:bg-white rounded flex items-center gap-1 transition font-medium"
                        title="Enviar instruções pós-limpeza"
                      >
                        ✨ <span className="hidden sm:inline">Pós-Limpeza</span>
                      </button>
                    </div>

                    {/* Receipt Generator */}
                    <button
                      onClick={() => onOpenReceipt(order)}
                      className="p-2 text-slate-600 hover:text-cyan-700 hover:bg-slate-100 rounded-lg border border-slate-200 transition"
                      title="Gerar Recibo ou Orçamento"
                    >
                      <FileText className="w-4 h-4" />
                    </button>

                    {/* Map Pin / Waze */}
                    <button
                      onClick={() => onOpenMapWithOrder(order)}
                      className="p-2 text-slate-600 hover:text-cyan-700 hover:bg-slate-100 rounded-lg border border-slate-200 transition"
                      title="Ver no Mapa / Traçar Rota"
                    >
                      <Map className="w-4 h-4" />
                    </button>

                    {/* Edit Order */}
                    <button
                      onClick={() => onEditOrder(order)}
                      className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200 transition"
                      title="Editar Agendamento"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    {/* Delete Order */}
                    <button
                      onClick={() => onDeleteOrder(order.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg border border-slate-200 transition"
                      title="Excluir Agendamento"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
