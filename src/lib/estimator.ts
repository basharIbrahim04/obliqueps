export interface Material {
  id: string;
  name: string;
  pricePerGram: number;
  colors: string[];
  colorLabels: string[];
  recommended?: string[];
}

export const MATERIALS: Material[] = [
  {
    id: "pla",
    name: "PLA",
    pricePerGram: 0.25,
    colors: ["#FFFFFF", "#1A1A1A", "#00E5FF", "#EF4444", "#22C55E", "#F59E0B", "#8B5CF6"],
    colorLabels: ["White", "Black", "Cyan", "Red", "Green", "Gold", "Purple"],
    recommended: ["display", "outdoor"],
  },
  {
    id: "petg",
    name: "PETG",
    pricePerGram: 0.25,
    colors: ["#FFFFFF", "#1A1A1A", "#00E5FF", "#22C55E", "#F97316"],
    colorLabels: ["White", "Black", "Cyan", "Green", "Orange"],
    recommended: ["functional", "outdoor"],
  },
  {
    id: "pla_silk",
    name: "PLA Silk",
    pricePerGram: 0.25,
    colors: ["#C5A44E", "#C0C0C0", "#B87333", "#E8B4B8", "#4169E1"],
    colorLabels: ["Gold", "Silver", "Copper", "Rose", "Royal Blue"],
    recommended: ["display"],
  },
];

export const LAYER_HEIGHTS = [0.1, 0.15, 0.2, 0.28];

export interface PrintSettings {
  material: Material;
  colorIndex: number;
  infill: number;
  layerHeight: number;
  wallThickness: number;
  supports: boolean;
  priority: "standard" | "priority" | "rush";
}

export interface Estimate {
  weightGrams: number;
  printTimeHours: number;
  printTimeMinutes: number;
  materialCost: number;
  machineCost: number;
  electricityCost: number;
  discount: number;
  discountPercent: number;
  prioritySurcharge: number;
  totalCost: number;
}

export const DEFAULT_SETTINGS: PrintSettings = {
  material: MATERIALS[0],
  colorIndex: 0,
  infill: 20,
  layerHeight: 0.2,
  wallThickness: 1.2,
  supports: false,
  priority: "standard",
};

export interface ModelData {
  volumeCm3: number;
  dimensions: { x: number; y: number; z: number };
}

export function estimateCost(fileSizeBytes: number, settings: PrintSettings, modelData?: ModelData): Estimate {
  const infillMultiplier = 0.5 + (settings.infill / 100) * 0.8;
  const wallMultiplier = settings.wallThickness / 1.2;

  let weightGrams: number;
  if (modelData && modelData.volumeCm3 > 0) {
    const density = settings.material.id === "petg" ? 1.27 : 1.25;
    weightGrams = Math.round(modelData.volumeCm3 * density * infillMultiplier * wallMultiplier);
  } else {
    const fileSizeMB = fileSizeBytes / (1024 * 1024);
    weightGrams = Math.round(fileSizeMB * 22 * infillMultiplier * wallMultiplier);
  }

  // Print time: 10g per 25 minutes = 0.4g/min base rate
  const baseTimeMinutes = weightGrams / 0.4;
  // Apply layer height multiplier (finer layers = more time)
  const layerMultiplier = 0.2 / settings.layerHeight;
  const supportMultiplier = settings.supports ? 1.3 : 1;
  const totalMinutes = Math.round(baseTimeMinutes * layerMultiplier * supportMultiplier);
  const printTimeHours = Math.floor(totalMinutes / 60);
  const printTimeMinutes = totalMinutes % 60;
  const printTimeDecimal = Math.round((totalMinutes / 60) * 100) / 100;

  // Costs
  const materialCost = Math.round(weightGrams * settings.material.pricePerGram * 100) / 100;
  const machineCost = Math.round(printTimeDecimal * 5 * 100) / 100;
  const electricityCost = Math.round(printTimeDecimal * 0.2 * 100) / 100;

  // Bulk discounts
  let discountPercent = 0;
  if (weightGrams >= 600) discountPercent = 10;
  else if (weightGrams >= 300) discountPercent = 5;

  const subtotal = materialCost + machineCost + electricityCost;
  const discount = Math.round(subtotal * (discountPercent / 100) * 100) / 100;

  // Priority surcharge
  let prioritySurcharge = 0;
  if (settings.priority === "priority") prioritySurcharge = 3;
  if (settings.priority === "rush") prioritySurcharge = 8;

  const totalCost = Math.max(20, Math.round((subtotal - discount + prioritySurcharge) * 100) / 100);

  return { weightGrams, printTimeHours, printTimeMinutes, materialCost, machineCost, electricityCost, discount, discountPercent, prioritySurcharge, totalCost };
}

export function getOptimizedSettings(settings: PrintSettings): PrintSettings {
  return {
    ...settings,
    infill: Math.max(10, settings.infill - 10),
    layerHeight: Math.min(0.28, settings.layerHeight + 0.08),
    supports: false,
  };
}

export interface FileHealth {
  thinWalls: "ok" | "warn" | "error";
  overhang: "ok" | "warn" | "error";
  supportNeeded: "ok" | "warn";
  printable: "ok" | "warn" | "error";
}

export function analyzeFileHealth(fileSizeBytes: number, modelData?: ModelData): FileHealth {
  const sizeMB = fileSizeBytes / (1024 * 1024);
  const MAX = { x: 220, y: 220, z: 250 };
  const exceedsBuild = modelData
    ? modelData.dimensions.x > MAX.x || modelData.dimensions.y > MAX.y || modelData.dimensions.z > MAX.z
    : false;

  return {
    thinWalls: modelData && modelData.volumeCm3 < 0.5 ? "warn" : sizeMB < 0.1 ? "warn" : "ok",
    overhang: sizeMB > 5 ? "warn" : "ok",
    supportNeeded: sizeMB > 3 ? "warn" : "ok",
    printable: exceedsBuild ? "error" : sizeMB > 50 ? "error" : "ok",
  };
}

export const USE_CASES = [
  { id: "display", label: "Display Model", icon: "🖼️", settings: { infill: 15, layerHeight: 0.15, wallThickness: 1.2, supports: false } },
  { id: "functional", label: "Functional Part", icon: "⚙️", settings: { infill: 40, layerHeight: 0.2, wallThickness: 1.6, supports: true } },
  { id: "outdoor", label: "Outdoor Use", icon: "☀️", settings: { infill: 30, layerHeight: 0.2, wallThickness: 2.0, supports: false } },
  { id: "highstrength", label: "High Strength", icon: "💪", settings: { infill: 60, layerHeight: 0.2, wallThickness: 2.4, supports: true } },
];
