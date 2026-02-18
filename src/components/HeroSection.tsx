import heroBg from "@/assets/hero-bg.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        <img src={heroBg} alt="3D Printer" className="w-full h-full object-cover opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
      </div>

      <div className="relative z-10 text-center px-6 py-20 max-w-4xl mx-auto">
        <div className="inline-block mb-6">
          <span className="font-display text-sm tracking-[0.3em] text-primary uppercase">
            3D Print Cost Estimator
          </span>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
          <span className="text-gradient oblique-skew inline-block">OBLIQUE</span>
        </h1>

        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Upload your 3D model. Get an instant AI-powered cost estimate based on
          material, weight, and print time.
        </p>

        <div className="mt-10 flex items-center justify-center gap-2 text-muted-foreground text-sm font-display">
          <span className="w-8 h-px bg-primary/40" />
          <span>STL · OBJ · 3MF</span>
          <span className="w-8 h-px bg-primary/40" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
