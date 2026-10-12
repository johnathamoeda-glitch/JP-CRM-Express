import React, { useState } from 'react';
import { 
  Instagram, 
  ExternalLink, 
  Copy, 
  Check, 
  Sparkles, 
  Droplets, 
  Calendar, 
  MessageCircle, 
  ShieldCheck,
  Flame,
  Award
} from 'lucide-react';
import { Order } from '../types';
import { formatCurrencyBRL } from '../utils/storage';

interface InstagramStudioViewProps {
  orders: Order[];
}

export const InstagramStudioView: React.FC<InstagramStudioViewProps> = ({ orders }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [selectedOrderClient, setSelectedOrderClient] = useState<string>('Cliente Especial');
  const [upholsteryType, setUpholsteryType] = useState<string>('Sofá retrátil 3 lugares');

  const templates = [
    {
      title: 'Post Feed / Reels: "A Cor da Água da Extratora! 😱💧"',
      subtitle: 'O post que mais converte clientes e gera choque visual no Instagram',
      category: 'Prova de Limpeza',
      text: `Você tem certeza de que o seu sofá está realmente limpo? 👀

Dá uma olhada na cor da água que saiu durante essa higienização profunda! 😱💧

Mesmo quando o estofado parece limpo a olho nu, ele acumula diariamente:
🦠 Milhares de ácaros e bactérias
💨 Poeira, fuligem e poluição
🐕 Pelos e secreções de pets
☕ Resíduos de suor, líquidos e alimentos

Com a @expresscleanmcz, nós usamos produtos de padrão hospitalar e extração potente para devolver a saúde, o cheiro agradável e as cores vivas do seu estofado! ✨

🛋️ Atendemos em domicílio com horário marcado!
📲 Clique no link da bio ou chame no WhatsApp para garantir sua vaga na agenda!

#expresscleanmcz #higienizacaodeestofados #lavagemaseco #maceio #antesedepois #rapidoelimpo #saudedafamilia #limpezadesofa`,
    },
    {
      title: 'Stories: "Antes & Depois Espetacular ✨"',
      subtitle: 'Perfeito para postar fotos divididas de antes e depois nos Stories',
      category: 'Antes & Depois',
      text: `Mais uma transformação surreal entregue pela @expresscleanmcz! 🛋️✨

Atendimento de hoje: ${upholsteryType}!
O cliente achava que precisaria trocar o tecido, mas nós removemos manchas antigas, odores e devolvemos o toque macio original.

Tempo médio de secagem: de 6 a 12 horas em ambiente arejado! 💨

Restam poucas vagas para essa semana. Responda esse story com "QUERO" para receber seu orçamento rápido! 👇🔥

#expresscleanmcz #antesedepois #maceio #estofadoslimpos`,
    },
    {
      title: 'Stories: "Agenda da Semana Aberta! 📅"',
      subtitle: 'Post de segunda-feira para lotar sua semana de atendimentos',
      category: 'Captação de Agenda',
      text: `Bom dia! A agenda da @expresscleanmcz para esta semana está oficialmente aberta! 🗓️✨

Garanta a higienização do seu:
🛋️ Sofá (Fixo, Retrátil, Canto)
🛏️ Colchão (Casal, Queen, King, Solteiro)
🪑 Cadeiras de Jantar & Poltronas
🚗 Bancos Automotivos

Elimine ácaros, fungos e odores desagradáveis antes do fim de semana.
📲 Mande um Direct ou chame no WhatsApp pelo link da nossa bio!

#expresscleanmcz #agendaaberta #maceio #higienizacaoalagoas`,
    },
    {
      title: 'Resposta Rápida no Direct: "Orçamento Rápido Express"',
      subtitle: 'Copie e cole quando um seguidor pedir preço no direct do Instagram',
      category: 'Direct / Vendas',
      text: `Olá! Que ótimo falar com você! Aqui é da @expresscleanmcz. 🌊🧼

Para te passar o valor exato e nossa melhor condição de hoje, me conte rapidinho:
1️⃣ Qual é o seu modelo de estofado? (Ex: Sofá 2 ou 3 lugares, retrátil, de canto, ou colchão?)
2️⃣ Tem fotos dele ou manchas específicas que você gostaria de eliminar?
3️⃣ Em qual bairro de Maceió seria o atendimento?

Nosso serviço inclui:
✅ Extração profunda com produtos bactericidas e fungicidas
✅ Eliminação de odores e manchas
✅ Secagem rápida (6 a 12h)
✅ Atendimento no conforto da sua casa!

Fico no aguardo para agendarmos o seu horário! 🛋️✨`,
    },
  ];

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Real Instagram Link */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden border border-slate-800">
        {/* Subtle decorative circles */}
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-cyan-500/10 rounded-full blur-2xl" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-rose-500/10 rounded-full blur-2xl" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center text-white shadow-md">
                <Instagram className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs uppercase font-extrabold tracking-widest text-cyan-400">
                  Identidade Visual Oficial
                </span>
                <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
                  @expresscleanmcz
                </h2>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              Estúdio de divulgação e marketing conectado com o perfil do Instagram da sua empresa. Copie legendas prontas de <strong>Antes e Depois</strong> e o clássico <strong>"A cor da água que saiu"</strong> para atrair clientes todos os dias.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <a
              href="https://www.instagram.com/expresscleanmcz/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 hover:opacity-95 text-white font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-rose-500/25 transition transform active:scale-95"
            >
              <Instagram className="w-4 h-4" />
              Ver Perfil no Instagram
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Quick Highlights Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-700/60 text-xs">
          <div className="flex items-center gap-2">
            <Droplets className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="text-slate-300">Rápido e Limpo</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-slate-300">Anti-ácaros & Bactérias</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="text-slate-300">Lavagem Profunda</span>
          </div>
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-rose-400 shrink-0" />
            <span className="text-slate-300">Atendimento a Domicílio</span>
          </div>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-cyan-600" />
              Legendas e Copies Prontas para Postar
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Modelos com a linguagem exata e hashtags oficiais da ExpressCleanmcz
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {templates.map((tpl, idx) => {
            const isCopied = copiedIndex === idx;

            return (
              <div
                key={idx}
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-cyan-300 transition"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-cyan-50 text-cyan-800 border border-cyan-200">
                      {tpl.category}
                    </span>
                    <button
                      onClick={() => handleCopy(tpl.text, idx)}
                      className="px-3 py-1.5 text-xs font-bold rounded-xl flex items-center gap-1.5 transition bg-slate-100 hover:bg-slate-200 text-slate-700"
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700">Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-cyan-600" />
                          <span>Copiar Texto</span>
                        </>
                      )}
                    </button>
                  </div>

                  <h4 className="font-extrabold text-sm text-slate-900">
                    {tpl.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                    {tpl.subtitle}
                  </p>

                  <div className="mt-3 bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-xs text-slate-700 font-mono whitespace-pre-line leading-relaxed max-h-56 overflow-y-auto">
                    {tpl.text}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Pronto para Feed, Reels ou Stories</span>
                  <button
                    onClick={() => handleCopy(tpl.text, idx)}
                    className="text-cyan-700 font-bold hover:underline"
                  >
                    Copiar e colar no Instagram →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Instagram Story Tip Card */}
      <div className="bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-200 p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-600 text-white flex items-center justify-center shrink-0">
            <Droplets className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-extrabold text-sm text-cyan-950">
              Dica de Ouro da ExpressCleanmcz para o Instagram
            </h4>
            <p className="text-xs text-cyan-800 font-medium">
              Sempre tire uma foto ou grave um vídeo curto da <strong>água suja extraída no balde transparente</strong> ao final do atendimento. Esse formato é o que gera mais compartilhamentos e novos clientes em Maceió!
            </p>
          </div>
        </div>

        <a
          href="https://www.instagram.com/expresscleanmcz/"
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 bg-white hover:bg-slate-50 text-cyan-800 font-bold text-xs rounded-xl border border-cyan-300 shadow-2xs whitespace-nowrap"
        >
          Acessar @expresscleanmcz
        </a>
      </div>
    </div>
  );
};
