import React, { useEffect, useRef } from "react";
import "ol/ol.css";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import XYZ from "ol/source/XYZ";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import { fromLonLat } from "ol/proj";
import { Style, Icon, Text, Fill } from "ol/style";

// MapPin черный (из Lucide)
const MAP_PIN_ICON =
  "data:image/svg+xml," +
  encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
`);

function MapComponent({ robots }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const vectorSourceRef = useRef(null);
  const featuresRef = useRef({});

  useEffect(() => {
    if (!mapRef.current) return;

    vectorSourceRef.current = new VectorSource();

    const vectorLayer = new VectorLayer({
      source: vectorSourceRef.current,
      style: (feature) =>
        new Style({
          image: new Icon({
            src: MAP_PIN_ICON,
            anchor: [0.5, 1],
          }),
          text: new Text({
            text: feature.get("name"),
            offsetY: -32,
            font: "bold 12px sans-serif",
            fill: new Fill({ color: "#000" }),
          }),
        }),
    });

    mapInstanceRef.current = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({
          source: new XYZ({
            url: "https://{a-d}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
          }),
        }),
        vectorLayer,
      ],
      view: new View({
        center: fromLonLat([11.0328, 50.9787]),
        zoom: 14,
      }),
    });

    return () => mapInstanceRef.current?.setTarget(null);
  }, []);

  useEffect(() => {
    if (!vectorSourceRef.current || !robots) return;

    robots.forEach((robot) => {
      const coords = fromLonLat([
        parseFloat(robot.lon || robot.longitude),
        parseFloat(robot.lat || robot.latitude),
      ]);

      const existing = featuresRef.current[robot.id];

      if (existing && vectorSourceRef.current.hasFeature(existing)) {
        existing.getGeometry().setCoordinates(coords);
      } else {
        const feature = new Feature({
          geometry: new Point(coords),
          name: robot.name,
        });
        featuresRef.current[robot.id] = feature;
        vectorSourceRef.current.addFeature(feature);
      }
    });
  }, [robots]);

  return <div ref={mapRef} style={{ width: "100%", height: "100%" }} />;
}

export default MapComponent;
