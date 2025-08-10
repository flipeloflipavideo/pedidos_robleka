import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import OrderForm from "@/components/orders/order-form";
import OrderTable from "@/components/orders/order-table";
import { api } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";

export default function Orders() {
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    paymentMethod: "all",
    startDate: "",
    endDate: "",
  });

  const { data: orders = [], isLoading, refetch } = useQuery({
    queryKey: ["/api/orders", filters],
    queryFn: () => {
      const queryFilters: any = {};
      if (filters.search) queryFilters.search = filters.search;
      if (filters.status !== "all") queryFilters.status = filters.status;
      if (filters.paymentMethod !== "all") queryFilters.paymentMethod = filters.paymentMethod;
      if (filters.startDate) queryFilters.startDate = filters.startDate;
      if (filters.endDate) queryFilters.endDate = filters.endDate;
      
      return api.orders.getAll(queryFilters);
    },
  });

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Gestión de Pedidos</h2>
          <p className="text-slate-600">Administra todos tus pedidos</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-primary-500 hover:bg-primary-600 mt-4 lg:mt-0">
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Pedido
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <OrderForm onSuccess={() => refetch()} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search" className="text-sm font-medium text-slate-700 mb-2">Buscar</Label>
              <div className="relative">
                <Input
                  id="search"
                  type="text"
                  placeholder="Cliente, producto..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="pl-10"
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">
                  🔍
                </div>
              </div>
            </div>
            
            <div>
              <Label className="text-sm font-medium text-slate-700 mb-2">Estado</Label>
              <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los estados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="pending">Pendiente</SelectItem>
                  <SelectItem value="in_progress">En proceso</SelectItem>
                  <SelectItem value="completed">Completado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="text-sm font-medium text-slate-700 mb-2">Método de Pago</Label>
              <Select value={filters.paymentMethod} onValueChange={(value) => setFilters({ ...filters, paymentMethod: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="delivery">Contra entrega</SelectItem>
                  <SelectItem value="advance">Anticipo</SelectItem>
                  <SelectItem value="full">Pago completo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="date" className="text-sm font-medium text-slate-700 mb-2">Fecha</Label>
              <Input
                id="date"
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <OrderTable orders={orders} isLoading={isLoading} onUpdate={() => refetch()} />
    </div>
  );
}
