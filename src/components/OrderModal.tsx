import React, { useState, useEffect } from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  Trash2, 
  Check, 
  UserPlus, 
  Sparkles,
  DollarSign
} from 'lucide-react';
import { Client, Order, OrderStatus, PaymentMethod, PaymentStatus, ServiceItem } from '../types';
import { COMMON_SERVICES } from '../data/mockData';
import { MACEIO_NEIGHBORHOODS, getCoordinatesForNeighborhood } from '../utils/geoMaceio';
import { formatCurrencyBRL } from '../utils/storage';

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (orderData: Omit<Order, 'id' | 'createdAt'>, existingId?: string) => void;
  clients: Client[];
  editingOrder?: Order | null;
  onOpenNewClientModal?: () => void;
}

export const OrderModal: React.FC<OrderModalProps> = ({
  isOpen,
  onClose,
  onSave,
  clients,
  editingOrder,
  onOpenNewClientModal,
}) => {
  const [selectedClientId, setSelectedClientId] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [clientNeighborhood, setClientNeighborhood] = useState('Ponta Verde');

  const [scheduledDate, setScheduledDate] = useState(new Date().toISOString().split('T')[0]);
  const [scheduledTime, setScheduledTime] = useState('09:00');
  const [estimatedDurationMinutes, setEstimatedDurationMinutes] = useState(90);

  const [services, setServices] = useState<ServiceItem[]>([
    { id: 'sofa_3l', name: 'Sofá 3 Lugares (Fixo)', price: 190, quantity: 1 },
  ]);

  const [discount, setDiscount] = useState<number>(0);
  const [travelFee, setTravelFee] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('pendente');
  const [status, setStatus] = useState<OrderStatus>('agendado');
  const [upholsteryDetails, setUpholsteryDetails] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (editingOrder) {
      setSelectedClientId(editingOrder.clientId);
      setClientName(editingOrder.clientName);
      setClientPhone(editingOrder.clientPhone);
      setClientAddress(editingOrder.clientAddress);
      setClientNeighborhood(editingOrder.clientNeighborhood);
      setScheduledDate(editingOrder.scheduledDate);
      setScheduledTime(editingOrder.scheduledTime);
      setEstimatedDurationMinutes(editingOrder.estimatedDurationMinutes || 90);
      setServices(editingOrder.services.length > 0 ? editingOrder.services : [
        { id: 'sofa_3l', name: 'Sofá 3 Lugares', price: 190, quantity: 1 }
      ]);
      setDiscount(editingOrder.discount || 0);
      setTravelFee(editingOrder.travelFee || 0);
      setPaymentMethod(editingOrder.paymentMethod);
      setPaymentStatus(editingOrder.paymentStatus);
      setStatus(editingOrder.status);
      setUpholsteryDetails(editingOrder.upholsteryDetails || '');
      setNotes(editingOrder.notes || '');
    } else {
      if (clients.length > 0) {
        const first = clients[0];
        setSelectedClientId(first.id);
        setClientName(first.name);
        setClientPhone(first.phone);
        setClientAddress(first.address);
        setClientNeighborhood(first.neighborhood);
      } else {
        setSelectedClientId('');
        setClientName('');
        setClientPhone('');
        setClientAddress('');
        setClientNeighborhood('Ponta Verde');
      }
      setScheduledDate(new Date().toISOString().split('T')[0]);
      setScheduledTime('09:00');
      setEstimatedDurationMinutes(90);
      setServices([
        { id: 'sofa_ret_3l', name: 'Sofá 3 Lugares Retrátil/Reclinável', price: 240, quantity: 1 }
      ]);
      setDiscount(0);
      setTravelFee(0);
      setPaymentMethod('pix');
      setPaymentStatus('pendente');
      setStatus('agendado');
      setUpholsteryDetails('');
      setNotes('');
    }
  }, [editingOrder, isOpen, clients]);

  if (!isOpen) return null;

  const handleClientSelect = (clientId: string) => {
    setSelectedClientId(clientId);
    const client = clients.find((c) => c.id === clientId);
    if (client) {
      setClientName(client.name);
      setClientPhone(client.phone);
      setClientAddress(client.address);
      setClientNeighborhood(client.neighborhood);
    }
  };

  const handleAddServicePreset = (preset: typeof COMMON_SERVICES[0]) => {
    const existingIndex = services.findIndex((s) => s.id === preset.id);
    if (existingIndex >= 0) {
      const updated = [...services];
      updated[existingIndex].quantity += 1;
      setServices(updated);
    } else {
      setServices([
        ...services,
        {
          id: preset.id,
          name: preset.name,
          price: preset.defaultPrice,
          quantity: 1,
        },
      ]);
    }
  };

  const handleRemoveService = (index: number) => {
    setServices(services.filter((_, i) => i !== index));
  };

  const handleServiceChange = (index: number, field: keyof ServiceItem, value: any) => {
    const updated = [...services];
    updated[index] = { ...updated[index], [field]: value };
    setServices(updated);
  };

  const subtotal = services.reduce((acc, curr) => acc + curr.price * curr.quantity, 0);
  const finalAmount = Math.max(0, subtotal - (Number(discount) || 0) + (Number(travelFee) || 0));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!clientName.trim() || !clientPhone.trim()) {
      alert('Informe o nome e telefone do cliente.');
      return;
    }

    if (services.length === 0) {
      alert('Adicione ao menos um serviço para o agendamento.');
      return;
    }

    const coords = getCoordinatesForNeighborhood(clientNeighborhood);

    onSave(
      {
        clientId: selectedClientId || 'manual-' + Date.now(),
        clientName: clientName.trim(),
        clientPhone: clientPhone.trim(),
        clientAddress: clientAddress.trim(),
        clientNeighborhood: clientNeighborhood.trim(),
        lat: editingOrder?.lat || coords.lat,
        lng: editingOrder?.lng || coords.lng,
        scheduledDate,
        scheduledTime,
        services,
        totalAmount: subtotal,
        discount: Number(discount) || 0,
        travelFee: Number(travelFee) || 0,
        finalAmount,
        paymentMethod,
        paymentStatus,
        status,
        estimatedDurationMinutes: Number(estimatedDurationMinutes) || 90,
        upholsteryDetails: upholsteryDetails.trim(),
        notes: notes.trim(),
        completedAt: status === 'concluido' ? (editingOrder?.completedAt || scheduledDate) : undefined,
      },
      editingOrder?.id
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-50 text-cyan-700">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">
                {editingOrder ? 'Editar Agendamento' : 'Novo Agendamento de Limpeza'}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Organize seu horário, valor e localização
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Cliente Selection */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-cyan-800 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-600" /> 1. Dados do Cliente
              </span>
              {onOpenNewClientModal && (
                <button
                  type="button"
                  onClick={onOpenNewClientModal}
                  className="text-xs text-cyan-700 hover:text-cyan-800 font-bold flex items-center gap-1"
                >
                  <UserPlus className="w-3.5 h-3.5" /> + Cadastrar no CRM
                </button>
              )}
            </div>

            {clients.length > 0 && (
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Selecionar Cliente Cadastrado (ou preencher avulso abaixo)
                </label>
                <select
                  value={selectedClientId}
                  onChange={(e) => handleClientSelect(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-cyan-500"
                >
                  <option value="">-- Cliente Avulso / Digitar dados --</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} - {c.neighborhood} ({c.phone})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Nome do Cliente *
                </label>
                <input
                  type="text"
                  required
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Nome do cliente"
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  WhatsApp / Telefone *
                </label>
                <input
                  type="text"
                  required
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="82 99999-9999"
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Endereço do Atendimento
                </label>
                <input
                  type="text"
                  value={clientAddress}
                  onChange={(e) => setClientAddress(e.target.value)}
                  placeholder="Rua, número, apto, condomínio"
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Bairro
                </label>
                <select
                  value={clientNeighborhood}
                  onChange={(e) => setClientNeighborhood(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-cyan-500"
                >
                  {Object.keys(MACEIO_NEIGHBORHOODS).map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Data, Horário e Status */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <span className="text-xs font-bold text-cyan-800 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-cyan-600" /> 2. Data, Horário & Status
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Data *
                </label>
                <input
                  type="date"
                  required
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-cyan-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Horário *
                </label>
                <input
                  type="time"
                  required
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-cyan-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Duração Est.
                </label>
                <select
                  value={estimatedDurationMinutes}
                  onChange={(e) => setEstimatedDurationMinutes(Number(e.target.value))}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-cyan-500 font-medium"
                >
                  <option value={45}>45 min</option>
                  <option value={60}>1h 00m</option>
                  <option value={90}>1h 30m</option>
                  <option value={120}>2h 00m</option>
                  <option value={150}>2h 30m</option>
                  <option value={180}>3h 00m</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Status do Pedido
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as OrderStatus)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-cyan-500 font-bold"
                >
                  <option value="agendado">📅 Agendado</option>
                  <option value="em_andamento">⏳ Em Andamento</option>
                  <option value="concluido">✅ Concluído</option>
                  <option value="cancelado">❌ Cancelado</option>
                </select>
              </div>
            </div>
          </div>

          {/* Serviços e Valores */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <span className="text-xs font-bold text-cyan-800 uppercase tracking-wider flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-cyan-600" /> 3. Serviços de Estofados
            </span>

            {/* Quick Presets */}
            <div>
              <p className="text-[11px] text-slate-600 mb-1.5 font-medium">
                Clique para adicionar serviços rápidos com valor padrão:
              </p>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1.5 bg-white rounded-lg border border-slate-200">
                {COMMON_SERVICES.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => handleAddServicePreset(s)}
                    className="px-2.5 py-1 text-[11px] bg-slate-100 hover:bg-cyan-50 hover:text-cyan-800 hover:border-cyan-300 border border-slate-200 rounded-md text-slate-700 transition flex items-center gap-1 font-medium"
                  >
                    <span>+</span>
                    <span>{s.name}</span>
                    <span className="text-emerald-700 font-bold">{formatCurrencyBRL(s.defaultPrice)}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Services List in the order */}
            <div className="space-y-2 mt-3">
              {services.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-white p-2.5 rounded-lg border border-slate-200">
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => handleServiceChange(idx, 'name', e.target.value)}
                    className="flex-1 bg-transparent border-none text-xs sm:text-sm text-slate-900 font-medium focus:outline-none"
                    placeholder="Descrição do serviço"
                  />
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-slate-500 font-medium">Qtd:</span>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleServiceChange(idx, 'quantity', Math.max(1, Number(e.target.value)))}
                      className="w-12 bg-slate-50 border border-slate-300 rounded px-1.5 py-1 text-xs text-center text-slate-900 font-bold"
                    />
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-slate-500 font-medium">R$:</span>
                    <input
                      type="number"
                      min="0"
                      value={item.price}
                      onChange={(e) => handleServiceChange(idx, 'price', Number(e.target.value))}
                      className="w-20 bg-slate-50 border border-slate-300 rounded px-1.5 py-1 text-xs text-right text-emerald-700 font-extrabold"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveService(idx)}
                    className="p-1 text-slate-400 hover:text-rose-600 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Totals & Discounts */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-200">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Desconto (R$)
                </label>
                <input
                  type="number"
                  min="0"
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-rose-600 font-bold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Taxa Deslocamento (R$)
                </label>
                <input
                  type="number"
                  min="0"
                  value={travelFee}
                  onChange={(e) => setTravelFee(Number(e.target.value))}
                  placeholder="Ex: 20"
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-cyan-700 font-bold focus:outline-none"
                />
              </div>

              <div className="bg-white p-2.5 rounded-lg border border-slate-200 flex flex-col justify-center">
                <span className="text-[10px] uppercase font-bold text-slate-400">Total a Cobrar</span>
                <span className="text-lg font-black text-emerald-600">
                  {formatCurrencyBRL(finalAmount)}
                </span>
              </div>
            </div>

            {/* Forma de Pagamento & Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Forma de Pagamento
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none font-medium"
                >
                  <option value="pix">Pix</option>
                  <option value="cartao_credito">Cartão de Crédito</option>
                  <option value="cartao_debito">Cartão de Débito</option>
                  <option value="dinheiro">Dinheiro</option>
                  <option value="pendente">A Definir</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Status do Pagamento
                </label>
                <select
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none font-bold"
                >
                  <option value="pago">✅ Pago (Entra no Lucro)</option>
                  <option value="pendente">⏳ Pendente (A Receber)</option>
                  <option value="parcial">🟡 Parcial</option>
                </select>
              </div>
            </div>
          </div>

          {/* Detalhes do Estofado & Observações */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Detalhes do Estofado (Tecido / Manchas / Pets)
              </label>
              <textarea
                rows={2}
                value={upholsteryDetails}
                onChange={(e) => setUpholsteryDetails(e.target.value)}
                placeholder="Ex: Veludo cinza com manchas de café"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:bg-white resize-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Instruções / Observações Internas
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ex: Levar extensão longa"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:bg-white resize-none"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-xl shadow-md shadow-cyan-600/20 flex items-center gap-1.5 transition"
            >
              <Check className="w-4 h-4" />
              {editingOrder ? 'Salvar Alterações' : 'Confirmar Agendamento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
