import { Upload } from "lucide-react";
import { motion } from "framer-motion";

const Logo3DService = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="editorial-panel editorial-panel-hover border border-border p-8 text-center"
    >
      <div className="w-16 h-16 mx-auto mb-4 bg-secondary flex items-center justify-center">
        <span className="text-3xl">🎨</span>
      </div>
      <h3 className="font-display text-lg italic text-foreground mb-2">
        Turn Your Logo Into 3D Wall Art
      </h3>
      <p className="text-sm text-muted-foreground mb-5 max-w-md mx-auto">
        Upload your PNG, SVG, or logo and we'll convert it into stunning 3D printable wall décor.
      </p>
      <label className="inline-flex items-center gap-2 px-5 py-2.5 border border-primary bg-primary text-primary-foreground text-xs font-sans tracking-[0.15em] uppercase font-semibold cursor-pointer hover:bg-primary/90 transition-colors">
        <Upload className="w-3.5 h-3.5" />
        Upload Logo
        <input type="file" accept=".png,.svg,.jpg,.jpeg" className="sr-only" />
      </label>
    </motion.div>
  );
};

export default Logo3DService;
