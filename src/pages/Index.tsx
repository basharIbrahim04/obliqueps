import { useState, useMemo } from "react";
import HeroSection from "@/components/HeroSection";
import FileUploader from "@/components/FileUploader";
import MaterialSelector from "@/components/MaterialSelector";
import CostBreakdown from "@/components/CostBreakdown";
import { MATERIALS, estimateCost, type Estimate } from "@/lib/estimator";

const Index = () => {
  const [file, setFile] = useState<File | null>(null);
  const [selectedMaterial, setSelectedMaterial] = useState(MATERIALS[0]);
  const [selectedColor, setSelectedColor] = useState(0);

  const estimate: Estimate | null = useMemo(() => {
    if (!file) return null;
    return estimateCost(file.size, selectedMaterial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file?.name, file?.size, selectedMaterial.id]);

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <span className="font-display font-bold text-lg tracking-wider text-gradient oblique-skew">
            OBLIQUE
          </span>
          <span className="text-xs font-display text-muted-foreground tracking-wider uppercase">
            3D Print Lab
          </span>
        </div>
      </nav>

      <div className="pt-14">
        <HeroSection />

        {/* Main */}
        <main className="max-w-3xl mx-auto px-6 pb-20 -mt-8 relative z-10 space-y-8">
          {/* Step 1: Upload */}
          <section>
            <StepLabel step={1} label="Upload Your Model" />
            <FileUploader
              selectedFile={file}
              onFileSelected={setFile}
              onClear={() => setFile(null)}
            />
          </section>

          {/* Step 2: Material & Color */}
          <section>
            <StepLabel step={2} label="Choose Material & Color" />
            <MaterialSelector
              selectedMaterial={selectedMaterial}
              onSelect={setSelectedMaterial}
              selectedColor={selectedColor}
              onColorSelect={setSelectedColor}
            />
          </section>

          {/* Step 3: Estimate */}
          {estimate && (
            <section>
              <StepLabel step={3} label="Your Estimate" />
              <CostBreakdown estimate={estimate} materialName={selectedMaterial.name} />
            </section>
          )}
        </main>

        {/* Footer */}
        <footer className="border-t border-border py-8 text-center">
          <p className="text-sm text-muted-foreground font-display">
            © 2026 Oblique — Precision 3D Printing
          </p>
        </footer>
      </div>
    </div>
  );
};

const StepLabel = ({ step, label }: { step: number; label: string }) => (
  <div className="flex items-center gap-3 mb-4">
    <span className="w-7 h-7 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-xs font-display font-bold text-primary">
      {step}
    </span>
    <h2 className="text-sm font-display tracking-wider uppercase text-muted-foreground">
      {label}
    </h2>
  </div>
);

export default Index;
