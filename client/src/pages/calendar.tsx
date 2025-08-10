import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());

  const { data: orders = [] } = useQuery({
    queryKey: ["/api/orders"],
    queryFn: () => api.orders.getAll(),
  });

  const getMonthStart = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  };

  const getMonthEnd = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0);
  };

  const getDaysInMonth = () => {
    const start = getMonthStart(currentDate);
    const end = getMonthEnd(currentDate);
    const days = [];
    
    // Add empty cells for days before month starts
    const startDay = start.getDay();
    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= end.getDate(); day++) {
      days.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
    }
    
    return days;
  };

  const getOrdersForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return orders.filter(order => {
      if (order.createdAt) {
        const orderDate = new Date(order.createdAt).toISOString().split('T')[0];
        return orderDate === dateStr;
      }
      return false;
    });
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

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

  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Calendario de Pedidos</h2>
          <p className="text-slate-600">Vista de pedidos por fecha de creación</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <CalendarIcon className="h-5 w-5" />
              <span>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</span>
            </CardTitle>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={previousMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={nextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 mb-4">
            {dayNames.map(day => (
              <div key={day} className="p-2 text-center text-sm font-medium text-slate-600 border-b">
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-1">
            {getDaysInMonth().map((date, index) => (
              <div key={index} className="min-h-[120px] p-2 border border-slate-200 rounded">
                {date && (
                  <>
                    <div className="text-sm font-medium text-slate-800 mb-2">
                      {date.getDate()}
                    </div>
                    {getOrdersForDate(date).map(order => (
                      <div key={order.id} className="mb-1">
                        <div className="text-xs p-1 bg-primary-100 text-primary-800 rounded truncate">
                          {order.customer.name} - {order.product}
                        </div>
                        <Badge 
                          className={`text-xs ${getStatusColor(order.status)} mt-1`}
                          variant="secondary"
                        >
                          {order.status === "completed" ? "Completado" : 
                           order.status === "in_progress" ? "En proceso" : "Pendiente"}
                        </Badge>
                      </div>
                    ))}
                  </>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Today's Orders */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Pedidos de Hoy</CardTitle>
        </CardHeader>
        <CardContent>
          {(() => {
            const today = new Date();
            const todayOrders = getOrdersForDate(today);
            
            if (todayOrders.length === 0) {
              return (
                <p className="text-slate-500 text-center py-4">
                  No hay pedidos creados hoy
                </p>
              );
            }
            
            return (
              <div className="space-y-3">
                {todayOrders.map(order => (
                  <div key={order.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-medium text-slate-800">{order.customer.name}</p>
                      <p className="text-sm text-slate-600">{order.product}</p>
                      <p className="text-sm text-slate-500">{order.customer.phone}</p>
                    </div>
                    <div className="text-right">
                      <Badge className={getStatusColor(order.status)}>
                        {order.status === "completed" ? "Completado" : 
                         order.status === "in_progress" ? "En proceso" : "Pendiente"}
                      </Badge>
                      <p className="text-sm font-medium text-slate-800 mt-1">€{order.price}</p>
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </CardContent>
      </Card>
    </div>
  );
}
