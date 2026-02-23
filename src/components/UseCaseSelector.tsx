import { USE_CASES } from "@/lib/estimator";
import { motion } from "framer-motion";

interface UseCaseSelectorProps {
  selected: string | null;
  onSelect: (id: string) => void;
}

const UseCaseSelector = ({ selected, onSelect }: UseCaseSelectorProps) => {
  return (
    <div>
      <p className="text-sm text-muted-foreground mb-3 italic font-display">What are you printing this for?</p>
      <div className="grid grid-cols-2 gap-2">
        {USE_CASES.map((uc) => (
          <button
            key={uc.id}
            onClick={() => onSelect(uc.id)}
            className={`
              p-3 border text-left transition-all text-sm
              ${selected === uc.id
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background hover:border-walnut"}
            `}
          >
            <span className="text-lg mr-2">{uc.icon}</span>
            <span className="font-medium">{uc.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default UseCaseSelector;
