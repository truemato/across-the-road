// main.js

import { createRoot } from "react-dom/client";
import React from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

let map, marker;
const socket = io("http://localhost:4000");

function Wheel() {
  return (
    <mesh>
      <torusGeometry args={[1, 0.5, 16, 100]} />
      <meshStandardMaterial color="blue" />
    </mesh>
  );
}

function Scene() {
  return (
    <Canvas>
      <ambientLight />
      <pointLight position={[10, 10, 10]} />
      <Wheel />
      <OrbitControls />
    </Canvas>
  );
}

// Google Mapsの初期化
window.initMap = initMap;

// Reactの初期化
const reactRoot = document.getElementById("react-root");
const root = createRoot(reactRoot);
root.render(<Scene />);
