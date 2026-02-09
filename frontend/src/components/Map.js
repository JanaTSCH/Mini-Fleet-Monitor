import React, { useEffect, useRef } from "react";
import "ol/ol.css";
import "../styles/map.css";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import XYZ from "ol/source/XYZ";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import { fromLonLat } from "ol/proj";
import { Style, Icon, Text, Fill, Stroke } from "ol/style";
import { boundingExtent } from "ol/extent";

const MAP_PIN_ICON =
  "data:image/svg+xml," +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="42" viewBox="0 0 32 42">
      <path fill="#DC2626" stroke="#fff" stroke-width="2" 
        d="M16 0C9.4 0 4 5.4 4 12c0 8 12 26 12 26s12-18 12-26c0-6.6-5.4-12-12-12z"/>
      <circle cx="16" cy="12" r="5" fill="#fff"/>
    </svg>
  `);

function MapComponent({ robots }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const vectorSourceRef = useRef(null);
  const viewRef = useRef(null);

  // 1. map init
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    vectorSourceRef.current = new VectorSource();
    viewRef.current = new View({
      center: fromLonLat([11.0328, 50.9787]),
      zoom: 14,
    });

    mapInstanceRef.current = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({
          source: new XYZ({
            url: "https://{a-d}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
          }),
        }),
        new VectorLayer({
          source: vectorSourceRef.current,
          style: (feature) =>
            new Style({
              image: new Icon({
                src: MAP_PIN_ICON,
                anchor: [0.5, 1],
                scale: 0.8,
              }),
              text: new Text({
                text: feature.get("name"),
                offsetY: -38,
                font: "bold 13px sans-serif",
                fill: new Fill({ color: "#171717" }),
                stroke: new Stroke({ color: "#fff", width: 3 }),
              }),
            }),
        }),
      ],
      view: viewRef.current,
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.setTarget(null);
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // 2. robots update (use data from backend)
  useEffect(() => {
    if (!vectorSourceRef.current || !robots || robots.length === 0) return;

    // clear map
    vectorSourceRef.current.clear();

    // add new robots
    const features = robots
      .map((robot) => {
        const lon = parseFloat(robot.lon || robot.longitude);
        const lat = parseFloat(robot.lat || robot.latitude);
        if (isNaN(lon) || isNaN(lat)) return null;

        return new Feature({
          geometry: new Point(fromLonLat([lon, lat])),
          name: robot.name,
        });
      })
      .filter(Boolean);

    vectorSourceRef.current.addFeatures(features);

    // centering
    if (features.length > 0 && viewRef.current) {
      const coords = features.map((f) => f.getGeometry().getCoordinates());
      const extent = boundingExtent(coords);

      if (!mapInstanceRef.current._userMoved) {
        viewRef.current.fit(extent, {
          padding: [80, 80, 80, 80],
          maxZoom: 16,
          duration: 0,
        });
      }
    }
  }, [robots]);

  // 3. checking if user moved the map
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const handleMoveEnd = () => {
      mapInstanceRef.current._userMoved = true;
    };

    mapInstanceRef.current.on("moveend", handleMoveEnd);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.un("moveend", handleMoveEnd);
      }
    };
  }, []);

  return <div ref={mapRef} className="map-container" />;
}

export default MapComponent;
