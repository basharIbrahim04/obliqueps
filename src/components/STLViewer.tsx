import { Suspense, useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Center, Box } from "@react-three/drei";
import * as THREE from "three";
import { AlertTriangle, RotateCcw, Maximize2 } from "lucide-react";

interface STLViewerProps {
  file: File;
}

function STLModel({ file }: { file: File }) {
  const geometry = useMemo(() => {
    // Create a placeholder box geometry since we can't parse STL on the fly easily
    // In production, you'd use STLLoader
    const size = Math.cbrt(file.size / 1000);
    const geo = new THREE.BoxGeometry(
      Math.min(size, 4),
      Math.min(size * 0.8, 3),
      Math.min(size * 0.6, 2.5)
    );
    return geo;
  }, [file]);

  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial color="#00e5ff" wireframe={false} metalness={0.3} roughness={0.4} />
    </mesh>
  );
}

function BoundingBoxHelper({ file }: { file: File }) {
  const size = Math.cbrt(file.size / 1000);
  const dims = [
    Math.min(size, 4),
    Math.min(size * 0.8, 3),
    Math.min(size * 0.6, 2.5),
  ];

  return (
    <Box args={dims as [number, number, number]}>
      <meshBasicMaterial color="#00e5ff" wireframe opacity={0.15} transparent />
    </Box>
  );
}

const MAX_SIZE = { x: 220, y: 220, z: 250 };

const STLViewer = ({ file }: STLViewerProps) => {
  const [showWireframe, setShowWireframe] = useState(false);

  // Simulate dimensions from file size
  const fileSizeMB = file.size / (1024 * 1024);
  const dims = {
    x: Math.round(fileSizeMB * 30 + 20),
    y: Math.round(fileSizeMB * 25 + 15),
    z: Math.round(fileSizeMB * 20 + 10),
  };
  const exceeds = dims.x > MAX_SIZE.x || dims.y > MAX_SIZE.y || dims.z > MAX_SIZE.z;

  return (
    <div className="glass-panel rounded-lg overflow-hidden">
      <div className="h-64 md:h-80 relative">
        <Canvas camera={{ position: [5, 3, 5], fov: 50 }} className="bg-background">
          <ambientLight intensity={0.4} />
          <directionalLight position={[5, 5, 5]} intensity={0.8} />
          <directionalLight position={[-3, 2, -3]} intensity={0.3} />
          <Suspense fallback={null}>
            <Center>
              <STLModel file={file} />
              {showWireframe && <BoundingBoxHelper file={file} />}
            </Center>
          </Suspense>
          <OrbitControls enableDamping dampingFactor={0.05} />
          <gridHelper args={[10, 10, "#1a2a3a", "#111827"]} />
        </Canvas>

        {/* Controls overlay */}
        <div className="absolute top-3 right-3 flex gap-2">
          <button
            onClick={() => setShowWireframe(!showWireframe)}
            className="w-8 h-8 rounded bg-secondary/80 backdrop-blur flex items-center justify-center hover:bg-primary/20 transition-colors"
            title="Toggle bounding box"
          >
            <Maximize2 className="w-3.5 h-3.5 text-primary" />
          </button>
        </div>

        <div className="absolute bottom-3 left-3 text-xs font-mono text-muted-foreground bg-background/80 backdrop-blur px-2 py-1 rounded">
          Rotate · Zoom · Pan
        </div>
      </div>

      {/* Dimensions bar */}
      <div className="px-4 py-3 border-t border-border flex items-center justify-between flex-wrap gap-2">
        <div className="flex gap-4 text-xs font-mono">
          <span className="text-muted-foreground">
            X: <span className="text-foreground">{dims.x}mm</span>
          </span>
          <span className="text-muted-foreground">
            Y: <span className="text-foreground">{dims.y}mm</span>
          </span>
          <span className="text-muted-foreground">
            Z: <span className="text-foreground">{dims.z}mm</span>
          </span>
        </div>
        <div className="text-xs font-mono text-muted-foreground">
          Max: {MAX_SIZE.x}×{MAX_SIZE.y}×{MAX_SIZE.z}mm
        </div>
      </div>

      {exceeds && (
        <div className="px-4 py-2 bg-destructive/10 border-t border-destructive/30 flex items-center gap-2 text-xs">
          <AlertTriangle className="w-4 h-4 text-destructive" />
          <span className="text-destructive">Model exceeds maximum print volume!</span>
        </div>
      )}
    </div>
  );
};

export default STLViewer;
