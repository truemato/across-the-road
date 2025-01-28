let map;
let streetView;
//const socket = io("http://localhost:4000"); // サーバーのSocket.IOに接続

// Google Maps APIの初期化
function initMap() {
  const initialPosition = { lat: 35.6586, lng: 139.7454 }; // 東京タワーの緯度経度

  // ストリートビューの初期化
  streetView = new google.maps.StreetViewPanorama(
    document.getElementById("street-view"),
    {
      position: initialPosition,
      pov: {
        heading: 34,
        pitch: 10,
      },
      zoom: 1,
    }
  );

  // Google Mapsとの連動をオフ
  map = new google.maps.Map(document.createElement("div"), {
    streetView: streetView,
  });

  // サーバーからロケーションを受信
  socket.on("locationUpdate", (data) => {
    console.log("Received location:", data);

    const { lat, lng, placename } = data;
    if (lat && lng) {
      // ストリートビューを更新
      streetView.setPosition({ lat, lng });

      // POSTリクエストでDBに地名を送信
      fetch("/api/update-location", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lat, lng, placename }),
      })
        .then((res) => res.json())
        .then((response) => console.log("Location updated:", response))
        .catch((error) => console.error("Error updating location:", error));
    }
  });
}

// Google Maps APIの初期化をWindowロード時に実行
window.initMap = initMap;
