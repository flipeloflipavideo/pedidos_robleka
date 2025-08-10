import { Link, useLocation } from "wouter";
import { BarChart3, ShoppingCart, Calendar, DollarSign, Users, ClipboardList, Menu } from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: BarChart3 },
  { name: "Pedidos", href: "/orders", icon: ShoppingCart },
  { name: "Calendario", href: "/calendar", icon: Calendar },
  { name: "Finanzas", href: "/finances", icon: DollarSign },
  { name: "Clientes", href: "/customers", icon: Users },
];

export default function MobileNav() {
  const [location] = useLocation();

  return (
    <>
      {/* Top Mobile Navigation */}
      <nav className="lg:hidden bg-white border-b border-slate-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <ClipboardList className="text-primary-500 text-xl" />
            <h1 className="text-xl font-semibold text-slate-800">ROBLEKA</h1>
          </div>
          <button className="p-2 rounded-lg hover:bg-slate-100">
            <Menu className="text-slate-600" />
          </button>
        </div>
      </nav>

      {/* Bottom Mobile Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50">
        <div className="grid grid-cols-5 py-2">
          {navigation.map((item) => {
            const isActive = location === item.href || (item.href === "/dashboard" && location === "/");
            const Icon = item.icon;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex flex-col items-center py-2 px-1 transition-colors",
                  isActive
                    ? "text-primary-600"
                    : "text-slate-400"
                )}
              >
                <Icon className={cn("mb-1", isActive ? "text-primary-500" : "text-slate-400")} size={20} />
                <span className="text-xs font-medium">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
