import { useState, MouseEvent, useRef } from 'react';
import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';
import { encode, decode, getNeighbors } from './logic';
import Slider from '../../components/shared/Slider';
import ControlPanel from '../../components/shared/ControlPanel';

const MAP_WIDTH = 800;
const MAP_HEIGHT = 500;

// Convert lat/lng to canvas coordinates
function latLngToXY(lat: number, lng: number): { x: number; y: number } {
  const x = ((lng + 180) / 360) * MAP_WIDTH;
  const y = ((90 - lat) / 180) * MAP_HEIGHT;
  return { x, y };
}

// Convert canvas coordinates to lat/lng
function xyToLatLng(x: number, y: number): { lat: number; lng: number } {
  const lng = (x / MAP_WIDTH) * 360 - 180;
  const lat = 90 - (y / MAP_HEIGHT) * 180;
  return { lat, lng };
}

function GeoHashVisualizer() {
  const [precision, setPrecision] = useState(4);
  const [lat, setLat] = useState(25.033);
  const [lng, setLng] = useState(121.565);
  const [showNeighbors, setShowNeighbors] = useState(true);
  const svgRef = useRef<SVGSVGElement>(null);

  const geohash = encode(lat, lng, precision);
  const { bounds } = decode(geohash);
  const neighbors = getNeighbors(geohash);

  // Click map to set position
  const handleMapClick = (e: MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;

    const rect = svgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const { lat: newLat, lng: newLng } = xyToLatLng(x, y);
    setLat(Number(newLat.toFixed(3)));
    setLng(Number(newLng.toFixed(3)));
  };

  // Draw GeoHash region
  const drawGeohashRect = (hash: string, color: string, strokeWidth: number = 1) => {
    const { bounds: b } = decode(hash);
    const topLeft = latLngToXY(b.maxLat, b.minLng);
    const bottomRight = latLngToXY(b.minLat, b.maxLng);

    return (
      <rect
        x={topLeft.x}
        y={topLeft.y}
        width={bottomRight.x - topLeft.x}
        height={bottomRight.y - topLeft.y}
        fill={color}
        stroke="#2C5F7C"
        strokeWidth={strokeWidth}
      />
    );
  };

  const currentPos = latLngToXY(lat, lng);

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Control Panel */}
      <div className="lg:w-80 flex-shrink-0">
        <ControlPanel title="Control Panel">
          {/* Lat/Lng Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Latitude</label>
            <input
              type="number"
              value={lat}
              onChange={(e) => setLat(Number(e.target.value))}
              step="0.001"
              min="-90"
              max="90"
              className="w-full px-3 py-2 border-2 border-borderGray rounded-lg focus:border-pastelBlue focus:outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Longitude</label>
            <input
              type="number"
              value={lng}
              onChange={(e) => setLng(Number(e.target.value))}
              step="0.001"
              min="-180"
              max="180"
              className="w-full px-3 py-2 border-2 border-borderGray rounded-lg focus:border-pastelBlue focus:outline-none"
            />
          </div>

          {/* Precision */}
          <Slider
            label="Precision"
            value={precision}
            min={1}
            max={8}
            onChange={setPrecision}
          />

          {/* Show Neighbors */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showNeighbors}
              onChange={(e) => setShowNeighbors(e.target.checked)}
              className="w-4 h-4 accent-pastelBlue cursor-pointer"
            />
            <span className="text-sm font-medium text-gray-700">Show neighbor regions</span>
          </label>

          {/* GeoHash Result */}
          <div className="p-4 bg-pastelBlue bg-opacity-20 rounded-lg border-2 border-borderBlue">
            <p className="text-xs font-semibold text-gray-700 mb-2">GeoHash:</p>
            <p className="text-2xl font-bold text-borderBlue font-mono break-all">
              {geohash}
            </p>
          </div>

          {/* Bounds Info */}
          <div className="text-xs text-gray-600 space-y-1 p-3 bg-gray-50 rounded-lg">
            <p><span className="font-semibold">Latitude range:</span> {bounds.minLat.toFixed(4)} ~ {bounds.maxLat.toFixed(4)}</p>
            <p><span className="font-semibold">Longitude range:</span> {bounds.minLng.toFixed(4)} ~ {bounds.maxLng.toFixed(4)}</p>
          </div>

          <div className="text-sm text-gray-600 p-3 bg-pastelBlue bg-opacity-20 rounded-lg border border-borderBlue">
            <p className="font-semibold mb-2">Instructions:</p>
            <ul className="space-y-1 text-xs">
              <li>• Click map to set position</li>
              <li>• Enter lat/lng to view encoding</li>
              <li>• Adjust precision for granularity</li>
            </ul>
          </div>
        </ControlPanel>
      </div>

      {/* Map */}
      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <div className="relative">
          <svg
            ref={svgRef}
            width={MAP_WIDTH}
            height={MAP_HEIGHT}
            className="border-2 border-borderGray rounded-xl bg-white cursor-crosshair shadow-soft-md"
            onClick={handleMapClick}
          >
            {/* Background Grid */}
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#E5E7EB" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width={MAP_WIDTH} height={MAP_HEIGHT} fill="url(#grid)" />

            {/* Neighbor Regions */}
            {showNeighbors && (
              <>
                {drawGeohashRect(neighbors.n, 'rgba(170, 227, 168, 0.3)')}
                {drawGeohashRect(neighbors.ne, 'rgba(170, 227, 168, 0.3)')}
                {drawGeohashRect(neighbors.e, 'rgba(170, 227, 168, 0.3)')}
                {drawGeohashRect(neighbors.se, 'rgba(170, 227, 168, 0.3)')}
                {drawGeohashRect(neighbors.s, 'rgba(170, 227, 168, 0.3)')}
                {drawGeohashRect(neighbors.sw, 'rgba(170, 227, 168, 0.3)')}
                {drawGeohashRect(neighbors.w, 'rgba(170, 227, 168, 0.3)')}
                {drawGeohashRect(neighbors.nw, 'rgba(170, 227, 168, 0.3)')}
              </>
            )}

            {/* Current GeoHash Region */}
            {drawGeohashRect(geohash, 'rgba(168, 216, 234, 0.4)', 3)}

            {/* Current Position Marker */}
            <motion.g
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 20 }}
            >
              <circle
                cx={currentPos.x}
                cy={currentPos.y}
                r={8}
                fill="#FF6B6B"
                stroke="white"
                strokeWidth={3}
              />
              <MapPin
                x={currentPos.x - 12}
                y={currentPos.y - 32}
                size={24}
                className="text-red-500"
                fill="#FF6B6B"
                stroke="white"
                strokeWidth={2}
              />
            </motion.g>

            {/* GeoHash Text Label */}
            <text
              x={currentPos.x}
              y={currentPos.y + 25}
              textAnchor="middle"
              className="text-xs font-bold fill-borderBlue"
              style={{ textShadow: '0 0 3px white, 0 0 3px white' }}
            >
              {geohash}
            </text>
          </svg>

          {/* Legend */}
          <div className="mt-4 flex items-center gap-6 text-xs text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-pastelBlue bg-opacity-40 border-2 border-borderBlue rounded"></div>
              <span>Current GeoHash</span>
            </div>
            {showNeighbors && (
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-pastelGreen bg-opacity-30 border border-borderGray rounded"></div>
                <span>Neighbor Regions</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default GeoHashVisualizer;
