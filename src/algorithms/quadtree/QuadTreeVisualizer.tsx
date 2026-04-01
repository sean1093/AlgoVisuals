import { useState, useRef, MouseEvent } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw } from 'lucide-react';
import { QuadTree, Point, Rectangle } from './logic';
import Button from '../../components/shared/Button';
import Slider from '../../components/shared/Slider';

const CANVAS_SIZE = 600;

function QuadTreeVisualizer() {
  const [capacity, setCapacity] = useState(4);
  const [quadTree, setQuadTree] = useState<QuadTree>(() => {
    const boundary: Rectangle = { x: 0, y: 0, width: CANVAS_SIZE, height: CANVAS_SIZE };
    return new QuadTree(boundary, capacity);
  });
  const [hoveredNode, setHoveredNode] = useState<Rectangle | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Reset QuadTree
  const handleReset = () => {
    const boundary: Rectangle = { x: 0, y: 0, width: CANVAS_SIZE, height: CANVAS_SIZE };
    setQuadTree(new QuadTree(boundary, capacity));
    setHoveredNode(null);
  };

  // Update capacity and rebuild QuadTree
  const handleCapacityChange = (newCapacity: number) => {
    setCapacity(newCapacity);
    const boundary: Rectangle = { x: 0, y: 0, width: CANVAS_SIZE, height: CANVAS_SIZE };
    const newTree = new QuadTree(boundary, newCapacity);

    // Reinsert all existing points
    const existingPoints = quadTree.getAllPoints();
    existingPoints.forEach(point => newTree.insert(point));

    setQuadTree(newTree);
  };

  // Click canvas to add point
  const handleCanvasClick = (e: MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;

    const rect = svgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const point: Point = { x, y };
    const newTree = new QuadTree(quadTree.boundary, capacity);

    // Reinsert all points
    const existingPoints = quadTree.getAllPoints();
    existingPoints.forEach(p => newTree.insert(p));
    newTree.insert(point);

    setQuadTree(newTree);
  };

  // Find node at mouse position
  const handleMouseMove = (e: MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;

    const rect = svgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const point: Point = { x, y };
    const nodes = quadTree.getAllNodes();

    // Find smallest node containing this point
    let smallestNode: Rectangle | null = null;
    let smallestArea = Infinity;

    for (const node of nodes) {
      if (QuadTree.contains(node, point)) {
        const area = node.width * node.height;
        if (area < smallestArea) {
          smallestArea = area;
          smallestNode = node;
        }
      }
    }

    setHoveredNode(smallestNode);
  };

  const handleMouseLeave = () => {
    setHoveredNode(null);
  };

  const allNodes = quadTree.getAllNodes();
  const allPoints = quadTree.getAllPoints();

  return (
    <div className="space-y-8 md:space-y-12">
      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 text-center">
          <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent mb-2">
            {allPoints.length}
          </div>
          <div className="text-sm text-gray-600">Total Points</div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 text-center">
          <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent mb-2">
            {allNodes.length}
          </div>
          <div className="text-sm text-gray-600">Tree Nodes</div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 text-center">
          <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent mb-2">
            {capacity}
          </div>
          <div className="text-sm text-gray-600">Node Capacity</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 md:gap-8">
        {/* Controls */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Controls</h3>

            <div className="space-y-6">
              <Slider
                label="Capacity"
                value={capacity}
                min={1}
                max={10}
                onChange={handleCapacityChange}
              />

              <Button
                variant="secondary"
                onClick={handleReset}
                className="w-full flex items-center justify-center gap-2"
              >
                <RotateCcw size={16} />
                Reset
              </Button>
            </div>
          </div>

          <div className="bg-blue-50/50 backdrop-blur-sm rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">How to Use</h3>
            <ul className="space-y-3 text-sm text-gray-600">
              <li className="flex items-start gap-3">
                <span className="text-blue-500 font-bold flex-shrink-0">→</span>
                <span>Click canvas to add points</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-500 font-bold flex-shrink-0">→</span>
                <span>Hover to highlight regions</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-500 font-bold flex-shrink-0">→</span>
                <span>Adjust capacity to see subdivision</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Canvas */}
        <div className="lg:col-span-3">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 md:p-8">
            <div className="flex items-center justify-center">
              <svg
                ref={svgRef}
                width={CANVAS_SIZE}
                height={CANVAS_SIZE}
                className="max-w-full h-auto border-2 border-gray-200 rounded-xl bg-white cursor-crosshair shadow-sm"
                onClick={handleCanvasClick}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
              >
                {/* Render all nodes */}
                {allNodes.map((node, i) => {
                  const isHovered = hoveredNode &&
                    node.x === hoveredNode.x &&
                    node.y === hoveredNode.y &&
                    node.width === hoveredNode.width &&
                    node.height === hoveredNode.height;

                  return (
                    <rect
                      key={i}
                      x={node.x}
                      y={node.y}
                      width={node.width}
                      height={node.height}
                      fill={isHovered ? 'rgba(147, 197, 253, 0.2)' : 'transparent'}
                      stroke={isHovered ? '#3B82F6' : '#E5E7EB'}
                      strokeWidth={isHovered ? 2 : 1}
                      className="transition-all duration-200"
                    />
                  );
                })}

                {/* Render all points */}
                {allPoints.map((point, i) => (
                  <motion.circle
                    key={i}
                    cx={point.x}
                    cy={point.y}
                    r={5}
                    fill="url(#point-gradient)"
                    stroke="white"
                    strokeWidth={2}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 20 }}
                  />
                ))}

                {/* Gradient definition */}
                <defs>
                  <linearGradient id="point-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3B82F6" />
                    <stop offset="100%" stopColor="#8B5CF6" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default QuadTreeVisualizer;
