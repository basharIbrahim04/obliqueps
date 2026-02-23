import { MATERIALS, LAYER_HEIGHTS, type PrintSettings, type Material } from "@/lib/estimator";
import { Slider } from "@/components/ui/slider";
import { Check, Shield } from "lucide-react";
import { motion } from "framer-motion";

interface PrintConfiguratorProps {
  settings: PrintSettings;
  onChange: (settings: PrintSettings) => void;
}

const PrintConfigurator = ({ settings, onChange }: PrintConfiguratorProps) => {
  const set = (partial: Partial<PrintSettings>) => onChange({ ...settings, ...partial });

  return (
    <div className="space-y-6">
      {/* Material */}
      <div>
        <label className="block text-xs tracking-[0.2em] uppercase text-muted-foreground mb-3 font-sans font-semibold">
          Material
        </label>
        <div className="grid grid-cols-3 gap-2">
          {MATERIALS.map((m) => (
            <button
              key={m.id}
              onClick={() => set({ material: m, colorIndex: 0 })}
              className={`
                px-3 py-3 border text-sm font-medium transition-all
                ${settings.material.id === m.id
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-foreground hover:border-walnut"}
              `}
            >
              <span className="font-display text-xs italic">{m.name}</span>
              <span className="block text-xs text-current/70 font-mono mt-1">₪{m.pricePerGram}/g</span>
            </button>
          ))}
        </div>
      </div>

      {/* Color */}
      <div>
        <label className="block text-xs tracking-[0.2em] uppercase text-muted-foreground mb-3 font-sans font-semibold">
          Color — <span className="text-foreground">{settings.material.colorLabels[settings.colorIndex]}</span>
        </label>
        <div className="flex gap-3 flex-wrap">
          {settings.material.colors.map((color, idx) => (
            <button
              key={idx}
              onClick={() => set({ colorIndex: idx })}
              className={`
                w-9 h-9 rounded-full border-2 transition-all flex items-center justify-center
                ${settings.colorIndex === idx ? "border-primary scale-110 ring-2 ring-primary/20" : "border-border hover:border-walnut"}
              `}
              style={{ backgroundColor: color }}
              title={settings.material.colorLabels[idx]}
            >
              {settings.colorIndex === idx && (
                <Check className="w-3.5 h-3.5" style={{ color: color === "#1A1A1A" ? "#B7A996" : "#4E4034" }} />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Infill */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <label className="text-xs tracking-[0.2em] uppercase text-muted-foreground font-sans font-semibold">Infill</label>
          <span className="text-xs font-mono text-foreground font-medium">{settings.infill}%</span>
        </div>
        <Slider
          value={[settings.infill]}
          onValueChange={([v]) => set({ infill: v })}
          min={10}
          max={100}
          step={5}
        />
      </div>

      {/* Layer Height */}
      <div>
        <label className="block text-xs tracking-[0.2em] uppercase text-muted-foreground mb-3 font-sans font-semibold">
          Layer Height
        </label>
        <div className="flex gap-2">
          {LAYER_HEIGHTS.map((lh) => (
            <button
              key={lh}
              onClick={() => set({ layerHeight: lh })}
              className={`
                flex-1 py-2 border text-xs font-mono transition-all
                ${settings.layerHeight === lh
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-muted-foreground hover:border-walnut"}
              `}
            >
              {lh}mm
            </button>
          ))}
        </div>
      </div>

      {/* Wall Thickness */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <label className="text-xs tracking-[0.2em] uppercase text-muted-foreground font-sans font-semibold">Wall Thickness</label>
          <span className="text-xs font-mono text-foreground font-medium">{settings.wallThickness.toFixed(1)}mm</span>
        </div>
        <Slider
          value={[settings.wallThickness * 10]}
          onValueChange={([v]) => set({ wallThickness: v / 10 })}
          min={8}
          max={30}
          step={2}
        />
      </div>

      {/* Supports Toggle */}
      <div
        onClick={() => set({ supports: !settings.supports })}
        className={`
          flex items-center gap-3 p-3 border cursor-pointer transition-all
          ${settings.supports ? "border-primary bg-primary/5" : "border-border bg-background"}
        `}
      >
        <div className={`w-5 h-5 border flex items-center justify-center transition-all
          ${settings.supports ? "bg-primary border-primary" : "border-muted-foreground"}`}>
          {settings.supports && <Check className="w-3 h-3 text-primary-foreground" />}
        </div>
        <div>
          <span className="text-sm font-medium">Support Structures</span>
          <p className="text-xs text-muted-foreground">Add supports for overhangs</p>
        </div>
        <Shield className="w-4 h-4 text-muted-foreground ml-auto" />
      </div>
    </div>
  );
};

export default PrintConfigurator;
