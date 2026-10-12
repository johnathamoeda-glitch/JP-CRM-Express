import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  UserPlus, 
  Phone, 
  MapPin, 
  Calendar, 
  MessageCircle, 
  Edit3, 
  Trash2, 
  History,
  Award
} from 'lucide-react';
import { Client, Order } from '../types';
import { formatCurrencyBRL, formatDateBR, formatPhoneWhatsApp, getWhatsAppCleanNumber } from '../utils/storage';
import { MACEIO_NEIGHBORHOODS } from '../utils/geoMaceio';

interface ClientsViewProps {
  clients: Client[];
  orders: Order[];
  onNewClient: () => void;
  onEditClient: (client: Client) => void;
  onDeleteClient: (clientId: string) => void;
  onScheduleForClient: (client: Client) => void;
}

export const ClientsView: React.FC<ClientsViewProps> = ({
  clients,
  orders,
  onNewClient,
  onEditClient,
  onDeleteClient,
  onScheduleForClient,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [neighborhoodFilter, setNeighborhoodFilter] = useState('all');
  const [selectedClientForHistory, setSelectedClientForHistory] = useState<Client | null>(null);

  // Compute stats per client
  const clientsWithStats = clients.map((client) => {
    const clientOrders = orders.filter((o) => o.clientId === client.id || o.clientPhone === client.phone);
    const totalSpent = clientOrders
      .filter((o) => o.paymentStatus === 'pago' || o.status === 'concluido')
      .reduce((acc, curr) => acc + curr.finalAmount, 0);
    
    const sortedOrders = [...clientOrders].sort((a, b) => b.scheduledDate.localeCompare(a.scheduledDate));
    const lastServiceDate = sortedOrders[0]?.scheduledDate;

    return {
      ...client,
      ordersCount: clientOrders.length,
      totalSpent,
      lastServiceDate,
      clientOrders,
    };
  });

  const filteredClients = clientsWithStats.filter((client) => {
    const matchesSearch =
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone.includes(searchTerm) ||
      client.neighborhood.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (client.address && client.address.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;

    if (neighborhoodFilter !== 'all' && client.neighborhood !== neighborhoodFilter) {
      return false;
    }

    return true;
  });

  const totalClients = clients.length;
  const totalRevenueAll = clientsWithStats.reduce((acc, c) => acc + c.totalSpent, 0);
  const avgSpentPerClient = totalClients > 0 ? totalRevenueAll / totalClients : 0;
  const recurrentClients = clientsWithStats.filter((c) => c.ordersCount > 1).length;

  const openWhatsApp = (phone: string, name: string) => {
    const cleanPhone = getWhatsAppCleanNumber(phone);
    const msg = `Olá ${name}! Tudo bem? Aqui é da *ExpressCleanmcz*. Como está a conservação do seu estofado? Passando para saber se precisa de uma nova higienização ou impermeabilização! 🛋️✨`;
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header and Add Button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-cyan-600" />
            CRM & Carteira de Clientes
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Cadastre contatos, endereços, histórico de lavagens e fidelize clientes com pós-venda
          </p>
        </div>

        <button
          onClick={onNewClient}
          className="px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs sm:text-sm rounded-xl flex items-center gap-2 shadow-md shadow-cyan-600/20 transition self-start md:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          Cadastrar Novo Cliente
        </button>
      </div>

      {/* CRM Metric Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Total de Clientes</span>
          <span className="text-xl font-black text-slate-900">{totalClients}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Clientes Recorrentes</span>
          <span className="text-xl font-black text-cyan-700">{recurrentClients}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Ticket Médio (LTV)</span>
          <span className="text-xl font-black text-emerald-600">{formatCurrencyBRL(avgSpentPerClient)}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Taxa de Fidelização</span>
          <span className="text-xl font-black text-amber-600">
            {totalClients > 0 ? `${Math.round((recurrentClients / totalClients) * 100)}%` : '0%'}
          </span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2 relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nome, telefone, bairro ou endereço..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 shadow-2xs"
          />
        </div>

        <div>
          <select
            value={neighborhoodFilter}
            onChange={(e) => setNeighborhoodFilter(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-700 focus:outline-none focus:border-cyan-500 font-semibold shadow-2xs"
          >
            <option value="all">Todos os Bairros</option>
            {Object.keys(MACEIO_NEIGHBORHOODS).map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Clients Cards Grid */}
      {filteredClients.length === 0 ? (
        <div className="text-center py-14 bg-white rounded-2xl border border-dashed border-slate-300 space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-cyan-50 border border-cyan-200 text-cyan-600 flex items-center justify-center">
            <Users className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-800">Sua lista de clientes está zerada</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Comece agora preenchendo os dados do seu primeiro cliente para organizar seus atendimentos e histórico de higienização.
            </p>
          </div>
          <button
            onClick={onNewClient}
            className="px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs sm:text-sm rounded-xl inline-flex items-center gap-2 shadow-md shadow-cyan-600/20 transition transform active:scale-95"
          >
            <UserPlus className="w-4 h-4" />
            Cadastrar Primeiro Cliente
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClients.map((client) => (
            <div
              key={client.id}
              className="bg-white hover:bg-slate-50/60 border border-slate-200 hover:border-slate-300 rounded-2xl p-4 sm:p-5 transition shadow-xs flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Header: Name and Neighborhood */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900">
                      {client.name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-cyan-700 font-bold mt-0.5">
                      <MapPin className="w-3.5 h-3.5 shrink-0 text-cyan-600" />
                      <span>{client.neighborhood}</span>
                    </div>
                  </div>

                  {client.ordersCount > 1 && (
                    <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-md bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1 shrink-0">
                      <Award className="w-3 h-3 text-amber-600" /> Recorrente
                    </span>
                  )}
                </div>

                {/* Phone & Address */}
                <div className="space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-mono text-slate-800 font-semibold">{formatPhoneWhatsApp(client.phone)}</span>
                  </div>
                  {client.address && (
                    <p className="text-slate-500 line-clamp-2">
                      {client.address} {client.reference ? `(${client.reference})` : ''}
                    </p>
                  )}
                </div>

                {/* Notes if any */}
                {client.notes && (
                  <p className="text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200 italic">
                    💡 {client.notes}
                  </p>
                )}

                {/* Stats badge */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-[11px]">
                  <div>
                    <span className="text-slate-400 font-medium block">Serviços Feitos</span>
                    <strong className="text-slate-800 font-bold">{client.ordersCount} atendimentos</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block">Total Gasto</span>
                    <strong className="text-emerald-600 font-extrabold">{formatCurrencyBRL(client.totalSpent)}</strong>
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between gap-1.5">
                <div className="flex items-center gap-1">
                  {/* WhatsApp */}
                  <button
                    onClick={() => openWhatsApp(client.phone, client.name)}
                    className="p-2 text-emerald-700 hover:bg-emerald-50 rounded-lg border border-slate-200 transition"
                    title="Conversar no WhatsApp"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-600" />
                  </button>

                  {/* History */}
                  <button
                    onClick={() => setSelectedClientForHistory(client)}
                    className="p-2 text-slate-600 hover:text-cyan-700 hover:bg-slate-50 rounded-lg border border-slate-200 transition"
                    title="Ver Histórico de Serviços"
                  >
                    <History className="w-4 h-4" />
                  </button>

                  {/* Edit */}
                  <button
                    onClick={() => onEditClient(client)}
                    className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg border border-slate-200 transition"
                    title="Editar Cliente"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => onDeleteClient(client.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg border border-slate-200 transition"
                    title="Excluir Cliente"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Schedule Button */}
                <button
                  onClick={() => onScheduleForClient(client)}
                  className="px-3 py-1.5 bg-cyan-50 hover:bg-cyan-100 text-cyan-800 font-bold text-xs rounded-lg border border-cyan-200 transition flex items-center gap-1"
                >
                  <Calendar className="w-3.5 h-3.5 text-cyan-600" />
                  Agendar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Client History Modal in Light Theme */}
      {selectedClientForHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Histórico: {selectedClientForHistory.name}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  {selectedClientForHistory.neighborhood} • {formatPhoneWhatsApp(selectedClientForHistory.phone)}
                </p>
              </div>
              <button
                onClick={() => setSelectedClientForHistory(null)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {orders
                .filter((o) => o.clientId === selectedClientForHistory.id || o.clientPhone === selectedClientForHistory.phone)
                .map((ord) => (
                  <div key={ord.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-900">{formatDateBR(ord.scheduledDate)} às {ord.scheduledTime}</span>
                      <span className="text-emerald-600 font-extrabold">{formatCurrencyBRL(ord.finalAmount)}</span>
                    </div>
                    <p className="text-slate-600 font-medium">
                      {ord.services.map((s) => `${s.quantity}x ${s.name}`).join(', ')}
                    </p>
                    <span className="inline-block text-[10px] text-cyan-700 uppercase font-bold">
                      Status: {ord.status} • {ord.paymentStatus}
                    </span>
                  </div>
                ))}
              {orders.filter((o) => o.clientId === selectedClientForHistory.id || o.clientPhone === selectedClientForHistory.phone).length === 0 && (
                <p className="text-xs text-slate-400 text-center py-6">Nenhum serviço registrado ainda para este cliente.</p>
              )}
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedClientForHistory(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
