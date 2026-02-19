import { Upload, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const Logo3DService = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="glass-panel glass-panel-hover rounded-lg p-6 text-center"
    >
      <div className="w-16 h-16 mx-auto mb-4 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center">
        <span className="text-3xl">🎨</span>
      </div>
      <h3 className="font-display text-sm tracking-widest uppercase text-primary mb-2">
        Turn Your Logo Into 3D Wall Art
      </h3>
      <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
        Upload your PNG, SVG, or logo and we'll convert it into stunning 3D printable wall décor.
      </p>
      <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-primary/30 bg-primary/5 text-primary text-xs font-display tracking-wider uppercase cursor-pointer hover:bg-primary/10 transition-colors">
        <Upload className="w-3.5 h-3.5" />
        Upload Logo
        <input type="file" accept=".png,.svg,.jpg,.jpeg" className="sr-only" />
      </label>
    </motion.div>
  );
};

export default Logo3DService;
