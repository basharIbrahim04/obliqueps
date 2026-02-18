import { useCallback, useState } from "react";
import { Upload, FileBox, X } from "lucide-react";

interface FileUploaderProps {
  onFileSelected: (file: File) => void;
  selectedFile: File | null;
  onClear: () => void;
}

const ACCEPTED = [".stl", ".obj", ".3mf", ".step", ".stp"];

const FileUploader = ({ onFileSelected, selectedFile, onClear }: FileUploaderProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) onFileSelected(file);
    },
    [onFileSelected]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFileSelected(file);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (selectedFile) {
    return (
      <div className="border border-primary/30 bg-card rounded-lg p-6 glow-accent">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileBox className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="font-medium text-foreground">{selectedFile.name}</p>
              <p className="text-sm text-muted-foreground font-display">
                {formatSize(selectedFile.size)}
              </p>
            </div>
          </div>
          <button
            onClick={onClear}
            className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center hover:bg-surface-hover transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <label
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={`
        relative block border-2 border-dashed rounded-lg p-12 text-center cursor-pointer
        transition-all duration-300
        ${isDragging ? "border-primary bg-primary/5 glow-accent" : "border-border hover:border-primary/40 hover:bg-card"}
      `}
    >
      <input
        type="file"
        accept={ACCEPTED.join(",")}
        onChange={handleChange}
        className="sr-only"
      />
      <Upload className={`w-10 h-10 mx-auto mb-4 transition-colors ${isDragging ? "text-primary" : "text-muted-foreground"}`} />
      <p className="text-foreground font-medium mb-1">
        Drop your 3D model here
      </p>
      <p className="text-sm text-muted-foreground">
        or click to browse — STL, OBJ, 3MF, STEP
      </p>
    </label>
  );
};

export default FileUploader;
