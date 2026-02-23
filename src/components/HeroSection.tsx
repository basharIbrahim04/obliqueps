import { motion } from "framer-motion";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeroSectionProps {
  onUploadClick?: () => void;
}

const HeroSection = ({ onUploadClick }: HeroSectionProps) => {
  return (
    <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden bg-background">
      {/* Diagonal decorative lines */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-secondary/30 diagonal-divider" />
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent"
            style={{ top: `${25 + i * 15}%`, width: "120%", left: "-10%", transform: `rotate(-3deg)` }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.6, 0] }}
            transition={{ duration: 6 + i, repeat: Infinity, delay: i * 1.5, ease: "linear" }}
          />
        ))}
      </div>

      <div className="relative z-10 text-center px-6 py-24 max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <span className="text-xs tracking-[0.5em] text-muted-foreground uppercase block mb-6 font-sans font-medium">
            Precision Engineering
          </span>

          <h1 className="text-7xl md:text-9xl font-display font-black tracking-tight mb-6">
            <span className="text-gradient oblique-skew inline-block">OBLIQUE</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-md mx-auto leading-relaxed font-light tracking-wide">
            Precision 3D Printing. Instant Pricing.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12"
        >
          <Button
            size="lg"
            onClick={onUploadClick}
            className="font-sans tracking-[0.2em] text-xs h-14 px-10 uppercase font-semibold"
          >
            <Upload className="w-4 h-4 mr-3" />
            Upload Your Model
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-10 flex items-center justify-center gap-4 text-muted-foreground text-xs tracking-[0.3em] uppercase font-sans"
        >
          <span className="w-12 h-px bg-accent" />
          <span>STL · OBJ · 3MF</span>
          <span className="w-12 h-px bg-accent" />
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
