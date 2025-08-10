import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import StatsCards from "@/components/dashboard/stats-cards";
import RevenueChart from "@/components/dashboard/revenue-chart";
import StatusChart from "@/components/dashboard/status-chart";
import OrderForm from "@/components/orders/order-form";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";

export default function Dashboard() {
  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ["/api/orders"],
    queryFn: () => api.orders.getAll(),
  });

  const recentOrders = orders.slice(0, 5);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in_progress":
        return "bg-yellow-100 text-yellow-800";
      case "pending":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Completado";
      case "in_progress":
        return "En proceso";
      case "pending":
        return "Pendiente";
      default:
        return status;
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Dashboard</h2>
          <p className="text-slate-600">Resumen general de tu negocio</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-primary-500 hover:bg-primary-600 mt-4 lg:mt-0">
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Pedido
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <OrderForm />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <StatsCards />

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <RevenueChart />
        <StatusChart />
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-slate-800">Pedidos Recientes</CardTitle>
            <Link href="/orders" className="text-primary-500 hover:text-primary-600 text-sm font-medium">
              Ver todos
            </Link>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {ordersLoading ? (
            <div className="p-6">
              <div className="animate-pulse space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-16 bg-slate-200 rounded"></div>
                ))}
              </div>
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="p-6 text-center text-slate-500">
              No hay pedidos recientes
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="text-left py-3 px-6 text-xs font-medium text-slate-500 uppercase tracking-wider">Cliente</th>
                    <th className="text-left py-3 px-6 text-xs font-medium text-slate-500 uppercase tracking-wider">Producto</th>
                    <th className="text-left py-3 px-6 text-xs font-medium text-slate-500 uppercase tracking-wider">Estado</th>
                    <th className="text-left py-3 px-6 text-xs font-medium text-slate-500 uppercase tracking-wider">Precio</th>
                    <th className="text-left py-3 px-6 text-xs font-medium text-slate-500 uppercase tracking-wider">Fecha</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {recentOrders.map((order) => (
                    <tr key={order.id}>
                      <td className="py-4 px-6">
                        <div>
                          <p className="font-medium text-slate-800">{order.customer.name}</p>
                          <p className="text-sm text-slate-600">{order.customer.phone}</p>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <p className="text-slate-800">{order.product}</p>
                        {order.theme && <p className="text-sm text-slate-600">{order.theme}</p>}
                      </td>
                      <td className="py-4 px-6">
                        <Badge className={getStatusColor(order.status)}>
                          {getStatusText(order.status)}
                        </Badge>
                      </td>
                      <td className="py-4 px-6 font-medium text-slate-800">€{order.price}</td>
                      <td className="py-4 px-6 text-slate-600">
                        {new Date(order.createdAt!).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
