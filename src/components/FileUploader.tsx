import { useCallback, useState } from "react";
import { Upload, FileBox, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FileUploaderProps {
  onFileSelected: (file: File) => void;
  selectedFile: File | null;
  onClear: () => void;
}

const ACCEPTED = [".stl", ".obj", ".3mf"];

const FileUploader = ({ onFileSelected, selectedFile, onClear }: FileUploaderProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const simulateUpload = (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 30 + 10;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setTimeout(() => {
          setIsUploading(false);
          onFileSelected(file);
        }, 200);
      }
      setUploadProgress(Math.min(progress, 100));
    }, 150);
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) simulateUpload(file);
    },
    [onFileSelected]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) simulateUpload(file);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (isUploading) {
    return (
      <div className="glass-panel rounded-lg p-8">
        <div className="text-center mb-4">
          <Upload className="w-8 h-8 text-primary mx-auto mb-2 animate-pulse-glow" />
          <p className="text-sm font-mono text-muted-foreground">Processing model...</p>
        </div>
        <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${uploadProgress}%` }}
            transition={{ ease: "easeOut" }}
          />
        </div>
        <p className="text-xs font-mono text-primary text-center mt-2">{Math.round(uploadProgress)}%</p>
      </div>
    );
  }

  if (selectedFile) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel glass-panel-hover rounded-lg p-5 glow-accent"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded bg-primary/10 border border-primary/30 flex items-center justify-center">
              <FileBox className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-foreground text-sm">{selectedFile.name}</p>
              <p className="text-xs text-muted-foreground font-mono">{formatSize(selectedFile.size)}</p>
            </div>
          </div>
          <button
            onClick={onClear}
            className="w-8 h-8 rounded bg-secondary flex items-center justify-center hover:bg-destructive/20 transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <label
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={`
        relative block border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-all duration-300
        ${isDragging ? "border-primary bg-primary/5 glow-accent" : "border-border hover:border-primary/40 glass-panel"}
      `}
    >
      <input type="file" accept={ACCEPTED.join(",")} onChange={handleChange} className="sr-only" />
      <Upload className={`w-10 h-10 mx-auto mb-4 transition-colors ${isDragging ? "text-primary" : "text-muted-foreground"}`} />
      <p className="text-foreground font-medium mb-1">Drop your 3D model here</p>
      <p className="text-sm text-muted-foreground font-mono">STL · OBJ · 3MF</p>
    </label>
  );
};

export default FileUploader;
