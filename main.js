import { createRoot } from "react-dom/client";
import React from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

let map, marker;
const socket = io("http://localhost:4000");

function initMap() {
  const tokyoTower = { lat: 35.6586, lng: 139.7454 };
  const initialPosition = { lat: 35.6895, lng: 139.6917 };

  map = new google.maps.Map(document.getElementById("map"), {
    center: initialPosition,
    zoom: 14,
  });

  marker = new google.maps.Marker({
    position: initialPosition,
    map: map,
    title: "Current Position",
  });

  // サーバーからのリアルタイムデータで更新
  socket.on("locationUpdate", ({ lat, lng }) => {
    const newPosition = { lat, lng };
    map.setCenter(newPosition);
    marker.setPosition(newPosition);
  });
}

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
