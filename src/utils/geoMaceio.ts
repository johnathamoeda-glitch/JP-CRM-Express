import { NeighborhoodLocation } from '../types';

// Coordenadas aproximadas centrais dos principais bairros de Maceió e região metropolitana
export const MACEIO_NEIGHBORHOODS: Record<string, NeighborhoodLocation> = {
  'Ponta Verde': { name: 'Ponta Verde', lat: -9.6603, lng: -35.7042 },
  'Jatiúca': { name: 'Jatiúca', lat: -9.6481, lng: -35.7029 },
  'Pajuçara': { name: 'Pajuçara', lat: -9.6705, lng: -35.7186 },
  'Mangabeiras': { name: 'Mangabeiras', lat: -9.6372, lng: -35.7061 },
  'Cruz das Almas': { name: 'Cruz das Almas', lat: -9.6268, lng: -35.7044 },
  'Farol': { name: 'Farol', lat: -9.6542, lng: -35.7289 },
  'Gruta de Lourdes': { name: 'Gruta de Lourdes', lat: -9.6214, lng: -35.7381 },
  'Serraria': { name: 'Serraria', lat: -9.5992, lng: -35.7335 },
  'Antares': { name: 'Antares', lat: -9.5823, lng: -35.7482 },
  'Barro Duro': { name: 'Barro Duro', lat: -9.6085, lng: -35.7289 },
  'Pinheiro': { name: 'Pinheiro', lat: -9.6385, lng: -35.7369 },
  'Pitanguinha': { name: 'Pitanguinha', lat: -9.6453, lng: -35.7331 },
  'Poço': { name: 'Poço', lat: -9.6611, lng: -35.7225 },
  'Jaraguá': { name: 'Jaraguá', lat: -9.6749, lng: -35.7288 },
  'Centro': { name: 'Centro', lat: -9.6658, lng: -35.7353 },
  'Trapiche da Barra': { name: 'Trapiche da Barra', lat: -9.6841, lng: -35.7554 },
  'Prado': { name: 'Prado', lat: -9.6715, lng: -35.7431 },
  'Tabuleiro do Martins': { name: 'Tabuleiro do Martins', lat: -9.5781, lng: -35.7689 },
  'Benedito Bentes': { name: 'Benedito Bentes', lat: -9.5529, lng: -35.7381 },
  'Jacintinho': { name: 'Jacintinho', lat: -9.6391, lng: -35.7179 },
  'Feitosa': { name: 'Feitosa', lat: -9.6291, lng: -35.7251 },
  'Santa Amélia': { name: 'Santa Amélia', lat: -9.5954, lng: -35.7721 },
  'Petrópolis': { name: 'Petrópolis', lat: -9.6121, lng: -35.7612 },
  'Rio Novo': { name: 'Rio Novo', lat: -9.6225, lng: -35.7951 },
  'Guaxuma': { name: 'Guaxuma', lat: -9.5886, lng: -35.6881 },
  'Garça Torta': { name: 'Garça Torta', lat: -9.5694, lng: -35.6802 },
  'Riacho Doce': { name: 'Riacho Doce', lat: -9.5511, lng: -35.6698 },
  'Ipioca': { name: 'Ipioca', lat: -9.5167, lng: -35.6421 },
  'Marechal Deodoro': { name: 'Marechal Deodoro', lat: -9.7118, lng: -35.8972 },
  'Barra de São Miguel': { name: 'Barra de São Miguel', lat: -9.8319, lng: -35.9083 },
};

export const MACEIO_CENTER = { lat: -9.6498, lng: -35.7089 };

export function getCoordinatesForNeighborhood(neighborhood: string): { lat: number; lng: number } {
  if (!neighborhood) return MACEIO_CENTER;
  
  const clean = neighborhood.trim().toLowerCase();
  for (const [key, val] of Object.entries(MACEIO_NEIGHBORHOODS)) {
    if (clean.includes(key.toLowerCase()) || key.toLowerCase().includes(clean)) {
      // Add slight jitter so multiple pins in the same neighborhood don't overlap perfectly
      const jitterLat = (Math.random() - 0.5) * 0.003;
      const jitterLng = (Math.random() - 0.5) * 0.003;
      return { lat: val.lat + jitterLat, lng: val.lng + jitterLng };
    }
  }

  return { 
    lat: MACEIO_CENTER.lat + (Math.random() - 0.5) * 0.02, 
    lng: MACEIO_CENTER.lng + (Math.random() - 0.5) * 0.02 
  };
}

export function generateGoogleMapsRouteUrl(addresses: string[]): string {
  if (addresses.length === 0) return 'https://www.google.com/maps';
  if (addresses.length === 1) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addresses[0] + ', Maceió - AL')}`;
  }
  const origin = encodeURIComponent(addresses[0] + ', Maceió - AL');
  const destination = encodeURIComponent(addresses[addresses.length - 1] + ', Maceió - AL');
  
  const waypoints = addresses.slice(1, -1)
    .map(addr => encodeURIComponent(addr + ', Maceió - AL'))
    .join('|');

  if (waypoints) {
    return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&waypoints=${waypoints}&travelmode=driving`;
  }
  return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`;
}

export function generateWazeUrl(address: string): string {
  return `https://waze.com/ul?q=${encodeURIComponent(address + ', Maceió - AL')}&navigate=yes`;
}
