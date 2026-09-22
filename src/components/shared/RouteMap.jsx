import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Route, Clock, Zap } from "lucide-react";

// Luxury custom pin SVG icons
const createCustomIcon = (type, label) => {
  const isPickup = type === "pickup";
  const bg = isPickup ? "#c8102e" : "#161918";
  const border = isPickup ? "#ffffff" : "#c8102e";
  const iconLetter = isPickup ? "A" : "B";

  const html = `
    <div style="
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      cursor: pointer;
    ">
      <div style="
        background: ${bg};
        color: #ffffff;
        font-family: inherit;
        font-weight: 700;
        font-size: 11px;
        width: 26px;
        height: 26px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid ${border};
        box-shadow: 0 4px 12px rgba(0,0,0,0.35);
      ">
        ${iconLetter}
      </div>
      <div style="
        width: 0;
        height: 0;
        border-left: 5px solid transparent;
        border-right: 5px solid transparent;
        border-top: 6px solid ${bg};
        margin-top: -1px;
      "></div>
    </div>
  `;

  return L.divIcon({
    html,
    className: "custom-map-marker",
    iconSize: [26, 32],
    iconAnchor: [13, 32],
    popupAnchor: [0, -32],
  });
};

export default function RouteMap({
  pickupPlace,
  destinationPlace,
  routePoints = [],
  distanceKm,
  durationText,
  fareAmount,
  height = "320px",
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const pickupMarkerRef = useRef(null);
  const destMarkerRef = useRef(null);
  const polylineRef = useRef(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Switzerland default center [lat, lon]
    const defaultCenter = [46.8182, 8.2275];
    const map = L.map(mapContainerRef.current, {
      center: defaultCenter,
      zoom: 8,
      zoomControl: true,
      scrollWheelZoom: false,
    });

    // OpenStreetMap tiles — 100% free, no API key required
    L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        attribution: "",
        maxZoom: 19,
      },
    ).addTo(map);

    mapInstanceRef.current = map;

    // Force map to adapt to its container size
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 250);

    return () => {
      clearTimeout(timer);
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Markers and Route Polyline
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Handle Pickup Marker
    if (pickupPlace?.coordinates) {
      const [lon, lat] = pickupPlace.coordinates;
      if (!pickupMarkerRef.current) {
        pickupMarkerRef.current = L.marker([lat, lon], {
          icon: createCustomIcon("pickup"),
        }).addTo(map);
      } else {
        pickupMarkerRef.current.setLatLng([lat, lon]);
      }
      pickupMarkerRef.current.bindPopup(
        `<strong>Pickup:</strong><br/>${pickupPlace.structured_formatting?.main_text || pickupPlace.description}`,
      );
    } else if (pickupMarkerRef.current) {
      map.removeLayer(pickupMarkerRef.current);
      pickupMarkerRef.current = null;
    }

    // Handle Destination Marker
    if (destinationPlace?.coordinates) {
      const [lon, lat] = destinationPlace.coordinates;
      if (!destMarkerRef.current) {
        destMarkerRef.current = L.marker([lat, lon], {
          icon: createCustomIcon("destination"),
        }).addTo(map);
      } else {
        destMarkerRef.current.setLatLng([lat, lon]);
      }
      destMarkerRef.current.bindPopup(
        `<strong>Destination:</strong><br/>${destinationPlace.structured_formatting?.main_text || destinationPlace.description}`,
      );
    } else if (destMarkerRef.current) {
      map.removeLayer(destMarkerRef.current);
      destMarkerRef.current = null;
    }

    // Handle Route Polyline
    if (routePoints && routePoints.length > 0) {
      if (!polylineRef.current) {
        polylineRef.current = L.polyline(routePoints, {
          color: "#c8102e",
          weight: 5,
          opacity: 0.85,
          lineJoin: "round",
          lineCap: "round",
        }).addTo(map);
      } else {
        polylineRef.current.setLatLngs(routePoints);
      }

      // Smoothly fit the map bounds to the route
      try {
        const bounds = polylineRef.current.getBounds();
        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [45, 45], maxZoom: 15 });
        }
      } catch (e) {
        // Bounds fallback
      }
    } else if (polylineRef.current) {
      map.removeLayer(polylineRef.current);
      polylineRef.current = null;
    }

    const endpointPoints = [pickupPlace, destinationPlace]
      .filter((place) => place?.coordinates)
      .map((place) => {
        const [lon, lat] = place.coordinates;
        return [lat, lon];
      });

    if (endpointPoints.length > 1 && (!routePoints || routePoints.length === 0)) {
      map.fitBounds(L.latLngBounds(endpointPoints), {
        padding: [36, 36],
        maxZoom: 12,
      });
    } else if (endpointPoints.length === 1 && (!routePoints || routePoints.length === 0)) {
      map.setView(endpointPoints[0], 12);
    }
  }, [pickupPlace, destinationPlace, routePoints]);

  return (
    <div className="route-map-wrapper">
      <div
        ref={mapContainerRef}
        style={{
          width: "100%",
          height,
          borderRadius: "12px",
          overflow: "hidden",
          border: "1px solid rgba(0,0,0,0.1)",
          boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
        }}
      />

      {/* Floating trip summary card on map */}
      {(distanceKm || durationText || fareAmount) && (
        <div className="route-map-badge">
          {distanceKm && (
            <div className="map-badge-item">
              <Route size={14} className="badge-icon" />
              <span>
                <strong>{distanceKm} km</strong>
              </span>
            </div>
          )}
          {durationText && (
            <div className="map-badge-item">
              <Clock size={14} className="badge-icon" />
              <span>~{durationText}</span>
            </div>
          )}
          {fareAmount && (
            <div className="map-badge-item fare-badge">
              <Zap size={14} className="badge-icon" />
              <span>
                CHF <strong>{fareAmount.toLocaleString("en-CH")}</strong>
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
