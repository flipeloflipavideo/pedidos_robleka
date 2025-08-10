import { Link, useLocation } from "wouter";
import { BarChart3, ShoppingCart, Calendar, DollarSign, Users, ClipboardList } from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: BarChart3 },
  { name: "Pedidos", href: "/orders", icon: ShoppingCart },
  { name: "Calendario", href: "/calendar", icon: Calendar },
  { name: "Finanzas", href: "/finances", icon: DollarSign },
  { name: "Clientes", href: "/customers", icon: Users },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="hidden lg:block w-64 bg-white border-r border-slate-200 min-h-screen">
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-8">
          <ClipboardList className="text-primary-500 text-2xl" />
          <h1 className="text-2xl font-bold text-slate-800">ROBLEKA</h1>
        </div>
        
        <nav className="space-y-2">
          {navigation.map((item) => {
            const isActive = location === item.href || (item.href === "/dashboard" && location === "/");
            const Icon = item.icon;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center space-x-3 px-3 py-2 rounded-lg font-medium transition-colors",
                  isActive
                    ? "bg-primary-50 text-primary-700"
                    : "text-slate-600 hover:bg-slate-50"
                )}
              >
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
