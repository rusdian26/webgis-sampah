import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-geosearch/dist/geosearch.css';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import L from 'leaflet';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const SearchField = () => {
  const map = useMap();
  useEffect(() => {
    const provider = new OpenStreetMapProvider();
    const searchControl = new GeoSearchControl({
      provider: provider,
      style: 'bar',
      showMarker: false,
      showPopup: false,
      autoClose: true,
      retainZoomLevel: false,
      animateZoom: true,
      keepResult: false,
      searchLabel: 'Cari lokasi (Misal: Jakarta)'
    });
    map.addControl(searchControl);
    return () => map.removeControl(searchControl);
  }, [map]);
  return null;
};

const LocationMarker = ({ position, setPosition }) => {
  useMapEvents({
    click(e) {
      if (setPosition) setPosition(e.latlng);
    },
  });
  return position === null ? null : (
    <Marker position={position}>
      <Popup>Lokasi Terpilih</Popup>
    </Marker>
  );
};

const getCustomIcon = (color) => {
  return new L.divIcon({
    className: 'custom-icon',
    html: `<div style="background-color: ${color || '#3b82f6'}; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.4);"></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });
};

const Map = ({ center = [-6.200000, 106.816666], zoom = 13, markers = [], interactive = false, selectedPosition = null, onPositionSelect = null, height = '500px' }) => {
  return (
    <div className="rounded-md overflow-hidden z-0 relative" style={{ height: height, width: '100%', minHeight: '400px' }}>
      <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%', zIndex: 0 }}>
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <SearchField />
        
        {markers.map((marker, index) => (
          <Marker key={index} position={marker.position} icon={marker.color ? getCustomIcon(marker.color) : DefaultIcon}>
            <Popup>
              {marker.popupContent || 'Lokasi'}
            </Popup>
          </Marker>
        ))}

        {interactive && (
          <LocationMarker position={selectedPosition} setPosition={onPositionSelect} />
        )}
      </MapContainer>
    </div>
  );
};

export default Map;
