import { type Estimate } from "@/lib/estimator";
import { Weight, Clock, DollarSign, Layers } from "lucide-react";

interface CostBreakdownProps {
  estimate: Estimate;
  materialName: string;
}

const CostBreakdown = ({ estimate, materialName }: CostBreakdownProps) => {
  return (
    <div className="animate-slide-up">
      <div className="border border-primary/20 rounded-lg bg-card overflow-hidden glow-accent">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border bg-primary/5">
          <h3 className="font-display text-sm tracking-wider uppercase text-primary flex items-center gap-2">
            <Layers className="w-4 h-4" />
            AI Cost Estimate
          </h3>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-px bg-border">
          <Stat
            icon={<Weight className="w-5 h-5" />}
            label="Est. Weight"
            value={`${estimate.weightGrams}g`}
          />
          <Stat
            icon={<Clock className="w-5 h-5" />}
            label="Print Time"
            value={`${estimate.printTimeHours}h`}
          />
          <Stat
            icon={<DollarSign className="w-5 h-5" />}
            label={`${materialName} Cost`}
            value={`$${estimate.materialCost.toFixed(2)}`}
          />
          <Stat
            icon={<DollarSign className="w-5 h-5" />}
            label="Machine + Labor"
            value={`$${estimate.laborCost.toFixed(2)}`}
          />
        </div>

        {/* Total */}
        <div className="px-6 py-5 flex items-center justify-between bg-card">
          <span className="text-muted-foreground font-medium">Estimated Total</span>
          <span className="text-3xl font-display font-bold text-gradient">
            ${estimate.totalCost.toFixed(2)}
          </span>
        </div>

        <div className="px-6 pb-4">
          <p className="text-xs text-muted-foreground">
            * Estimate based on file analysis. Final cost may vary based on supports, 
            infill density, and post-processing.
          </p>
        </div>
      </div>
    </div>
  );
};

const Stat = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <div className="bg-card p-5">
    <div className="flex items-center gap-2 text-muted-foreground mb-1">
      {icon}
      <span className="text-xs font-display uppercase tracking-wider">{label}</span>
    </div>
    <p className="text-xl font-display font-bold text-foreground">{value}</p>
  </div>
);

export default CostBreakdown;
