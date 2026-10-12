/**
 * ExpressCleanmcz - Gerenciador de Pedidos, CRM & Financeiro
 * Limpeza e Higienização de Estofados em Maceió - AL
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { OrdersView } from './components/OrdersView';
import { ClientsView } from './components/ClientsView';
import { FinancialView } from './components/FinancialView';
import { MapView } from './components/MapView';
import { DashboardView } from './components/DashboardView';
import { OrderModal } from './components/OrderModal';
import { ClientModal } from './components/ClientModal';
import { ExpenseModal } from './components/ExpenseModal';
import { ReceiptModal } from './components/ReceiptModal';
import { Client, Expense, Order, OrderStatus } from './types';
import { 
  exportAllDataAsJSON, 
  getStoredClients, 
  getStoredExpenses, 
  getStoredOrders, 
  saveStoredClients, 
  saveStoredExpenses, 
  saveStoredOrders 
} from './utils/storage';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'orders' | 'clients' | 'financial' | 'map' | 'dashboard'>('orders');

  // Core Data
  const [clients, setClients] = useState<Client[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  // Modals state
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);

  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [receiptOrder, setReceiptOrder] = useState<Order | null>(null);

  const [selectedOrderForMap, setSelectedOrderForMap] = useState<Order | null>(null);

  // Load initial data
  useEffect(() => {
    const loadedClients = getStoredClients();
    const loadedOrders = getStoredOrders();
    const loadedExpenses = getStoredExpenses();

    setClients(loadedClients);
    setOrders(loadedOrders);
    setExpenses(loadedExpenses);
  }, []);

  // Save changes
  const updateClients = (newClients: Client[]) => {
    setClients(newClients);
    saveStoredClients(newClients);
  };

  const updateOrders = (newOrders: Order[]) => {
    setOrders(newOrders);
    saveStoredOrders(newOrders);
  };

  const updateExpenses = (newExpenses: Expense[]) => {
    setExpenses(newExpenses);
    saveStoredExpenses(newExpenses);
  };

  // Order Handlers
  const handleSaveOrder = (orderData: Omit<Order, 'id' | 'createdAt'>, existingId?: string) => {
    if (existingId) {
      const updated = orders.map((o) => (o.id === existingId ? { ...o, ...orderData } : o));
      updateOrders(updated);
    } else {
      const newOrder: Order = {
        ...orderData,
        id: 'ord-' + Date.now(),
        createdAt: new Date().toISOString(),
      };
      updateOrders([newOrder, ...orders]);

      // If client didn't exist in CRM, optionally auto-add
      const clientExists = clients.some((c) => c.phone === orderData.clientPhone || c.id === orderData.clientId);
      if (!clientExists && orderData.clientName && orderData.clientPhone) {
        const autoClient: Client = {
          id: 'cli-' + Date.now(),
          name: orderData.clientName,
          phone: orderData.clientPhone,
          neighborhood: orderData.clientNeighborhood,
          address: orderData.clientAddress,
          createdAt: new Date().toISOString().split('T')[0],
        };
        updateClients([autoClient, ...clients]);
      }
    }
  };

  const handleDeleteOrder = (orderId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este agendamento?')) {
      const updated = orders.filter((o) => o.id !== orderId);
      updateOrders(updated);
    }
  };

  const handleUpdateStatus = (orderId: string, status: OrderStatus) => {
    const updated = orders.map((o) => {
      if (o.id === orderId) {
        const isNowCompleted = status === 'concluido';
        return {
          ...o,
          status,
          paymentStatus: isNowCompleted ? 'pago' : o.paymentStatus,
          completedAt: isNowCompleted ? new Date().toISOString().split('T')[0] : o.completedAt,
        };
      }
      return o;
    });
    updateOrders(updated);
  };

  // Client Handlers
  const handleSaveClient = (clientData: Omit<Client, 'id' | 'createdAt'>, existingId?: string) => {
    if (existingId) {
      const updated = clients.map((c) => (c.id === existingId ? { ...c, ...clientData } : c));
      updateClients(updated);
    } else {
      const newClient: Client = {
        ...clientData,
        id: 'cli-' + Date.now(),
        createdAt: new Date().toISOString().split('T')[0],
      };
      updateClients([newClient, ...clients]);
    }
  };

  const handleDeleteClient = (clientId: string) => {
    if (window.confirm('Excluir este cliente do CRM? Os agendamentos associados serão mantidos.')) {
      const updated = clients.filter((c) => c.id !== clientId);
      updateClients(updated);
    }
  };

  const handleScheduleForClient = (client: Client) => {
    // Open order modal with this client pre-populated
    setEditingOrder(null);
    setIsOrderModalOpen(true);
  };

  // Expense Handlers
  const handleSaveExpense = (expenseData: Omit<Expense, 'id' | 'createdAt'>, existingId?: string) => {
    if (existingId) {
      const updated = expenses.map((e) => (e.id === existingId ? { ...e, ...expenseData } : e));
      updateExpenses(updated);
    } else {
      const newExpense: Expense = {
        ...expenseData,
        id: 'exp-' + Date.now(),
        createdAt: new Date().toISOString(),
      };
      updateExpenses([newExpense, ...expenses]);
    }
  };

  const handleDeleteExpense = (expenseId: string) => {
    if (window.confirm('Excluir este lançamento de despesa?')) {
      const updated = expenses.filter((e) => e.id !== expenseId);
      updateExpenses(updated);
    }
  };

  // Actions
  const handleExportBackup = () => {
    exportAllDataAsJSON(clients, orders, expenses);
  };

  const handleOpenMapWithOrder = (order: Order) => {
    setSelectedOrderForMap(order);
    setCurrentTab('map');
  };

  const handleOpenReceipt = (order: Order) => {
    setReceiptOrder(order);
    setIsReceiptModalOpen(true);
  };

  // Compute stats for Navbar
  const currentMonth = new Date().toISOString().slice(0, 7);
  const todayStr = new Date().toISOString().split('T')[0];

  const monthlyRevenue = orders
    .filter((o) => o.scheduledDate.startsWith(currentMonth) && (o.paymentStatus === 'pago' || o.status === 'concluido'))
    .reduce((acc, curr) => acc + curr.finalAmount, 0);

  const monthlyExpenses = expenses
    .filter((e) => e.date.startsWith(currentMonth))
    .reduce((acc, curr) => acc + curr.amount, 0);

  const monthlyProfit = monthlyRevenue - monthlyExpenses;

  const todayOrdersCount = orders.filter((o) => o.scheduledDate === todayStr && o.status !== 'cancelado').length;

  const pendingReceivables = orders
    .filter((o) => o.status !== 'cancelado' && o.paymentStatus === 'pendente')
    .reduce((acc, curr) => acc + curr.finalAmount, 0);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onNewOrder={() => {
          setEditingOrder(null);
          setIsOrderModalOpen(true);
        }}
        onNewExpense={() => {
          setEditingExpense(null);
          setIsExpenseModalOpen(true);
        }}
        onExportBackup={handleExportBackup}
        monthlyProfit={monthlyProfit}
        todayOrdersCount={todayOrdersCount}
        pendingReceivables={pendingReceivables}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {currentTab === 'orders' && (
          <OrdersView
            orders={orders}
            onNewOrder={() => {
              setEditingOrder(null);
              setIsOrderModalOpen(true);
            }}
            onEditOrder={(order) => {
              setEditingOrder(order);
              setIsOrderModalOpen(true);
            }}
            onDeleteOrder={handleDeleteOrder}
            onUpdateStatus={handleUpdateStatus}
            onOpenReceipt={handleOpenReceipt}
            onOpenMapWithOrder={handleOpenMapWithOrder}
          />
        )}

        {currentTab === 'clients' && (
          <ClientsView
            clients={clients}
            orders={orders}
            onNewClient={() => {
              setEditingClient(null);
              setIsClientModalOpen(true);
            }}
            onEditClient={(client) => {
              setEditingClient(client);
              setIsClientModalOpen(true);
            }}
            onDeleteClient={handleDeleteClient}
            onScheduleForClient={handleScheduleForClient}
          />
        )}

        {currentTab === 'financial' && (
          <FinancialView
            orders={orders}
            expenses={expenses}
            onNewExpense={() => {
              setEditingExpense(null);
              setIsExpenseModalOpen(true);
            }}
            onEditExpense={(expense) => {
              setEditingExpense(expense);
              setIsExpenseModalOpen(true);
            }}
            onDeleteExpense={handleDeleteExpense}
          />
        )}

        {currentTab === 'map' && (
          <MapView
            orders={orders}
            selectedOrderForMap={selectedOrderForMap}
          />
        )}

        {currentTab === 'dashboard' && (
          <DashboardView
            orders={orders}
            expenses={expenses}
          />
        )}
      </main>

      {/* Modals */}
      <OrderModal
        isOpen={isOrderModalOpen}
        onClose={() => {
          setIsOrderModalOpen(false);
          setEditingOrder(null);
        }}
        onSave={handleSaveOrder}
        clients={clients}
        editingOrder={editingOrder}
        onOpenNewClientModal={() => {
          setIsOrderModalOpen(false);
          setEditingClient(null);
          setIsClientModalOpen(true);
        }}
      />

      <ClientModal
        isOpen={isClientModalOpen}
        onClose={() => {
          setIsClientModalOpen(false);
          setEditingClient(null);
        }}
        onSave={handleSaveClient}
        editingClient={editingClient}
      />

      <ExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => {
          setIsExpenseModalOpen(false);
          setEditingExpense(null);
        }}
        onSave={handleSaveExpense}
        editingExpense={editingExpense}
      />

      <ReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => {
          setIsReceiptModalOpen(false);
          setReceiptOrder(null);
        }}
        order={receiptOrder}
      />

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500 font-medium">
        <p>
          ExpressCleanmcz • Gestão Especializada em Limpeza de Estofados
        </p>
      </footer>
    </div>
  );
}
