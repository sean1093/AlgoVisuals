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
        stroke="#3B82F6"
        strokeWidth={strokeWidth}
      />
    );
  };

  const currentPos = latLngToXY(lat, lng);

  return (
    <div className="space-y-8 md:space-y-12">
      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 text-center">
          <div className="text-sm text-gray-600 mb-3">GeoHash Code</div>
          <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent font-mono break-all">
            {geohash}
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 text-center">
          <div className="text-sm text-gray-600 mb-3">Latitude</div>
          <div className="text-2xl md:text-3xl font-bold text-gray-900">{lat.toFixed(3)}°</div>
          <div className="text-xs text-gray-500 mt-2 font-mono">
            {bounds.minLat.toFixed(4)} ~ {bounds.maxLat.toFixed(4)}
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 text-center">
          <div className="text-sm text-gray-600 mb-3">Longitude</div>
          <div className="text-2xl md:text-3xl font-bold text-gray-900">{lng.toFixed(3)}°</div>
          <div className="text-xs text-gray-500 mt-2 font-mono">
            {bounds.minLng.toFixed(4)} ~ {bounds.maxLng.toFixed(4)}
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 text-center">
          <div className="text-sm text-gray-600 mb-3">Precision</div>
          <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
            {precision}/8
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 md:gap-8">
        {/* Controls */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Location</h3>

            <div className="space-y-5">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Latitude
                </label>
                <input
                  type="number"
                  value={lat}
                  onChange={(e) => setLat(Number(e.target.value))}
                  step="0.001"
                  min="-90"
                  max="90"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Longitude
                </label>
                <input
                  type="number"
                  value={lng}
                  onChange={(e) => setLng(Number(e.target.value))}
                  step="0.001"
                  min="-180"
                  max="180"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                />
              </div>

              <Slider
                label="Precision"
                value={precision}
                min={1}
                max={8}
                onChange={setPrecision}
              />

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showNeighbors}
                  onChange={(e) => setShowNeighbors(e.target.checked)}
                  className="w-5 h-5 accent-blue-500 cursor-pointer rounded"
                />
                <span className="text-sm font-medium text-gray-700">Show neighbors</span>
              </label>
            </div>
          </div>

          <div className="bg-blue-50/50 backdrop-blur-sm rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">How to Use</h3>
            <ul className="space-y-3 text-sm text-gray-600">
              <li className="flex items-start gap-3">
                <span className="text-blue-500 font-bold flex-shrink-0">→</span>
                <span>Click map to set position</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-500 font-bold flex-shrink-0">→</span>
                <span>Enter coordinates manually</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-500 font-bold flex-shrink-0">→</span>
                <span>Adjust precision level</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Map */}
        <div className="lg:col-span-3">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 md:p-8">
            <div className="flex items-center justify-center overflow-x-auto">
              <svg
                ref={svgRef}
                width={MAP_WIDTH}
                height={MAP_HEIGHT}
                className="max-w-full h-auto border-2 border-gray-200 rounded-xl bg-white cursor-crosshair shadow-sm"
                onClick={handleMapClick}
              >
                {/* Background Grid */}
                <defs>
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#F3F4F6" strokeWidth="1" />
                  </pattern>
                  <linearGradient id="pin-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#EF4444" />
                    <stop offset="100%" stopColor="#DC2626" />
                  </linearGradient>
                </defs>
                <rect width={MAP_WIDTH} height={MAP_HEIGHT} fill="url(#grid)" />

                {/* Neighbor Regions */}
                {showNeighbors && (
                  <>
                    {drawGeohashRect(neighbors.n, 'rgba(191, 219, 254, 0.3)')}
                    {drawGeohashRect(neighbors.ne, 'rgba(191, 219, 254, 0.3)')}
                    {drawGeohashRect(neighbors.e, 'rgba(191, 219, 254, 0.3)')}
                    {drawGeohashRect(neighbors.se, 'rgba(191, 219, 254, 0.3)')}
                    {drawGeohashRect(neighbors.s, 'rgba(191, 219, 254, 0.3)')}
                    {drawGeohashRect(neighbors.sw, 'rgba(191, 219, 254, 0.3)')}
                    {drawGeohashRect(neighbors.w, 'rgba(191, 219, 254, 0.3)')}
                    {drawGeohashRect(neighbors.nw, 'rgba(191, 219, 254, 0.3)')}
                  </>
                )}

                {/* Current GeoHash Region */}
                {drawGeohashRect(geohash, 'rgba(147, 197, 253, 0.4)', 2)}

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
                    fill="url(#pin-gradient)"
                    stroke="white"
                    strokeWidth={2}
                  />
                  <MapPin
                    x={currentPos.x - 12}
                    y={currentPos.y - 30}
                    size={24}
                    className="text-red-500"
                    fill="url(#pin-gradient)"
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
