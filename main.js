// main.js

import { createRoot } from "react-dom/client";
import React from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

let map, marker;
const socket = io("http://localhost:4000");


let currentLat = 0;
let currentLng = 0;


function initMap() {
  const tokyoTower = { lat: currentLat, lng: currentLng };
  const initialPosition = { lat: currentLat, lng: currentLng };

  socket.on("sensorData", (data) => {
    console.log("Received data from server:", data);
  
    // ブラウザにデータを表示 (例: 地図やストリートビューを更新)
    const logElement = document.getElementById("sensor-log");
    logElement.textContent = `Current Value: ${data.value}, Total: ${data.total}`;
  });
  
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
