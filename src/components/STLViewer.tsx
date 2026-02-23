import { Suspense, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Center } from "@react-three/drei";
import * as THREE from "three";
import { AlertTriangle, Maximize2, Loader2 } from "lucide-react";
import { parseSTLFile, type STLData } from "@/lib/stlParser";

interface STLViewerProps {
  file: File;
  onModelParsed?: (data: STLData) => void;
}

function STLModel({ geometry }: { geometry: THREE.BufferGeometry }) {
  return (
    <mesh geometry={geometry} rotation={[-Math.PI / 2, 0, 0]}>
      <meshStandardMaterial color="#8C7864" wireframe={false} metalness={0.1} roughness={0.6} />
    </mesh>
  );
}

function BoundingBoxHelper({ geometry }: { geometry: THREE.BufferGeometry }) {
  const box = geometry.boundingBox!;
  const size = new THREE.Vector3();
  const center = new THREE.Vector3();
  box.getSize(size);
  box.getCenter(center);

  return (
    <group rotation={[-Math.PI / 2, 0, 0]}>
      <mesh position={[center.x, center.y, center.z]}>
        <boxGeometry args={[size.x, size.y, size.z]} />
        <meshBasicMaterial color="#4E4034" wireframe opacity={0.2} transparent />
      </mesh>
    </group>
  );
}

const MAX_SIZE = { x: 220, y: 220, z: 250 };

const STLViewer = ({ file, onModelParsed }: STLViewerProps) => {
  const [showWireframe, setShowWireframe] = useState(false);
  const [stlData, setStlData] = useState<STLData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    parseSTLFile(file)
      .then((data) => {
        setStlData(data);
        onModelParsed?.(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("STL parse error:", err);
        setError("Failed to parse STL file");
        setLoading(false);
      });
  }, [file]);

  const dims = stlData?.dimensions ?? { x: 0, y: 0, z: 0 };
  const exceeds = dims.x > MAX_SIZE.x || dims.y > MAX_SIZE.y || dims.z > MAX_SIZE.z;

  return (
    <div className="editorial-panel overflow-hidden border border-border">
      <div className="h-64 md:h-80 relative bg-secondary/30">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-8 h-8 text-walnut animate-spin" />
            <span className="ml-3 text-sm text-muted-foreground">Parsing model…</span>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full text-destructive text-sm">
            <AlertTriangle className="w-5 h-5 mr-2" /> {error}
          </div>
        ) : (
          <Canvas camera={{ position: [200, 150, 200], fov: 50 }} style={{ background: '#EDE9E1' }}>
            <ambientLight intensity={0.5} />
            <directionalLight position={[200, 200, 200]} intensity={0.7} />
            <directionalLight position={[-100, 100, -100]} intensity={0.3} />
            <Suspense fallback={null}>
              <Center>
                <STLModel geometry={stlData!.geometry} />
                {showWireframe && <BoundingBoxHelper geometry={stlData!.geometry} />}
              </Center>
            </Suspense>
            <OrbitControls enableDamping dampingFactor={0.05} />
            <gridHelper args={[500, 50, "#B7A996", "#D9D2C6"]} />
          </Canvas>
        )}

        {!loading && !error && (
          <div className="absolute top-3 right-3 flex gap-2">
            <button
              onClick={() => setShowWireframe(!showWireframe)}
              className="w-8 h-8 bg-background/80 backdrop-blur border border-border flex items-center justify-center hover:bg-secondary transition-colors"
              title="Toggle bounding box"
            >
              <Maximize2 className="w-3.5 h-3.5 text-foreground" />
            </button>
          </div>
        )}

        <div className="absolute bottom-3 left-3 text-xs font-mono text-muted-foreground bg-background/80 backdrop-blur px-2 py-1 border border-border">
          Rotate · Zoom · Pan
        </div>
      </div>

      {/* Dimensions bar */}
      <div className="px-4 py-3 border-t border-border flex items-center justify-between flex-wrap gap-2">
        <div className="flex gap-4 text-xs font-mono">
          <span className="text-muted-foreground">
            X: <span className="text-foreground font-medium">{dims.x.toFixed(1)}mm</span>
          </span>
          <span className="text-muted-foreground">
            Y: <span className="text-foreground font-medium">{dims.y.toFixed(1)}mm</span>
          </span>
          <span className="text-muted-foreground">
            Z: <span className="text-foreground font-medium">{dims.z.toFixed(1)}mm</span>
          </span>
        </div>
        <div className="flex gap-3 text-xs font-mono text-muted-foreground">
          {stlData && (
            <>
              <span>{stlData.volume} cm³</span>
              <span>{stlData.triangleCount.toLocaleString()} △</span>
            </>
          )}
          <span>Max: {MAX_SIZE.x}×{MAX_SIZE.y}×{MAX_SIZE.z}mm</span>
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
