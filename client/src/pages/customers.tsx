import { useQuery } from "@tanstack/react-query";
import { Users, Phone, Mail, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";

export default function Customers() {
  const { data: customers = [], isLoading } = useQuery({
    queryKey: ["/api/customers"],
    queryFn: () => api.customers.getAll(),
  });

  const { data: orders = [] } = useQuery({
    queryKey: ["/api/orders"],
    queryFn: () => api.orders.getAll(),
  });

  const getCustomerStats = (customerId: string) => {
    const customerOrders = orders.filter(order => order.customer.id === customerId);
    const totalOrders = customerOrders.length;
    const totalSpent = customerOrders.reduce((sum, order) => sum + parseFloat(order.price), 0);
    const lastOrder = customerOrders.length > 0 
      ? new Date(Math.max(...customerOrders.map(order => new Date(order.createdAt!).getTime())))
      : null;
    
    return { totalOrders, totalSpent, lastOrder };
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Clientes</h2>
        <p className="text-slate-600">Gestión de clientes y su historial de pedidos</p>
      </div>

      {/* Customer Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Total Clientes</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">{customers.length}</p>
              </div>
              <div className="bg-primary-100 p-3 rounded-lg">
                <Users className="text-primary-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Clientes Activos</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">
                  {customers.filter(customer => {
                    const stats = getCustomerStats(customer.id);
                    return stats.lastOrder && 
                           (new Date().getTime() - stats.lastOrder.getTime()) < (90 * 24 * 60 * 60 * 1000);
                  }).length}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <Users className="text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Valor Promedio</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">
                  €{customers.length > 0 
                    ? (customers.reduce((sum, customer) => {
                        const stats = getCustomerStats(customer.id);
                        return sum + stats.totalSpent;
                      }, 0) / customers.length).toFixed(2)
                    : "0.00"}
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <Users className="text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Customers List */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Clientes</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6">
              <div className="animate-pulse space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-20 bg-slate-200 rounded"></div>
                ))}
              </div>
            </div>
          ) : customers.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              No se encontraron clientes
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="text-left py-3 px-6 text-xs font-medium text-slate-500 uppercase tracking-wider">Cliente</th>
                    <th className="text-left py-3 px-6 text-xs font-medium text-slate-500 uppercase tracking-wider">Contacto</th>
                    <th className="text-left py-3 px-6 text-xs font-medium text-slate-500 uppercase tracking-wider">Pedidos</th>
                    <th className="text-left py-3 px-6 text-xs font-medium text-slate-500 uppercase tracking-wider">Total Gastado</th>
                    <th className="text-left py-3 px-6 text-xs font-medium text-slate-500 uppercase tracking-wider">Último Pedido</th>
                    <th className="text-left py-3 px-6 text-xs font-medium text-slate-500 uppercase tracking-wider">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {customers.map((customer) => {
                    const stats = getCustomerStats(customer.id);
                    const isActive = stats.lastOrder && 
                      (new Date().getTime() - stats.lastOrder.getTime()) < (90 * 24 * 60 * 60 * 1000);
                    
                    return (
                      <tr key={customer.id}>
                        <td className="py-4 px-6">
                          <div>
                            <p className="font-medium text-slate-800">{customer.name}</p>
                            {customer.address && (
                              <div className="flex items-center text-sm text-slate-600 mt-1">
                                <MapPin className="w-3 h-3 mr-1" />
                                <span className="truncate max-w-xs">{customer.address}</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="space-y-1">
                            <div className="flex items-center text-sm text-slate-600">
                              <Phone className="w-3 h-3 mr-1" />
                              <span>{customer.phone}</span>
                            </div>
                            {customer.email && (
                              <div className="flex items-center text-sm text-slate-600">
                                <Mail className="w-3 h-3 mr-1" />
                                <span>{customer.email}</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6 font-medium text-slate-800">{stats.totalOrders}</td>
                        <td className="py-4 px-6 font-medium text-slate-800">€{stats.totalSpent.toFixed(2)}</td>
                        <td className="py-4 px-6 text-slate-600">
                          {stats.lastOrder 
                            ? stats.lastOrder.toLocaleDateString()
                            : "Nunca"}
                        </td>
                        <td className="py-4 px-6">
                          <Badge className={isActive 
                            ? "bg-green-100 text-green-800" 
                            : "bg-gray-100 text-gray-800"}>
                            {isActive ? "Activo" : "Inactivo"}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}