import { type Estimate, type PrintSettings, getOptimizedSettings, estimateCost } from "@/lib/estimator";
import { Weight, Clock, DollarSign, Layers, Zap, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

interface CostBreakdownProps {
  estimate: Estimate;
  settings: PrintSettings;
  fileSizeBytes: number;
  onSettingsChange: (s: PrintSettings) => void;
}

const CostBreakdown = ({ estimate, settings, fileSizeBytes, onSettingsChange }: CostBreakdownProps) => {
  const [showWhy, setShowWhy] = useState(false);
  const [showSaved, setShowSaved] = useState(false);

  const handleOptimize = () => {
    const optimized = getOptimizedSettings(settings);
    const oldTotal = estimate.totalCost;
    onSettingsChange(optimized);
    const newEstimate = estimateCost(fileSizeBytes, optimized);
    const saved = oldTotal - newEstimate.totalCost;
    if (saved > 0) setShowSaved(true);
    setTimeout(() => setShowSaved(false), 3000);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div className="glass-panel rounded-lg overflow-hidden glow-accent">
        {/* Header */}
        <div className="px-5 py-3 border-b border-border flex items-center justify-between">
          <h3 className="font-display text-xs tracking-widest uppercase text-primary flex items-center gap-2">
            <Layers className="w-4 h-4" /> Cost Estimate
          </h3>
          {estimate.discountPercent > 0 && (
            <span className="text-xs font-mono bg-primary/10 text-primary px-2 py-0.5 rounded">
              {estimate.discountPercent}% BULK
            </span>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-px bg-border">
          <Stat icon={<Weight className="w-4 h-4" />} label="Weight" value={`${estimate.weightGrams}g`} />
          <Stat icon={<Clock className="w-4 h-4" />} label="Print Time" value={`${estimate.printTimeHours}h`} />
        </div>

        {/* Line items */}
        <div className="px-5 py-3 space-y-1.5 text-sm">
          <LineItem label={`${settings.material.name} Material`} value={estimate.materialCost} />
          <LineItem label="Machine Time" value={estimate.machineCost} />
          <LineItem label="Electricity" value={estimate.electricityCost} />
          <LineItem label="Base Fee" value={estimate.baseFee} />
          {estimate.discount > 0 && <LineItem label="Bulk Discount" value={-estimate.discount} isDiscount />}
          {estimate.prioritySurcharge > 0 && <LineItem label="Priority" value={estimate.prioritySurcharge} />}
        </div>

        {/* Total */}
        <div className="px-5 py-4 flex items-center justify-between border-t border-border">
          <span className="text-muted-foreground font-medium text-sm">Estimated Total</span>
          <motion.span
            key={estimate.totalCost}
            initial={{ scale: 1.2, color: "#00e5ff" }}
            animate={{ scale: 1, color: "inherit" }}
            className="text-3xl font-display font-bold text-gradient"
          >
            ${estimate.totalCost.toFixed(2)}
          </motion.span>
        </div>

        {/* Optimize button */}
        <div className="px-5 pb-4">
          <button
            onClick={handleOptimize}
            className="w-full py-2.5 rounded-lg border border-primary/30 bg-primary/5 text-primary text-xs font-display tracking-wider uppercase hover:bg-primary/10 transition-all flex items-center justify-center gap-2"
          >
            <Zap className="w-3.5 h-3.5" />
            Optimize For Lower Cost
          </button>
          <AnimatePresence>
            {showSaved && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-xs text-primary text-center mt-2 font-mono"
              >
                ✓ Settings optimized for lower cost!
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Why this price */}
        <div className="border-t border-border">
          <button
            onClick={() => setShowWhy(!showWhy)}
            className="w-full px-5 py-3 flex items-center justify-between text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <span>Why is this the price?</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${showWhy ? "rotate-180" : ""}`} />
          </button>
          <AnimatePresence>
            {showWhy && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="px-5 pb-4 text-xs text-muted-foreground leading-relaxed space-y-1">
                  <p>• Material cost is based on ${settings.material.pricePerGram}/g × {estimate.weightGrams}g</p>
                  <p>• Machine cost is $1/hr × {estimate.printTimeHours}h of print time</p>
                  <p>• Electricity is $0.20/hr for printer power</p>
                  <p>• $2 base fee covers setup and quality inspection</p>
                  {estimate.discountPercent > 0 && <p>• Bulk discount of {estimate.discountPercent}% applied for {estimate.weightGrams}g+</p>}
                  <p>• Minimum charge is $5 per order</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

const Stat = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <div className="bg-card/50 p-4">
    <div className="flex items-center gap-2 text-muted-foreground mb-1">
      {icon}
      <span className="text-xs font-display uppercase tracking-wider">{label}</span>
    </div>
    <p className="text-lg font-display font-bold text-foreground">{value}</p>
  </div>
);

const LineItem = ({ label, value, isDiscount }: { label: string; value: number; isDiscount?: boolean }) => (
  <div className="flex justify-between font-mono">
    <span className="text-muted-foreground">{label}</span>
    <span className={isDiscount ? "text-primary" : "text-foreground"}>
      {isDiscount ? "-" : ""}${Math.abs(value).toFixed(2)}
    </span>
  </div>
);

export default CostBreakdown;
