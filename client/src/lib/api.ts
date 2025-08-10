import { apiRequest } from "./queryClient";
import type { OrderWithCustomer, Customer, InsertOrder } from "@shared/schema";

export const api = {
  // Orders
  orders: {
    getAll: (filters?: {
      status?: string;
      paymentMethod?: string;
      search?: string;
      startDate?: string;
      endDate?: string;
    }) => {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value) params.append(key, value);
        });
      }
      return fetch(`/api/orders?${params.toString()}`).then(res => res.json()) as Promise<OrderWithCustomer[]>;
    },

    getById: (id: string) => 
      fetch(`/api/orders/${id}`).then(res => res.json()) as Promise<OrderWithCustomer>,

    create: (order: InsertOrder) =>
      apiRequest("POST", "/api/orders", order).then(res => res.json()) as Promise<OrderWithCustomer>,

    update: (id: string, data: Partial<OrderWithCustomer>) =>
      apiRequest("PATCH", `/api/orders/${id}`, data).then(res => res.json()) as Promise<OrderWithCustomer>,

    delete: (id: string) =>
      apiRequest("DELETE", `/api/orders/${id}`),

    uploadImage: (id: string, file: File) => {
      const formData = new FormData();
      formData.append('image', file);
      return fetch(`/api/orders/${id}/image`, {
        method: 'POST',
        body: formData,
      }).then(res => res.json());
    },
  },

  // Customers
  customers: {
    getAll: () =>
      fetch("/api/customers").then(res => res.json()) as Promise<Customer[]>,
  },

  // Dashboard
  dashboard: {
    getStats: () =>
      fetch("/api/dashboard/stats").then(res => res.json()) as Promise<{
        activeOrders: number;
        completedOrders: number;
        monthlyRevenue: number;
        activeCustomers: number;
      }>,

    getRevenue: () =>
      fetch("/api/dashboard/revenue").then(res => res.json()) as Promise<{ month: string; revenue: number }[]>,

    getStatusDistribution: () =>
      fetch("/api/dashboard/status-distribution").then(res => res.json()) as Promise<{ status: string; count: number }[]>,
  },
};
