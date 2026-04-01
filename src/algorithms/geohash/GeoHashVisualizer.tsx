import { useState, MouseEvent, useRef } from 'react';
import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';
import { encode, decode, getNeighbors } from './logic';
import Slider from '../../components/shared/Slider';

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
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Control Panel - Apple Style */}
      <div className="lg:w-80 flex-shrink-0">
        <div className="space-y-6">
          <div className="bg-gray-50 rounded-2xl p-6 space-y-5">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
              Location
            </h3>

            {/* Lat/Lng Input */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-600 uppercase tracking-wider">Latitude</label>
              <input
                type="number"
                value={lat}
                onChange={(e) => setLat(Number(e.target.value))}
                step="0.001"
                min="-90"
                max="90"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-600 uppercase tracking-wider">Longitude</label>
              <input
                type="number"
                value={lng}
                onChange={(e) => setLng(Number(e.target.value))}
                step="0.001"
                min="-180"
                max="180"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
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
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={showNeighbors}
                onChange={(e) => setShowNeighbors(e.target.checked)}
                className="w-5 h-5 accent-blue-600 cursor-pointer rounded"
              />
              <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">Show neighbor regions</span>
            </label>
          </div>

          {/* GeoHash Result - Apple Style */}
          <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg shadow-blue-500/20">
            <p className="text-xs font-semibold uppercase tracking-wider opacity-80 mb-3">GeoHash</p>
            <p className="text-3xl font-bold font-mono break-all leading-tight">
              {geohash}
            </p>
          </div>

          {/* Bounds Info */}
          <div className="bg-gray-50 rounded-2xl p-6 space-y-3">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
              Bounds
            </h3>
            <div className="text-sm text-gray-600 space-y-2">
              <div>
                <p className="text-xs text-gray-500 font-medium mb-1">Latitude range</p>
                <p className="font-mono">{bounds.minLat.toFixed(4)} ~ {bounds.maxLat.toFixed(4)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium mb-1">Longitude range</p>
                <p className="font-mono">{bounds.minLng.toFixed(4)} ~ {bounds.maxLng.toFixed(4)}</p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-blue-900 mb-3">How to use</h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">•</span>
                <span>Click map to set position</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">•</span>
                <span>Enter lat/lng to view encoding</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">•</span>
                <span>Adjust precision for granularity</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Map - Apple Style */}
      <div className="flex-1 flex flex-col items-center justify-center gap-6">
        <div className="relative">
          <svg
            ref={svgRef}
            width={MAP_WIDTH}
            height={MAP_HEIGHT}
            className="border border-gray-200 rounded-3xl bg-white cursor-crosshair shadow-xl shadow-gray-200/50"
            onClick={handleMapClick}
          >
            {/* Background Grid */}
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#F3F4F6" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width={MAP_WIDTH} height={MAP_HEIGHT} fill="url(#grid)" />

            {/* Neighbor Regions */}
            {showNeighbors && (
              <>
                {drawGeohashRect(neighbors.n, 'rgba(147, 197, 253, 0.15)')}
                {drawGeohashRect(neighbors.ne, 'rgba(147, 197, 253, 0.15)')}
                {drawGeohashRect(neighbors.e, 'rgba(147, 197, 253, 0.15)')}
                {drawGeohashRect(neighbors.se, 'rgba(147, 197, 253, 0.15)')}
                {drawGeohashRect(neighbors.s, 'rgba(147, 197, 253, 0.15)')}
                {drawGeohashRect(neighbors.sw, 'rgba(147, 197, 253, 0.15)')}
                {drawGeohashRect(neighbors.w, 'rgba(147, 197, 253, 0.15)')}
                {drawGeohashRect(neighbors.nw, 'rgba(147, 197, 253, 0.15)')}
              </>
            )}

            {/* Current GeoHash Region */}
            {drawGeohashRect(geohash, 'rgba(59, 130, 246, 0.2)', 2)}

            {/* Current Position Marker */}
            <motion.g
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 20 }}
            >
              <circle
                cx={currentPos.x}
                cy={currentPos.y}
                r={10}
                fill="#EF4444"
                stroke="white"
                strokeWidth={3}
                className="drop-shadow-lg"
              />
              <MapPin
                x={currentPos.x - 12}
                y={currentPos.y - 32}
                size={24}
                className="text-red-500 drop-shadow-lg"
                fill="#EF4444"
                stroke="white"
                strokeWidth={2}
              />
            </motion.g>

            {/* GeoHash Text Label */}
            <text
              x={currentPos.x}
              y={currentPos.y + 28}
              textAnchor="middle"
              className="text-sm font-bold fill-blue-600"
              style={{ textShadow: '0 0 8px white, 0 0 8px white, 0 0 8px white' }}
            >
              {geohash}
            </text>
          </svg>

          {/* Legend - Apple Style */}
          <div className="mt-6 flex items-center justify-center gap-8 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-500 bg-opacity-20 border-2 border-blue-500 rounded-lg"></div>
              <span className="font-medium">Current GeoHash</span>
            </div>
            {showNeighbors && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-300 bg-opacity-15 border border-blue-300 rounded-lg"></div>
                <span className="font-medium">Neighbors</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default GeoHashVisualizer;
