export type OrderStatus = 'agendado' | 'em_andamento' | 'concluido' | 'cancelado';

export type PaymentMethod = 'pix' | 'dinheiro' | 'cartao_credito' | 'cartao_debito' | 'pendente';

export type PaymentStatus = 'pago' | 'pendente' | 'parcial';

export interface ServiceItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  neighborhood: string;
  address: string;
  reference?: string;
  notes?: string;
  createdAt: string;
  totalSpent?: number;
  ordersCount?: number;
}

export interface Order {
  id: string;
  clientId: string;
  clientName: string;
  clientPhone: string;
  clientAddress: string;
  clientNeighborhood: string;
  lat?: number;
  lng?: number;
  scheduledDate: string; // YYYY-MM-DD
  scheduledTime: string; // HH:mm
  services: ServiceItem[];
  totalAmount: number;
  discount: number;
  travelFee: number;
  finalAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  estimatedDurationMinutes: number;
  upholsteryDetails?: string; // ex: "Sofá 3 lugares linho bege com manchas de café"
  beforePhotoUrl?: string;
  afterPhotoUrl?: string;
  notes?: string;
  createdAt: string;
  completedAt?: string;
}

export type ExpenseCategory = 
  | 'produtos_quimicos' 
  | 'combustivel' 
  | 'manutencao' 
  | 'marketing' 
  | 'alimentacao' 
  | 'equipamentos' 
  | 'outros';

export interface Expense {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  category: ExpenseCategory;
  amount: number;
  paymentMethod: PaymentMethod;
  supplier?: string;
  notes?: string;
  createdAt: string;
}

export interface NeighborhoodLocation {
  name: string;
  lat: number;
  lng: number;
}
