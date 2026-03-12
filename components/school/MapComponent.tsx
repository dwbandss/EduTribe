"use client";

import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Icon, DivIcon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { School } from './SmartSchoolFinder';

// Fix for default markers in react-leaflet
delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapComponentProps {
  schools: School[];
  center?: [number, number];
  zoom?: number;
}

// Custom marker component
function SchoolMarker({ school }: { school: School }) {
  const [icon] = useState(() => 
    new DivIcon({
      className: 'custom-marker',
      html: `
        <div style="
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          color: white;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 12px;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        ">
          🏫
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32],
    })
  );

  return (
    <Marker
      position={[school.location.coordinates[1], school.location.coordinates[0]]}
      icon={icon}
    >
      <Popup>
        <div className="p-3 min-w-64">
          <h3 className="font-semibold text-lg mb-2">{school.name}</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="font-medium">Type:</span>
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                {school.type}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Location:</span>
              <span>{school.contact.city}, {school.contact.district}</span>
            </div>
            
            {/* Facilities */}
            <div className="flex flex-wrap gap-1">
              {school.facilities.hostel && (
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                  🏠 Hostel
                </span>
              )}
              {school.facilities.science && (
                <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">
                  🔬 Science
                </span>
              )}
              {school.facilities.sports && (
                <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs">
                  🏆 Sports
                </span>
              )}
            </div>

            {/* Academic Info */}
            <div className="flex flex-wrap gap-1">
              {school.academics.streams.map(stream => (
                <span key={stream} className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs">
                  {stream}
                </span>
              ))}
            </div>

            {/* Tribal Info */}
            {school.tribalInfo.tribalCategory && (
              <div className="bg-yellow-50 border border-yellow-200 p-2 rounded">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Category:</span>
                  <span className="text-yellow-800">{school.tribalInfo.tribalCategory}</span>
                </div>
                {school.tribalInfo.tribalPercentage && (
                  <div className="text-yellow-700 text-xs">
                    {school.tribalInfo.tribalPercentage}% tribal students
                  </div>
                )}
              </div>
            )}

            {/* Rating */}
            <div className="flex items-center gap-2">
              <span className="font-medium">Rating:</span>
              <div className="flex items-center">
                <span className="text-yellow-500">⭐</span>
                <span className="ml-1">{school.rating.toFixed(1)}</span>
                <span className="text-gray-500 text-xs">({school.reviewCount} reviews)</span>
              </div>
            </div>
          </div>
        </div>
      </Popup>
    </Marker>
  );
}

// Map bounds component
function MapBounds({ schools }: { schools: School[] }) {
  const map = useMap();
  
  useEffect(() => {
    if (!schools || schools.length === 0) return;
    
    const bounds: [number, number][] = schools.map(school => [
      school.location.coordinates[1],
      school.location.coordinates[0]
    ]);
    
    if (bounds.length > 0) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [schools, map]);

  return null;
}

export default function MapComponent({ schools, center = [20.5937, 78.9629], zoom = 5 }: MapComponentProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="w-full h-full bg-muted animate-pulse rounded-lg flex items-center justify-center">
        <div className="text-muted-foreground">Loading map...</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      {(!schools || schools.length === 0) ? (
        <div className="h-full flex items-center justify-center bg-muted rounded-lg">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 text-muted-foreground">🗺️</div>
            <h3 className="text-lg font-semibold mb-2">No Schools Found</h3>
            <p className="text-muted-foreground">Try searching for schools in your area</p>
          </div>
        </div>
      ) : (
        <MapContainer
          center={center}
          zoom={zoom}
          style={{ height: '100%', width: '100%' }}
          className="rounded-lg"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {schools && schools.map((school) => (
            <SchoolMarker key={school._id} school={school} />
          ))}
          
          <MapBounds schools={schools} />
        </MapContainer>
      )}
    </div>
  );
}
