"use client";

import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix deafult marker icon issue in Next.js
const icon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

type Props = {
    center: [number, number];
    zoom?: number;
    markers?: {
        position: [number, number];
        title: string;
        color?: string; // We can use custom icons for colors later
    }[];
    route?: [number, number][]; // Line between points
};

export default function Map({ center, zoom = 13, markers = [], route = [] }: Props) {
    return (
        <MapContainer center={center} zoom={zoom} scrollWheelZoom={false} className="h-full w-full rounded-xl z-0">
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {markers.map((marker, i) => (
                <Marker key={i} position={marker.position} icon={icon}>
                    <Popup>{marker.title}</Popup>
                </Marker>
            ))}
            {route.length > 0 && <Polyline positions={route} color="blue" />}
        </MapContainer>
    );
}
