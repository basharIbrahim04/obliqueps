import { MATERIALS, type Material } from "@/lib/estimator";
import { Check } from "lucide-react";

interface MaterialSelectorProps {
  selectedMaterial: Material;
  onSelect: (m: Material) => void;
  selectedColor: number;
  onColorSelect: (idx: number) => void;
}

const MaterialSelector = ({
  selectedMaterial,
  onSelect,
  selectedColor,
  onColorSelect,
}: MaterialSelectorProps) => {
  return (
    <div className="space-y-6">
      {/* Material */}
      <div>
        <label className="block text-sm font-display text-muted-foreground mb-3 tracking-wider uppercase">
          Material
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {MATERIALS.map((m) => (
            <button
              key={m.id}
              onClick={() => {
                onSelect(m);
                onColorSelect(0);
              }}
              className={`
                px-4 py-3 rounded-lg border text-sm font-medium transition-all
                ${
                  selectedMaterial.id === m.id
                    ? "border-primary bg-primary/10 text-primary glow-accent"
                    : "border-border bg-card text-secondary-foreground hover:border-primary/30"
                }
              `}
            >
              <span className="font-display">{m.name}</span>
              <span className="block text-xs text-muted-foreground mt-1">
                ${m.pricePerGram}/g
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Color */}
      <div>
        <label className="block text-sm font-display text-muted-foreground mb-3 tracking-wider uppercase">
          Color — {selectedMaterial.colorLabels[selectedColor]}
        </label>
        <div className="flex gap-3 flex-wrap">
          {selectedMaterial.colors.map((color, idx) => (
            <button
              key={idx}
              onClick={() => onColorSelect(idx)}
              className={`
                w-10 h-10 rounded-full border-2 transition-all flex items-center justify-center
                ${selectedColor === idx ? "border-primary scale-110 glow-accent" : "border-border hover:border-primary/40"}
              `}
              style={{ backgroundColor: color }}
              title={selectedMaterial.colorLabels[idx]}
            >
              {selectedColor === idx && (
                <Check className="w-4 h-4" style={{ color: color === "#1A1A1A" ? "#22D3EE" : "#111" }} />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MaterialSelector;
