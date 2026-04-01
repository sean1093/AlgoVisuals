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
    <div className="space-y-6">
      {/* Statistics Cards Row - B2B Dashboard Style */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Total Points</span>
            <div className="w-8 h-8 bg-blue-50 rounded flex items-center justify-center">
              <span className="text-blue-600 text-xs font-bold">{allPoints.length}</span>
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">{allPoints.length}</div>
          <div className="text-xs text-gray-500 mt-1">Active data points</div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Tree Nodes</span>
            <div className="w-8 h-8 bg-green-50 rounded flex items-center justify-center">
              <span className="text-green-600 text-xs font-bold">{allNodes.length}</span>
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">{allNodes.length}</div>
          <div className="text-xs text-gray-500 mt-1">Subdivided regions</div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Capacity</span>
            <div className="w-8 h-8 bg-purple-50 rounded flex items-center justify-center">
              <span className="text-purple-600 text-xs font-bold">{capacity}</span>
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">{capacity}</div>
          <div className="text-xs text-gray-500 mt-1">Points per node</div>
        </div>
      </div>

      {/* Main Dashboard Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar - Controls */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-4 pb-3 border-b border-gray-200">
              Configuration
            </h3>

            <div className="space-y-5">
              <Slider
                label="Node Capacity"
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

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
            <h3 className="text-sm font-semibold text-blue-900 mb-3">Usage Guide</h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>Click canvas to add points</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>Hover regions to highlight</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>Adjust capacity threshold</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Main Canvas Area */}
        <div className="lg:col-span-3">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Visualization Canvas</h3>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span>Interactive Mode</span>
              </div>
            </div>

            <div className="flex items-center justify-center">
              <svg
                ref={svgRef}
                width={CANVAS_SIZE}
                height={CANVAS_SIZE}
                className="border border-gray-300 rounded-lg bg-gray-50 cursor-crosshair"
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
                      fill={isHovered ? 'rgba(59, 130, 246, 0.1)' : 'transparent'}
                      stroke={isHovered ? '#3B82F6' : '#D1D5DB'}
                      strokeWidth={isHovered ? 2 : 1}
                      className="transition-all duration-150"
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
                    fill="#3B82F6"
                    stroke="white"
                    strokeWidth={2}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 20 }}
                  />
                ))}
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default QuadTreeVisualizer;
