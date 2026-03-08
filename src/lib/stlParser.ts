import * as THREE from "three";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";

export interface STLData {
  geometry: THREE.BufferGeometry;
  dimensions: { x: number; y: number; z: number }; // in mm
  volume: number; // in cm³
  surfaceArea: number; // in cm²
  triangleCount: number;
}

const ASCII_SOLID = "solid";
const BINARY_FACE_BYTE_SIZE = 50;
const BINARY_HEADER_SIZE = 84;

function startsWithSolid(buffer: ArrayBuffer): boolean {
  const bytes = new Uint8Array(buffer, 0, Math.min(256, buffer.byteLength));
  const header = new TextDecoder().decode(bytes).trimStart().toLowerCase();
  return header.startsWith(ASCII_SOLID);
}

function hasBinaryNullByte(buffer: ArrayBuffer): boolean {
  const bytes = new Uint8Array(buffer, 0, Math.min(256, buffer.byteLength));
  for (let i = 0; i < bytes.length; i++) {
    if (bytes[i] === 0) return true;
  }
  return false;
}

function isLikelyBinarySTL(buffer: ArrayBuffer): boolean {
  if (buffer.byteLength < BINARY_HEADER_SIZE) return false;

  const view = new DataView(buffer);
  const declaredFaces = view.getUint32(80, true);
  const expectedSize = BINARY_HEADER_SIZE + declaredFaces * BINARY_FACE_BYTE_SIZE;

  if (expectedSize === buffer.byteLength) return true;
  if (startsWithSolid(buffer)) return false;
  if (hasBinaryNullByte(buffer)) return true;

  // Fallback: if it doesn't look like ASCII STL, treat as binary.
  return true;
}

function parseBinarySTLSafely(buffer: ArrayBuffer): THREE.BufferGeometry {
  if (buffer.byteLength < BINARY_HEADER_SIZE) {
    throw new Error("STL file is too small to be valid.");
  }

  const view = new DataView(buffer);
  const declaredFaces = view.getUint32(80, true);
  const maxFacesFromSize = Math.floor((buffer.byteLength - BINARY_HEADER_SIZE) / BINARY_FACE_BYTE_SIZE);

  // Some exporters write corrupt face counts for large files.
  // Clamp to what the byte length can actually contain.
  const faceCount =
    declaredFaces > 0 && declaredFaces <= maxFacesFromSize ? declaredFaces : maxFacesFromSize;

  if (faceCount <= 0) {
    throw new Error("No triangles found in STL file.");
  }

  const positions = new Float32Array(faceCount * 9);
  const normals = new Float32Array(faceCount * 9);

  let offset = BINARY_HEADER_SIZE;
  let pOffset = 0;

  for (let face = 0; face < faceCount; face++) {
    if (offset + BINARY_FACE_BYTE_SIZE > buffer.byteLength) break;

    const nx = view.getFloat32(offset, true);
    const ny = view.getFloat32(offset + 4, true);
    const nz = view.getFloat32(offset + 8, true);
    offset += 12;

    for (let v = 0; v < 3; v++) {
      positions[pOffset] = view.getFloat32(offset, true);
      positions[pOffset + 1] = view.getFloat32(offset + 4, true);
      positions[pOffset + 2] = view.getFloat32(offset + 8, true);

      normals[pOffset] = nx;
      normals[pOffset + 1] = ny;
      normals[pOffset + 2] = nz;

      pOffset += 3;
      offset += 12;
    }

    offset += 2; // attribute byte count
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("normal", new THREE.BufferAttribute(normals, 3));

  return geometry;
}

function geometryIsValid(geom: THREE.BufferGeometry): boolean {
  geom.computeBoundingBox();
  const box = geom.boundingBox;
  if (!box) return false;
  return isFinite(box.min.x) && isFinite(box.max.x);
}

export async function parseSTLFile(file: File): Promise<STLData> {
  const buffer = await file.arrayBuffer();
  const loader = new STLLoader();

  let geometry: THREE.BufferGeometry;

  // Strategy: try STLLoader first (handles both ASCII & binary).
  // If it crashes (RangeError on huge files with corrupt header), use our safe binary parser.
  try {
    geometry = loader.parse(buffer);
    if (!geometryIsValid(geometry)) {
      throw new Error("STLLoader produced invalid geometry");
    }
  } catch {
    // STLLoader failed (likely corrupt face count for large binary files) — use safe parser
    geometry = parseBinarySTLSafely(buffer);
    if (!geometryIsValid(geometry)) {
      throw new Error("Unable to parse STL file — the file may be corrupt.");
    }
  }

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
