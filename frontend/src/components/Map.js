import React, { useEffect, useRef } from "react";
import "ol/ol.css";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import { fromLonLat } from "ol/proj";
import { Style, Circle, Fill, Stroke, Text } from "ol/style";

function MapComponent({ robots }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const vectorSourceRef = useRef(null);
  const featuresRef = useRef({});

  useEffect(() => {
    vectorSourceRef.current = new VectorSource();

    const vectorLayer = new VectorLayer({
      source: vectorSourceRef.current,
      style: (feature) => {
        const status = feature.get("status");
        const color = status === "moving" ? "#4CAF50" : "#FF9800";

        return new Style({
          image: new Circle({
            radius: 8,
            fill: new Fill({ color }),
            stroke: new Stroke({ color: "white", width: 2 }),
          }),
          text: new Text({
            text: feature.get("name"),
            offsetY: -15,
            font: "12px sans-serif",
            fill: new Fill({ color: "#000" }),
            stroke: new Stroke({ color: "#fff", width: 2 }),
          }),
        });
      },
    });

    mapInstanceRef.current = new Map({
      target: mapRef.current,
      layers: [new TileLayer({ source: new OSM() }), vectorLayer],
      view: new View({
        center: fromLonLat([11.0328, 50.9787]), // Erfurt
        zoom: 13,
      }),
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.setTarget(null);
      }
    };
  }, []);

  useEffect(() => {
    if (!vectorSourceRef.current) return;

    robots.forEach((robot) => {
      const coords = fromLonLat([robot.lon, robot.lat]);

      if (featuresRef.current[robot.id]) {
        // Update marker
        featuresRef.current[robot.id].getGeometry().setCoordinates(coords);
        featuresRef.current[robot.id].set("status", robot.status);
      } else {
        // Create new marker
        const feature = new Feature({
          geometry: new Point(coords),
          name: robot.name,
          status: robot.status,
        });

        featuresRef.current[robot.id] = feature;
        vectorSourceRef.current.addFeature(feature);
      }
    });
  }, [robots]);

  return <div ref={mapRef} style={{ width: "100%", height: "600px" }} />;
}

export default MapComponent;
