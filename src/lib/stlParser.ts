import * as THREE from "three";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";

export interface STLData {
  geometry: THREE.BufferGeometry;
  dimensions: { x: number; y: number; z: number }; // in mm
  volume: number; // in cm³
  surfaceArea: number; // in cm²
  triangleCount: number;
}

export async function parseSTLFile(file: File): Promise<STLData> {
  const buffer = await file.arrayBuffer();
  const loader = new STLLoader();
  const geometry = loader.parse(buffer);

  geometry.computeBoundingBox();
  const box = geometry.boundingBox!;
  const size = new THREE.Vector3();
  box.getSize(size);

  const dimensions = {
    x: Math.round(size.x * 100) / 100,
    y: Math.round(size.y * 100) / 100,
    z: Math.round(size.z * 100) / 100,
  };

  const position = geometry.getAttribute("position");
  const triangleCount = position.count / 3;

  // For large models, sample triangles to avoid freezing the browser
  const SAMPLE_THRESHOLD = 500_000;
  const shouldSample = triangleCount > SAMPLE_THRESHOLD;
  const sampleCount = shouldSample ? SAMPLE_THRESHOLD : triangleCount;
  const sampleRatio = shouldSample ? triangleCount / sampleCount : 1;

  let volume = 0;
  let surfaceArea = 0;

  const vA = new THREE.Vector3();
  const vB = new THREE.Vector3();
  const vC = new THREE.Vector3();
  const ab = new THREE.Vector3();
  const ac = new THREE.Vector3();

  // Process in chunks to avoid blocking the main thread
  const CHUNK_SIZE = 50_000;
  const processChunk = (startSample: number, endSample: number) => {
    for (let s = startSample; s < endSample; s++) {
      const i = shouldSample ? Math.floor(s * sampleRatio) : s;
      vA.fromBufferAttribute(position, i * 3);
      vB.fromBufferAttribute(position, i * 3 + 1);
      vC.fromBufferAttribute(position, i * 3 + 2);

      volume +=
        vA.x * (vB.y * vC.z - vC.y * vB.z) -
        vB.x * (vA.y * vC.z - vC.y * vA.z) +
        vC.x * (vA.y * vB.z - vB.y * vA.z);

      ab.subVectors(vB, vA);
      ac.subVectors(vC, vA);
      surfaceArea += ab.cross(ac).length() / 2;
    }
  };

  // Yield to the main thread between chunks
  for (let start = 0; start < sampleCount; start += CHUNK_SIZE) {
    const end = Math.min(start + CHUNK_SIZE, sampleCount);
    processChunk(start, end);
    if (end < sampleCount) {
      await new Promise((r) => setTimeout(r, 0));
    }
  }

  // Scale up sampled values to approximate the full model
  if (shouldSample) {
    volume *= sampleRatio;
    surfaceArea *= sampleRatio;
  }

  volume = Math.abs(volume / 6);
  const volumeCm3 = Math.round((volume / 1000) * 100) / 100;
  const surfaceAreaCm2 = Math.round((surfaceArea / 100) * 100) / 100;

  return {
    geometry,
    dimensions,
    volume: volumeCm3,
    surfaceArea: surfaceAreaCm2,
    triangleCount,
  };
}
