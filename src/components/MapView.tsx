import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { 
  MapPin, 
  Navigation, 
  Clock, 
  ExternalLink
} from 'lucide-react';
import { Order } from '../types';
import { formatCurrencyBRL, formatDateBR } from '../utils/storage';
import { generateGoogleMapsRouteUrl, generateWazeUrl, MACEIO_CENTER } from '../utils/geoMaceio';

interface MapViewProps {
  orders: Order[];
  selectedOrderForMap?: Order | null;
}

export const MapView: React.FC<MapViewProps> = ({ orders, selectedOrderForMap }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const polylineLayerRef = useRef<L.Polyline | null>(null);

  const [dateFilter, setDateFilter] = useState<'today' | 'tomorrow' | 'all'>('today');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(selectedOrderForMap || null);

  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const routeOrders = orders.filter((o) => {
    if (o.status === 'cancelado') return false;
    if (dateFilter === 'today') return o.scheduledDate === todayStr;
    if (dateFilter === 'tomorrow') return o.scheduledDate === tomorrowStr;
    return true;
  });

  const orderedStops = [...routeOrders].sort((a, b) => {
    if (a.scheduledDate === b.scheduledDate) {
      return a.scheduledTime.localeCompare(b.scheduledTime);
    }
    return a.scheduledDate.localeCompare(b.scheduledDate);
  });

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [MACEIO_CENTER.lat, MACEIO_CENTER.lng],
        zoom: 13,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors | ExpressCleanmcz',
        maxZoom: 19,
      }).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }
  }, []);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    if (polylineLayerRef.current) {
      polylineLayerRef.current.remove();
      polylineLayerRef.current = null;
    }

    const latLngs: [number, number][] = [];

    orderedStops.forEach((order, index) => {
      const lat = order.lat || MACEIO_CENTER.lat;
      const lng = order.lng || MACEIO_CENTER.lng;
      latLngs.push([lat, lng]);

      let pinColor = '#0891b2'; // cyan-600
      if (order.status === 'em_andamento') pinColor = '#d97706'; // amber-600
      if (order.status === 'concluido') pinColor = '#059669'; // emerald-600

      const iconHtml = `
        <div style="
          background-color: ${pinColor};
          color: #ffffff;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 13px;
          border: 3px solid #ffffff;
          box-shadow: 0 4px 10px rgba(0,0,0,0.25);
          cursor: pointer;
        ">
          ${index + 1}
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-pin-icon',
        html: iconHtml,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([lat, lng], { icon: customIcon });

      const popupContent = `
        <div style="font-family: inherit; font-size: 12px; color: #0f172a; min-width: 190px;">
          <div style="font-weight: 800; font-size: 14px; color: #0284c7; margin-bottom: 2px;">
            ${index + 1}ª Parada: ${order.clientName}
          </div>
          <div style="font-weight: 600; color: #475569; margin-bottom: 6px;">
            ⏰ ${order.scheduledTime} - ${order.clientNeighborhood}
          </div>
          <div style="font-size: 11px; margin-bottom: 6px; color: #334155;">
            📍 ${order.clientAddress}
          </div>
          <div style="font-weight: 800; color: #059669; font-size: 13px; margin-bottom: 8px;">
            Total: ${formatCurrencyBRL(order.finalAmount)}
          </div>
          <div style="display: flex; gap: 6px;">
            <a href="${generateWazeUrl(order.clientAddress + ', ' + order.clientNeighborhood)}" target="_blank" style="
              background: #0284c7; color: white; padding: 4px 8px; border-radius: 6px; text-decoration: none; font-weight: 700; font-size: 11px;
            ">Waze</a>
            <a href="https://wa.me/55${order.clientPhone.replace(/\D/g, '')}" target="_blank" style="
              background: #16a34a; color: white; padding: 4px 8px; border-radius: 6px; text-decoration: none; font-weight: 700; font-size: 11px;
            ">WhatsApp</a>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);
      marker.on('click', () => {
        setSelectedOrder(order);
      });

      markersLayerRef.current?.addLayer(marker);
    });

    if (latLngs.length > 1) {
      const polyline = L.polyline(latLngs, {
        color: '#0284c7',
        weight: 4,
        opacity: 0.85,
        dashArray: '8, 8',
      }).addTo(map);
      polylineLayerRef.current = polyline;

      map.fitBounds(polyline.getBounds(), { padding: [50, 50], maxZoom: 14 });
    } else if (latLngs.length === 1) {
      map.setView(latLngs[0], 14);
    }
  }, [orderedStops]);

  useEffect(() => {
    if (selectedOrder && mapInstanceRef.current) {
      const lat = selectedOrder.lat || MACEIO_CENTER.lat;
      const lng = selectedOrder.lng || MACEIO_CENTER.lng;
      mapInstanceRef.current.setView([lat, lng], 15);
    }
  }, [selectedOrder]);

  const handleOpenGoogleMapsRoute = () => {
    if (orderedStops.length === 0) return;
    const addresses = orderedStops.map((s) => `${s.clientAddress}, ${s.clientNeighborhood}`);
    const url = generateGoogleMapsRouteUrl(addresses);
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <Navigation className="w-5 h-5 text-cyan-600" />
            Mapa Interativo & Traçador de Rotas
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Planejamento geográfico para economizar combustível e otimizar tempo entre atendimentos
          </p>
        </div>

        {/* Date Filter & Google Maps Button */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setDateFilter('today')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                dateFilter === 'today'
                  ? 'bg-white text-cyan-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Rota de Hoje
            </button>
            <button
              onClick={() => setDateFilter('tomorrow')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                dateFilter === 'tomorrow'
                  ? 'bg-white text-cyan-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Rota de Amanhã
            </button>
            <button
              onClick={() => setDateFilter('all')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                dateFilter === 'all'
                  ? 'bg-white text-cyan-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Todos os Locais
            </button>
          </div>

          <button
            onClick={handleOpenGoogleMapsRoute}
            disabled={orderedStops.length === 0}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 disabled:opacity-50 text-white font-bold text-xs sm:text-sm rounded-xl flex items-center gap-2 shadow-md shadow-cyan-600/20 transition"
            title="Abrir rota completa de GPS no Google Maps"
          >
            <Navigation className="w-4 h-4" />
            Traçar Rota no Google Maps ({orderedStops.length} Paradas)
          </button>
        </div>
      </div>

      {/* Main Grid: Itinerary Stops & Map */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Daily Itinerary List */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-sm">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <span className="text-xs font-extrabold uppercase tracking-wider text-cyan-800 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-cyan-600" /> Itinerário Ordenado do Dia
              </span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                {orderedStops.length} paradas
              </span>
            </div>

            {orderedStops.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                Nenhum agendamento com rota marcado para esta data.
              </div>
            ) : (
              <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                {orderedStops.map((stop, idx) => {
                  const isSelected = selectedOrder?.id === stop.id;

                  return (
                    <div
                      key={stop.id}
                      onClick={() => setSelectedOrder(stop)}
                      className={`p-3.5 rounded-xl border transition cursor-pointer ${
                        isSelected
                          ? 'bg-cyan-50/70 border-cyan-400 shadow-xs ring-1 ring-cyan-200'
                          : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-cyan-600 text-white text-xs font-black flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <div>
                            <h4 className="font-extrabold text-xs text-slate-900">
                              {stop.clientName}
                            </h4>
                            <span className="text-[11px] text-cyan-700 font-bold">
                              {stop.clientNeighborhood}
                            </span>
                          </div>
                        </div>

                        <span className="text-xs font-bold text-slate-700 font-mono">
                          {stop.scheduledTime}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-600 font-medium mt-1.5 line-clamp-1">
                        📍 {stop.clientAddress}
                      </p>

                      <div className="flex items-center justify-between pt-2 mt-2 border-t border-slate-200/80 text-[11px]">
                        <span className="text-emerald-700 font-bold">
                          {formatCurrencyBRL(stop.finalAmount)}
                        </span>

                        <div className="flex items-center gap-2">
                          <a
                            href={generateWazeUrl(stop.clientAddress + ', ' + stop.clientNeighborhood)}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-cyan-700 hover:text-cyan-800 flex items-center gap-0.5 font-bold"
                          >
                            Waze <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                          <span className="text-slate-300">•</span>
                          <a
                            href={`https://wa.me/55${stop.clientPhone.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-emerald-700 hover:text-emerald-800 font-bold"
                          >
                            WhatsApp
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Tip Card */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-1">
            <span className="font-bold text-slate-800 flex items-center gap-1">
              💡 Dica ExpressCleanmcz:
            </span>
            <p>
              Agrupe clientes de bairros próximos no mesmo turno para reduzir o custo com combustível e o tempo de trânsito.
            </p>
          </div>
        </div>

        {/* Right Side: Map Canvas */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm relative min-h-[500px]">
          <div
            ref={mapContainerRef}
            className="w-full h-full min-h-[500px] z-10"
            style={{ background: '#f8fafc' }}
          />

          {/* Map Overlay Badge */}
          <div className="absolute top-3 right-3 z-20 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 flex items-center gap-2 shadow-xs">
            <MapPin className="w-3.5 h-3.5 text-cyan-600" />
            <span>OpenStreetMap</span>
          </div>
        </div>
      </div>
    </div>
  );
};
