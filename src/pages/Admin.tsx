import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { ChevronDown, LogOut } from "lucide-react";

type OrderStatus = "pending" | "printing" | "completed" | "delivered";

interface Order {
  id: string;
  customer_name: string;
  customer_email: string;
  file_name: string;
  material: string;
  estimated_cost: number;
  estimated_weight: number;
  status: string;
  created_at: string;
  priority: string;
}

const STATUSES: OrderStatus[] = ["pending", "printing", "completed", "delivered"];

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-400",
  printing: "bg-primary/20 text-primary",
  completed: "bg-green-500/20 text-green-400",
  delivered: "bg-muted text-muted-foreground",
};

const Admin = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate("/auth"); return; }

      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin");

      if (!roles || roles.length === 0) {
        toast({ title: "Access Denied", description: "Admin only.", variant: "destructive" });
        navigate("/");
        return;
      }
      setIsAdmin(true);
      fetchOrders();
    };
    checkAdmin();
  }, []);

  const fetchOrders = async () => {
    const { data } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });
    setOrders((data as Order[]) || []);
    setLoading(false);
  };

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("orders").update({ status }).eq("id", id);
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-background blueprint-bg">
      <nav className="glass-panel border-b border-border">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <span className="font-display font-bold text-sm tracking-[0.2em] text-gradient oblique-skew">OBLIQUE</span>
          <div className="flex items-center gap-4">
            <span className="text-xs font-mono text-primary">ADMIN</span>
            <button onClick={handleLogout} className="text-muted-foreground hover:text-foreground">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="font-display text-lg tracking-widest uppercase text-primary mb-6">Orders</h1>

        {loading ? (
          <p className="text-muted-foreground text-sm">Loading...</p>
        ) : orders.length === 0 ? (
          <p className="text-muted-foreground text-sm">No orders yet.</p>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <div key={order.id} className="glass-panel glass-panel-hover rounded-lg p-4 flex items-center justify-between flex-wrap gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{order.customer_name}</p>
                  <p className="text-xs text-muted-foreground font-mono">{order.file_name}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {order.material} · {order.estimated_weight}g · ${Number(order.estimated_cost).toFixed(2)}
                    {order.priority !== "standard" && (
                      <span className="ml-2 text-primary uppercase">{order.priority}</span>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded font-mono ${statusColors[order.status] || statusColors.pending}`}>
                    {order.status}
                  </span>
                  <select
                    value={order.status}
                    onChange={(e) => updateStatus(order.id, e.target.value)}
                    className="bg-secondary border border-border rounded text-xs px-2 py-1 focus:outline-none focus:border-primary"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Admin;
