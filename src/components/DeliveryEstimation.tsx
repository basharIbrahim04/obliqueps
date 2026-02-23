import { Clock, Users, Calendar, Zap } from "lucide-react";
import { type Estimate, type PrintSettings } from "@/lib/estimator";

interface DeliveryEstimationProps {
  estimate: Estimate;
  settings: PrintSettings;
  onPriorityChange: (p: "standard" | "priority" | "rush") => void;
}

const DeliveryEstimation = ({ estimate, settings, onPriorityChange }: DeliveryEstimationProps) => {
  const queueAhead = Math.floor(Math.random() * 4) + 1;
  const baseDays = Math.ceil(estimate.printTimeHours / 8) + queueAhead;
  const deliveryDays = settings.priority === "rush" ? 1 : settings.priority === "priority" ? Math.ceil(baseDays * 0.6) : baseDays;
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + deliveryDays);

  return (
    <div className="editorial-panel border border-border p-5 space-y-4">
      <div className="grid grid-cols-3 gap-3 text-center">
        <div>
          <Clock className="w-5 h-5 text-walnut mx-auto mb-1" />
          <p className="text-xs text-muted-foreground">Print Time</p>
          <p className="font-display font-bold text-sm italic">{estimate.printTimeHours}h</p>
        </div>
        <div>
          <Users className="w-5 h-5 text-walnut mx-auto mb-1" />
          <p className="text-xs text-muted-foreground">Queue</p>
          <p className="font-display font-bold text-sm italic">{queueAhead} ahead</p>
        </div>
        <div>
          <Calendar className="w-5 h-5 text-walnut mx-auto mb-1" />
          <p className="text-xs text-muted-foreground">Ready By</p>
          <p className="font-display font-bold text-sm italic">{deliveryDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
        </div>
      </div>

      <div className="flex gap-2">
        {(["standard", "priority", "rush"] as const).map((p) => (
          <button
            key={p}
            onClick={() => onPriorityChange(p)}
            className={`
              flex-1 py-2 border text-xs font-sans tracking-[0.15em] uppercase font-semibold transition-all
              ${settings.priority === p
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background text-muted-foreground hover:border-walnut"}
            `}
          >
            {p === "rush" && <Zap className="w-3 h-3 inline mr-1" />}
            {p === "standard" ? "Standard" : p === "priority" ? "+$3 Priority" : "+$8 Rush"}
          </button>
        ))}
      </div>
    </div>
  );
};

export default DeliveryEstimation;
