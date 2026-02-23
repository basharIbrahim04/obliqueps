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

  // Dimensions in mm (STL files are typically in mm)
  const dimensions = {
    x: Math.round(size.x * 100) / 100,
    y: Math.round(size.y * 100) / 100,
    z: Math.round(size.z * 100) / 100,
  };

  // Calculate volume using signed tetrahedron method
  const position = geometry.getAttribute("position");
  let volume = 0;
  let surfaceArea = 0;
  const triangleCount = position.count / 3;

  const vA = new THREE.Vector3();
  const vB = new THREE.Vector3();
  const vC = new THREE.Vector3();

  const ab = new THREE.Vector3();
  const ac = new THREE.Vector3();

  for (let i = 0; i < triangleCount; i++) {
    vA.fromBufferAttribute(position, i * 3);
    vB.fromBufferAttribute(position, i * 3 + 1);
    vC.fromBufferAttribute(position, i * 3 + 2);

    // Signed volume of tetrahedron formed with origin
    volume +=
      vA.x * (vB.y * vC.z - vC.y * vB.z) -
      vB.x * (vA.y * vC.z - vC.y * vA.z) +
      vC.x * (vA.y * vB.z - vB.y * vA.z);

    // Triangle area
    ab.subVectors(vB, vA);
    ac.subVectors(vC, vA);
    surfaceArea += ab.cross(ac).length() / 2;
  }

  volume = Math.abs(volume / 6);

  // Convert mm³ to cm³
  const volumeCm3 = Math.round((volume / 1000) * 100) / 100;
  // Convert mm² to cm²
  const surfaceAreaCm2 = Math.round((surfaceArea / 100) * 100) / 100;

  return {
    geometry,
    dimensions,
    volume: volumeCm3,
    surfaceArea: surfaceAreaCm2,
    triangleCount,
  };
}
