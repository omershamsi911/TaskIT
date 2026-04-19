// src/components/MapView.jsx
import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

const providers = [
  { id: 1, name: "Ali Plumber", lng: 67.0011, lat: 24.8607, type: "plumber" },
  { id: 2, name: "Khan Electric", lng: 67.0100, lat: 24.8650, type: "electrician" },
];

export default function MapView({ search }) {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    if (mapRef.current) return;

    mapRef.current = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://tiles.openfreemap.org/styles/bright", // free style
      center: [67.0011, 24.8607], // Karachi
      zoom: 12,
    });

    mapRef.current.addControl(new maplibregl.NavigationControl());

    providers.forEach((provider) => {
      const el = document.createElement("div");
      el.className = "marker";

      new maplibregl.Marker(el)
        .setLngLat([provider.lng, provider.lat])
        .setPopup(
          new maplibregl.Popup().setHTML(
            `<h4>${provider.name}</h4><p>${provider.type}</p>`
          )
        )
        .addTo(mapRef.current);
    });
  }, []);

  return <div ref={mapContainer} style={{ width: "100%", height: "500px" }} />;
}