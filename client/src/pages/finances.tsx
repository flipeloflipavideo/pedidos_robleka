import { useQuery } from "@tanstack/react-query";
import { DollarSign, TrendingUp, CreditCard, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";

export default function Finances() {
  const { data: orders = [] } = useQuery({
    queryKey: ["/api/orders"],
    queryFn: () => api.orders.getAll(),
  });

  const { data: stats } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    queryFn: () => api.dashboard.getStats(),
  });

  // Calculate financial metrics
  const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.paidAmount || "0"), 0);
  const pendingPayments = orders
    .filter(order => parseFloat(order.paidAmount || "0") < parseFloat(order.price))
    .reduce((sum, order) => sum + (parseFloat(order.price) - parseFloat(order.paidAmount || "0")), 0);
  
  const completedOrders = orders.filter(order => order.status === "completed");
  const averageOrderValue = completedOrders.length > 0 
    ? completedOrders.reduce((sum, order) => sum + parseFloat(order.price), 0) / completedOrders.length 
    : 0;

  const paymentMethodStats = orders.reduce((acc, order) => {
    const method = order.paymentMethod;
    if (!acc[method]) {
      acc[method] = { count: 0, revenue: 0 };
    }
    acc[method].count++;
    acc[method].revenue += parseFloat(order.paidAmount || "0");
    return acc;
  }, {} as Record<string, { count: number; revenue: number }>);

  const getPaymentMethodName = (method: string) => {
    switch (method) {
      case "delivery": return "Contra entrega";
      case "advance": return "Anticipo";
      case "full": return "Pago completo";
      default: return method;
    }
  };

  const getPaymentStatus = (order: any) => {
    const paid = parseFloat(order.paidAmount || "0");
    const total = parseFloat(order.price);
    
    if (paid >= total) return { status: "Pagado", color: "bg-green-100 text-green-800" };
    if (paid > 0) return { status: "Parcial", color: "bg-yellow-100 text-yellow-800" };
    return { status: "Pendiente", color: "bg-red-100 text-red-800" };
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Finanzas</h2>
        <p className="text-slate-600">Resumen financiero y control de pagos</p>
      </div>

      {/* Financial Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Ingresos Totales</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">€{totalRevenue.toFixed(2)}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <DollarSign className="text-green-600" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              <span className="text-green-600">+8%</span>
              <span className="text-slate-600 ml-1">vs. mes anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Pagos Pendientes</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">€{pendingPayments.toFixed(2)}</p>
              </div>
              <div className="bg-red-100 p-3 rounded-lg">
                <Clock className="text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Valor Promedio</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">€{averageOrderValue.toFixed(2)}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <TrendingUp className="text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Ingresos del Mes</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">€{stats?.monthlyRevenue?.toFixed(2) || "0.00"}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <CreditCard className="text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Methods Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Métodos de Pago</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(paymentMethodStats).map(([method, data]) => (
                <div key={method} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-800">{getPaymentMethodName(method)}</p>
                    <p className="text-sm text-slate-600">{data.count} pedidos</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-800">€{data.revenue.toFixed(2)}</p>
                    <p className="text-sm text-slate-600">
                      {((data.revenue / totalRevenue) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Estado de Pagos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {orders.slice(0, 5).map(order => {
                const paymentStatus = getPaymentStatus(order);
                return (
                  <div key={order.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-medium text-slate-800">{order.customer.name}</p>
                      <p className="text-sm text-slate-600">{order.product}</p>
                    </div>
                    <div className="text-right">
                      <Badge className={paymentStatus.color}>
                        {paymentStatus.status}
                      </Badge>
                      <p className="text-sm text-slate-600 mt-1">
                        €{order.paidAmount} / €{order.price}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detalle de Pagos</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left py-3 px-6 text-xs font-medium text-slate-500 uppercase tracking-wider">Cliente</th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-slate-500 uppercase tracking-wider">Producto</th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-slate-500 uppercase tracking-wider">Método</th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-slate-500 uppercase tracking-wider">Total</th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-slate-500 uppercase tracking-wider">Pagado</th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-slate-500 uppercase tracking-wider">Estado</th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-slate-500 uppercase tracking-wider">Pendiente</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {orders.map(order => {
                  const paymentStatus = getPaymentStatus(order);
                  const pending = parseFloat(order.price) - parseFloat(order.paidAmount || "0");
                  
                  return (
                    <tr key={order.id}>
                      <td className="py-4 px-6">
                        <p className="font-medium text-slate-800">{order.customer.name}</p>
                      </td>
                      <td className="py-4 px-6 text-slate-800">{order.product}</td>
                      <td className="py-4 px-6 text-slate-600">
                        {getPaymentMethodName(order.paymentMethod)}
                      </td>
                      <td className="py-4 px-6 font-medium text-slate-800">€{order.price}</td>
                      <td className="py-4 px-6 text-slate-800">€{order.paidAmount}</td>
                      <td className="py-4 px-6">
                        <Badge className={paymentStatus.color}>
                          {paymentStatus.status}
                        </Badge>
                      </td>
                      <td className="py-4 px-6 text-slate-800">
                        {pending > 0 ? `€${pending.toFixed(2)}` : "-"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
