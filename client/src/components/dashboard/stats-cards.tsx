import { useQuery } from "@tanstack/react-query";
import { ShoppingCart, DollarSign, CheckCircle, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/lib/api";

export default function StatsCards() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    queryFn: () => api.dashboard.getStats(),
  });

  const cards = [
    {
      title: "Pedidos Activos",
      value: stats?.activeOrders || 0,
      icon: ShoppingCart,
      bgColor: "bg-blue-100",
      iconColor: "text-blue-600",
      change: "+12%",
    },
    {
      title: "Ingresos del Mes",
      value: `€${stats?.monthlyRevenue?.toFixed(2) || "0.00"}`,
      icon: DollarSign,
      bgColor: "bg-green-100",
      iconColor: "text-green-600",
      change: "+8%",
    },
    {
      title: "Pedidos Completados",
      value: stats?.completedOrders || 0,
      icon: CheckCircle,
      bgColor: "bg-amber-100",
      iconColor: "text-amber-600",
      change: "+15%",
    },
    {
      title: "Clientes Activos",
      value: stats?.activeCustomers || 0,
      icon: Users,
      bgColor: "bg-purple-100",
      iconColor: "text-purple-600",
      change: "+5%",
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                <div className="h-6 bg-slate-200 rounded w-1/2 mb-4"></div>
                <div className="h-3 bg-slate-200 rounded w-1/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card, index) => (
        <Card key={index}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">{card.title}</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">{card.value}</p>
              </div>
              <div className={`${card.bgColor} p-3 rounded-lg`}>
                <card.icon className={card.iconColor} />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              <span className="text-green-600">{card.change}</span>
              <span className="text-slate-600 ml-1">vs. mes anterior</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
