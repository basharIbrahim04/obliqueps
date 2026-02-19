import { type FileHealth } from "@/lib/estimator";
import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";

interface FileHealthCheckProps {
  health: FileHealth;
}

const statusIcon = (s: "ok" | "warn" | "error") => {
  if (s === "ok") return <CheckCircle2 className="w-4 h-4 text-green-500" />;
  if (s === "warn") return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
  return <XCircle className="w-4 h-4 text-destructive" />;
};

const FileHealthCheck = ({ health }: FileHealthCheckProps) => {
  const items = [
    { label: "Thin Walls", status: health.thinWalls },
    { label: "Overhang Risk", status: health.overhang },
    { label: "Support Needed", status: health.supportNeeded },
    { label: "Model Printable", status: health.printable },
  ];

  return (
    <div className="glass-panel rounded-lg p-4">
      <h4 className="text-xs font-display tracking-widest uppercase text-muted-foreground mb-3">File Diagnostics</h4>
      <div className="grid grid-cols-2 gap-2">
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-2 text-sm">
            {statusIcon(item.status)}
            <span className={item.status === "ok" ? "text-foreground" : item.status === "warn" ? "text-yellow-400" : "text-destructive"}>
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FileHealthCheck;
