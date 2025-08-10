import { useQuery } from "@tanstack/react-query";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function StatusChart() {
  const { data: statusData = [], isLoading } = useQuery({
    queryKey: ["/api/dashboard/status-distribution"],
    queryFn: () => api.dashboard.getStatusDistribution(),
  });

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "completed": return "Completados";
      case "in_progress": return "En proceso";
      case "pending": return "Pendientes";
      default: return status;
    }
  };

  const chartData = {
    labels: statusData.map(item => getStatusLabel(item.status)),
    datasets: [
      {
        data: statusData.map(item => item.count),
        backgroundColor: ["#10B981", "#F59E0B", "#3B82F6"],
        borderWidth: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
      },
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-slate-800">Estado de Pedidos</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-[200px] flex items-center justify-center">
            <div className="animate-pulse bg-slate-200 rounded-full w-32 h-32 mx-auto"></div>
          </div>
        ) : (
          <div className="h-[200px]">
            <Doughnut data={chartData} options={options} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
