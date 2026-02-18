export interface Material {
  id: string;
  name: string;
  pricePerGram: number;
  colors: string[];
  colorLabels: string[];
}

export const MATERIALS: Material[] = [
  {
    id: "pla",
    name: "PLA",
    pricePerGram: 0.05,
    colors: ["#FFFFFF", "#1A1A1A", "#22D3EE", "#EF4444", "#22C55E", "#F59E0B", "#8B5CF6"],
    colorLabels: ["White", "Black", "Cyan", "Red", "Green", "Gold", "Purple"],
  },
  {
    id: "abs",
    name: "ABS",
    pricePerGram: 0.06,
    colors: ["#FFFFFF", "#1A1A1A", "#3B82F6", "#EF4444", "#D4D4D4"],
    colorLabels: ["White", "Black", "Blue", "Red", "Grey"],
  },
  {
    id: "petg",
    name: "PETG",
    pricePerGram: 0.07,
    colors: ["#FFFFFF", "#1A1A1A", "#22D3EE", "#22C55E", "#F97316"],
    colorLabels: ["White", "Black", "Cyan", "Green", "Orange"],
  },
  {
    id: "resin",
    name: "Resin (SLA)",
    pricePerGram: 0.12,
    colors: ["#E5E5E5", "#1A1A1A", "#6B7280"],
    colorLabels: ["Clear", "Black", "Grey"],
  },
  {
    id: "nylon",
    name: "Nylon",
    pricePerGram: 0.15,
    colors: ["#F5F5F5", "#1A1A1A"],
    colorLabels: ["Natural", "Black"],
  },
];

export interface Estimate {
  weightGrams: number;
  printTimeHours: number;
  materialCost: number;
  laborCost: number;
  totalCost: number;
}

export function estimateCost(fileSizeBytes: number, material: Material): Estimate {
  // Simulate AI estimation from file size
  // Rough heuristic: STL file size correlates loosely to model volume
  const fileSizeMB = fileSizeBytes / (1024 * 1024);
  
  // Estimate weight: ~15-40g per MB of STL (rough proxy)
  const weightGrams = Math.round(fileSizeMB * 25 * (1 + Math.random() * 0.2));
  
  // Print time: ~1 hour per 10g for FDM, faster for small prints
  const baseTimePerGram = material.id === "resin" ? 0.05 : 0.1;
  const printTimeHours = Math.round((weightGrams * baseTimePerGram + 0.5) * 10) / 10;
  
  // Material cost
  const materialCost = Math.round(weightGrams * material.pricePerGram * 100) / 100;
  
  // Labor/machine cost: $3/hour
  const laborCost = Math.round(printTimeHours * 3 * 100) / 100;
  
  const totalCost = Math.round((materialCost + laborCost + 2.5) * 100) / 100; // +$2.50 base fee

  return { weightGrams, printTimeHours, materialCost, laborCost, totalCost };
}
