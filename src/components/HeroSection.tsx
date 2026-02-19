import { motion } from "framer-motion";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeroSectionProps {
  onUploadClick?: () => void;
}

const HeroSection = ({ onUploadClick }: HeroSectionProps) => {
  return (
    <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden blueprint-bg">
      {/* Animated blueprint lines */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent"
            style={{ top: `${20 + i * 15}%`, width: "100%" }}
            animate={{ opacity: [0, 0.5, 0], x: ["-100%", "100%"] }}
            transition={{ duration: 4 + i, repeat: Infinity, delay: i * 0.8, ease: "linear" }}
          />
        ))}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={`v-${i}`}
            className="absolute w-px bg-gradient-to-b from-transparent via-primary/15 to-transparent"
            style={{ left: `${25 + i * 25}%`, height: "100%" }}
            animate={{ opacity: [0, 0.4, 0], y: ["-100%", "100%"] }}
            transition={{ duration: 5 + i, repeat: Infinity, delay: i * 1.2, ease: "linear" }}
          />
        ))}
      </div>

      {/* Corner brackets */}
      <div className="absolute top-8 left-8 w-12 h-12 border-t-2 border-l-2 border-primary/30" />
      <div className="absolute top-8 right-8 w-12 h-12 border-t-2 border-r-2 border-primary/30" />
      <div className="absolute bottom-8 left-8 w-12 h-12 border-b-2 border-l-2 border-primary/30" />
      <div className="absolute bottom-8 right-8 w-12 h-12 border-b-2 border-r-2 border-primary/30" />

      <div className="relative z-10 text-center px-6 py-20 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="font-mono text-xs tracking-[0.4em] text-primary/70 uppercase block mb-4">
            // Precision Engineering
          </span>

          <h1 className="text-6xl md:text-8xl font-display font-black tracking-wider mb-4">
            <span className="text-gradient oblique-skew inline-block">OBLIQUE</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto leading-relaxed font-light">
            Precision 3D Printing. Instant Pricing.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10"
        >
          <Button
            size="lg"
            onClick={onUploadClick}
            className="font-display tracking-wider text-sm h-12 px-8 glow-accent-strong hover:glow-accent-strong"
          >
            <Upload className="w-4 h-4 mr-2" />
            UPLOAD YOUR MODEL
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 flex items-center justify-center gap-3 text-muted-foreground text-xs font-mono"
        >
          <span className="w-8 h-px bg-primary/30" />
          <span>STL · OBJ · 3MF</span>
          <span className="w-8 h-px bg-primary/30" />
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
