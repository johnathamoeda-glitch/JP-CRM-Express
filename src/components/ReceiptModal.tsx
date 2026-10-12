import React, { useState } from 'react';
import { 
  X, 
  Printer, 
  Copy, 
  Check, 
  ShieldCheck
} from 'lucide-react';
import { Order } from '../types';
import { formatCurrencyBRL, formatDateBR, formatPhoneWhatsApp } from '../utils/storage';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  pixKey?: string;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  onClose,
  order,
  pixKey = 'expresscleanmcz@pix.com.br',
}) => {
  const [docType, setDocType] = useState<'recibo' | 'orcamento'>('recibo');
  const [copied, setCopied] = useState(false);

  if (!isOpen || !order) return null;

  const servicesText = order.services
    .map((s) => `• ${s.quantity}x ${s.name} - ${formatCurrencyBRL(s.price * s.quantity)}`)
    .join('\n');

  const generateWhatsAppMessage = () => {
    const isBudget = docType === 'orcamento';
    const title = isBudget 
      ? `🛋️ *ORÇAMENTO EXPRESSCLEAN MCZ* 🛋️` 
      : `✨ *RECIBO DE SERVIÇO CONCLUÍDO - EXPRESSCLEAN MCZ* ✨`;

    return `${title}
    
Olá, *${order.clientName}*! Seguem os detalhes do seu atendimento:

📅 *Data:* ${formatDateBR(order.scheduledDate)} às ${order.scheduledTime}
📍 *Endereço:* ${order.clientAddress} (${order.clientNeighborhood})

📋 *Serviços:*
${servicesText}
${order.discount > 0 ? `🎁 *Desconto Especial:* - ${formatCurrencyBRL(order.discount)}\n` : ''}${order.travelFee > 0 ? `🚗 *Taxa de Deslocamento:* + ${formatCurrencyBRL(order.travelFee)}\n` : ''}
💰 *TOTAL: ${formatCurrencyBRL(order.finalAmount)}*
💳 *Pagamento:* ${order.paymentMethod.toUpperCase()} (${order.paymentStatus === 'pago' ? 'PAGO ✅' : 'PENDENTE ⏳'})

🔑 *Chave Pix:* ${pixKey} (ExpressCleanmcz)

🛡️ *CUIDADOS E PÓS-LIMPEZA:*
- Tempo médio de secagem: 6 a 12 horas em local arejado.
- Mantenha janelas abertas para circulação de ar natural.
- Higienização profissional com eliminação de ácaros, bactérias e odores!

Obrigado pela preferência na *ExpressCleanmcz*! 🌊🧼`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateWhatsAppMessage());
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Top Control Bar */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-slate-100 bg-slate-50/70 print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Tipo:</span>
            <div className="flex bg-slate-200/80 p-0.5 rounded-lg">
              <button
                type="button"
                onClick={() => setDocType('recibo')}
                className={`px-3 py-1 text-xs font-bold rounded-md transition ${
                  docType === 'recibo'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Recibo
              </button>
              <button
                type="button"
                onClick={() => setDocType('orcamento')}
                className={`px-3 py-1 text-xs font-bold rounded-md transition ${
                  docType === 'orcamento'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Orçamento
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 rounded-lg flex items-center gap-1.5 border border-slate-200 shadow-2xs transition"
              title="Copiar mensagem pronta para o WhatsApp"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-cyan-600" />}
              {copied ? 'Copiado!' : 'Copiar p/ WhatsApp'}
            </button>
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-700 rounded-lg flex items-center gap-1.5 shadow-xs transition"
            >
              <Printer className="w-3.5 h-3.5" />
              Imprimir
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Container */}
        <div id="printable-receipt" className="p-6 sm:p-8 bg-white text-slate-900 font-sans space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between border-b border-slate-200 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-cyan-600 text-white font-black flex items-center justify-center">
                  EC
                </div>
                <h2 className="text-xl font-black tracking-tight text-slate-900">
                  ExpressClean<span className="text-cyan-600">mcz</span>
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                Higienização & Impermeabilização de Estofados
              </p>
              <p className="text-[11px] text-slate-400">
                Atendimento em Domicílio
              </p>
            </div>

            <div className="text-right">
              <span className="inline-block px-3 py-1 text-xs font-extrabold uppercase rounded-full bg-cyan-50 text-cyan-800 border border-cyan-200">
                {docType === 'recibo' ? 'RECIBO DE SERVIÇO' : 'ORÇAMENTO COMERCIAL'}
              </span>
              <p className="text-xs text-slate-500 mt-1.5 font-medium">
                Nº: #{order.id.slice(-6).toUpperCase()}
              </p>
              <p className="text-xs text-slate-500 font-medium">
                Data: {formatDateBR(order.scheduledDate)}
              </p>
            </div>
          </div>

          {/* Client Details */}
          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Cliente</span>
              <p className="font-extrabold text-sm text-slate-900">{order.clientName}</p>
              <p className="text-slate-600 font-medium mt-0.5">{formatPhoneWhatsApp(order.clientPhone)}</p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Local de Atendimento</span>
              <p className="text-slate-800 font-medium">{order.clientAddress}</p>
              <p className="text-slate-600 font-bold">{order.clientNeighborhood}</p>
            </div>
          </div>

          {/* Services Table */}
          <div>
            <span className="block text-[11px] uppercase font-bold text-slate-500 mb-2">
              Detalhamento dos Serviços
            </span>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="px-3.5 py-2.5">Item / Descrição</th>
                    <th className="px-3 py-2.5 text-center">Qtd</th>
                    <th className="px-3 py-2.5 text-right">Unitário</th>
                    <th className="px-3.5 py-2.5 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {order.services.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/60">
                      <td className="px-3.5 py-2.5 font-semibold text-slate-800">
                        {item.name}
                      </td>
                      <td className="px-3 py-2.5 text-center text-slate-600">
                        {item.quantity}
                      </td>
                      <td className="px-3 py-2.5 text-right text-slate-600">
                        {formatCurrencyBRL(item.price)}
                      </td>
                      <td className="px-3.5 py-2.5 text-right font-extrabold text-slate-900">
                        {formatCurrencyBRL(item.price * item.quantity)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Financial Totals */}
          <div className="flex justify-end">
            <div className="w-64 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span>{formatCurrencyBRL(order.totalAmount)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-rose-600 font-medium">
                  <span>Desconto:</span>
                  <span>- {formatCurrencyBRL(order.discount)}</span>
                </div>
              )}
              {order.travelFee > 0 && (
                <div className="flex justify-between text-cyan-700 font-medium">
                  <span>Taxa Deslocamento:</span>
                  <span>+ {formatCurrencyBRL(order.travelFee)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-slate-200 pt-2 text-sm font-black text-slate-900">
                <span>Valor Total:</span>
                <span className="text-cyan-700 text-base">
                  {formatCurrencyBRL(order.finalAmount)}
                </span>
              </div>
              <div className="flex justify-between text-[11px] text-slate-500 pt-1">
                <span>Forma de Pagamento:</span>
                <span className="uppercase font-bold text-slate-800">
                  {order.paymentMethod} ({order.paymentStatus})
                </span>
              </div>
            </div>
          </div>

          {/* Pix & Instructions Card */}
          <div className="p-4 bg-cyan-50/70 border border-cyan-200 rounded-xl space-y-2 text-xs">
            <div className="flex items-center gap-2 text-cyan-900 font-bold">
              <ShieldCheck className="w-4 h-4 text-cyan-700" />
              <span>Instruções Técnicas & Garantia</span>
            </div>
            <p className="text-[11px] text-slate-700 leading-relaxed font-medium">
              • <strong>Tempo de Secagem:</strong> Recomendado de 6 a 12 horas em ambiente arejado.<br />
              • <strong>Higienização Profissional:</strong> Produtos seguros com ação antibacteriana e antifúngica.<br />
              • <strong>Chave Pix:</strong> <span className="font-mono font-bold text-cyan-800">{pixKey}</span>
            </p>
          </div>

          {/* Signatures */}
          <div className="pt-6 border-t border-slate-200 grid grid-cols-2 gap-8 text-center text-[10px] text-slate-500">
            <div>
              <div className="border-b border-slate-300 mb-1 w-3/4 mx-auto" />
              ExpressCleanmcz (Responsável)
            </div>
            <div>
              <div className="border-b border-slate-300 mb-1 w-3/4 mx-auto" />
              {order.clientName} (Cliente)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
