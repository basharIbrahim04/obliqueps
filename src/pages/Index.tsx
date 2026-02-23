import { useState, useMemo, useRef, useCallback } from "react";
import HeroSection from "@/components/HeroSection";
import FileUploader from "@/components/FileUploader";
import STLViewer from "@/components/STLViewer";
import PrintConfigurator from "@/components/PrintConfigurator";
import CostBreakdown from "@/components/CostBreakdown";
import UseCaseSelector from "@/components/UseCaseSelector";
import FileHealthCheck from "@/components/FileHealthCheck";
import DeliveryEstimation from "@/components/DeliveryEstimation";
import OrderForm from "@/components/OrderForm";
import Logo3DService from "@/components/Logo3DService";
import { DEFAULT_SETTINGS, estimateCost, analyzeFileHealth, USE_CASES, type PrintSettings, type Estimate, type ModelData } from "@/lib/estimator";
import { type STLData } from "@/lib/stlParser";
import { motion } from "framer-motion";

const Index = () => {
  const [file, setFile] = useState<File | null>(null);
  const [settings, setSettings] = useState<PrintSettings>(DEFAULT_SETTINGS);
  const [useCase, setUseCase] = useState<string | null>(null);
  const [modelData, setModelData] = useState<ModelData | null>(null);
  const uploadRef = useRef<HTMLDivElement>(null);

  const handleModelParsed = useCallback((data: STLData) => {
    setModelData({ volumeCm3: data.volume, dimensions: data.dimensions });
  }, []);

  const estimate: Estimate | null = useMemo(() => {
    if (!file) return null;
    return estimateCost(file.size, settings, modelData ?? undefined);
  }, [file, settings, modelData]);

  const fileHealth = useMemo(() => {
    if (!file) return null;
    return analyzeFileHealth(file.size, modelData ?? undefined);
  }, [file, modelData]);

  const handleUseCaseSelect = (id: string) => {
    setUseCase(id);
    const uc = USE_CASES.find((u) => u.id === id);
    if (uc) {
      setSettings((s) => ({ ...s, ...uc.settings }));
    }
  };

  const scrollToUpload = () => {
    uploadRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 editorial-panel border-b border-border">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="font-display font-bold text-lg tracking-tight text-foreground italic">
            OBLIQUE
          </span>
          <span className="text-xs font-sans text-muted-foreground tracking-[0.3em] uppercase">
            3D Print Lab
          </span>
        </div>
      </nav>

      <div className="pt-16">
        <HeroSection onUploadClick={scrollToUpload} />

        <main className="max-w-3xl mx-auto px-6 pb-24 -mt-8 relative z-10 space-y-10">
          {/* Step 1: Upload */}
          <section ref={uploadRef}>
            <StepLabel step={1} label="Upload Your Model" />
            <FileUploader selectedFile={file} onFileSelected={(f) => { setFile(f); setModelData(null); }} onClear={() => { setFile(null); setModelData(null); }} />
          </section>

          {/* 3D Preview + Health */}
          {file && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <STLViewer file={file} onModelParsed={handleModelParsed} />
              {fileHealth && <FileHealthCheck health={fileHealth} />}
            </motion.div>
          )}

          {/* Step 2: Use Case */}
          {file && (
            <section>
              <StepLabel step={2} label="Smart Assistant" />
              <UseCaseSelector selected={useCase} onSelect={handleUseCaseSelect} />
            </section>
          )}

          {/* Step 3: Configure */}
          {file && (
            <section>
              <StepLabel step={3} label="Print Settings" />
              <div className="editorial-panel p-6">
                <PrintConfigurator settings={settings} onChange={setSettings} />
              </div>
            </section>
          )}

          {/* Step 4: Estimate */}
          {estimate && (
            <section>
              <StepLabel step={4} label="Your Estimate" />
              <CostBreakdown
                estimate={estimate}
                settings={settings}
                fileSizeBytes={file!.size}
                modelData={modelData ?? undefined}
                onSettingsChange={setSettings}
              />
            </section>
          )}

          {/* Step 5: Delivery */}
          {estimate && (
            <section>
              <StepLabel step={5} label="Delivery & Timeline" />
              <DeliveryEstimation
                estimate={estimate}
                settings={settings}
                onPriorityChange={(p) => setSettings((s) => ({ ...s, priority: p }))}
              />
            </section>
          )}

          {/* Step 6: Order */}
          {estimate && file && (
            <section>
              <StepLabel step={6} label="Submit Order" />
              <OrderForm file={file} estimate={estimate} settings={settings} />
            </section>
          )}

          {/* Logo 3D Service */}
          <section>
            <StepLabel step="★" label="New Service" />
            <Logo3DService />
          </section>
        </main>

        <footer className="border-t border-border py-10 text-center bg-secondary/30">
          <p className="text-xs text-muted-foreground tracking-[0.2em] uppercase font-sans">
            © 2026 Oblique — Precision 3D Printing
          </p>
        </footer>
      </div>
    </div>
  );
};

const StepLabel = ({ step, label }: { step: number | string; label: string }) => (
  <div className="flex items-center gap-4 mb-5">
    <span className="w-8 h-8 bg-primary text-primary-foreground flex items-center justify-center text-xs font-sans font-bold">
      {step}
    </span>
    <h2 className="text-xs font-sans tracking-[0.2em] uppercase text-muted-foreground font-semibold">
      {label}
    </h2>
    <span className="flex-1 h-px bg-border" />
  </div>
);

export default Index;
