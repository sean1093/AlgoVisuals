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
    <div className="space-y-6">
      {/* Statistics Cards Row - B2B Dashboard Style */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-sm font-medium text-gray-600 mb-2">GeoHash Code</div>
          <div className="text-xl font-bold text-gray-900 font-mono break-all">{geohash}</div>
          <div className="text-xs text-gray-500 mt-1">{precision} character precision</div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-sm font-medium text-gray-600 mb-2">Latitude</div>
          <div className="text-xl font-bold text-gray-900">{lat.toFixed(3)}°</div>
          <div className="text-xs text-gray-500 mt-1 font-mono">
            {bounds.minLat.toFixed(4)} ~ {bounds.maxLat.toFixed(4)}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-sm font-medium text-gray-600 mb-2">Longitude</div>
          <div className="text-xl font-bold text-gray-900">{lng.toFixed(3)}°</div>
          <div className="text-xs text-gray-500 mt-1 font-mono">
            {bounds.minLng.toFixed(4)} ~ {bounds.maxLng.toFixed(4)}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-sm font-medium text-gray-600 mb-2">Precision Level</div>
          <div className="text-xl font-bold text-gray-900">{precision}/8</div>
          <div className="text-xs text-gray-500 mt-1">Character length</div>
        </div>
      </div>

      {/* Main Dashboard Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar - Controls */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-4 pb-3 border-b border-gray-200">
              Location Input
            </h3>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-600 uppercase tracking-wider mb-2 block">
                  Latitude
                </label>
                <input
                  type="number"
                  value={lat}
                  onChange={(e) => setLat(Number(e.target.value))}
                  step="0.001"
                  min="-90"
                  max="90"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600 uppercase tracking-wider mb-2 block">
                  Longitude
                </label>
                <input
                  type="number"
                  value={lng}
                  onChange={(e) => setLng(Number(e.target.value))}
                  step="0.001"
                  min="-180"
                  max="180"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <Slider
                label="Precision"
                value={precision}
                min={1}
                max={8}
                onChange={setPrecision}
              />

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showNeighbors}
                  onChange={(e) => setShowNeighbors(e.target.checked)}
                  className="w-4 h-4 accent-blue-600 cursor-pointer rounded"
                />
                <span className="text-sm font-medium text-gray-700">Show neighbors</span>
              </label>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
            <h3 className="text-sm font-semibold text-blue-900 mb-3">Usage Guide</h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>Click map to set position</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>Enter coordinates manually</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>Adjust precision level</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Main Map Area - B2B Dashboard Style */}
        <div className="lg:col-span-3">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">GeoHash Map Visualization</h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 bg-blue-500 rounded"></div>
                  <span className="text-gray-600">Current Region</span>
                </div>
                {showNeighbors && (
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 bg-blue-300 rounded"></div>
                    <span className="text-gray-600">Neighbors</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-center">
              <svg
                ref={svgRef}
                width={MAP_WIDTH}
                height={MAP_HEIGHT}
                className="border border-gray-300 rounded-lg bg-gray-50 cursor-crosshair"
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
                    {drawGeohashRect(neighbors.n, 'rgba(147, 197, 253, 0.2)')}
                    {drawGeohashRect(neighbors.ne, 'rgba(147, 197, 253, 0.2)')}
                    {drawGeohashRect(neighbors.e, 'rgba(147, 197, 253, 0.2)')}
                    {drawGeohashRect(neighbors.se, 'rgba(147, 197, 253, 0.2)')}
                    {drawGeohashRect(neighbors.s, 'rgba(147, 197, 253, 0.2)')}
                    {drawGeohashRect(neighbors.sw, 'rgba(147, 197, 253, 0.2)')}
                    {drawGeohashRect(neighbors.w, 'rgba(147, 197, 253, 0.2)')}
                    {drawGeohashRect(neighbors.nw, 'rgba(147, 197, 253, 0.2)')}
                  </>
                )}

                {/* Current GeoHash Region */}
                {drawGeohashRect(geohash, 'rgba(59, 130, 246, 0.3)', 2)}

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
                    fill="#EF4444"
                    stroke="white"
                    strokeWidth={2}
                  />
                  <MapPin
                    x={currentPos.x - 12}
                    y={currentPos.y - 30}
                    size={24}
                    className="text-red-500"
                    fill="#EF4444"
                    stroke="white"
                    strokeWidth={2}
                  />
                </motion.g>

                {/* GeoHash Text Label */}
                <text
                  x={currentPos.x}
                  y={currentPos.y + 24}
                  textAnchor="middle"
                  className="text-xs font-bold fill-blue-600"
                  style={{ textShadow: '0 0 4px white, 0 0 4px white' }}
                >
                  {geohash}
                </text>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GeoHashVisualizer;
