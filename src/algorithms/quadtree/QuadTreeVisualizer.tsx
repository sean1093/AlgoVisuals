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
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Control Panel - Apple Style */}
      <div className="lg:w-80 flex-shrink-0">
        <div className="space-y-6">
          <div className="bg-gray-50 rounded-2xl p-6 space-y-6">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
              Controls
            </h3>

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
              Reset Canvas
            </Button>
          </div>

          <div className="bg-gray-50 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
              Statistics
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 font-medium mb-1">Points</p>
                <p className="text-3xl font-semibold text-gray-900">{allPoints.length}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium mb-1">Nodes</p>
                <p className="text-3xl font-semibold text-gray-900">{allNodes.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-blue-900 mb-3">How to use</h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">•</span>
                <span>Click canvas to add points</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">•</span>
                <span>Hover to highlight regions</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">•</span>
                <span>Adjust capacity to change subdivision threshold</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Canvas - Apple Style */}
      <div className="flex-1 flex items-center justify-center">
        <div className="relative">
          <svg
            ref={svgRef}
            width={CANVAS_SIZE}
            height={CANVAS_SIZE}
            className="border border-gray-200 rounded-3xl bg-white cursor-crosshair shadow-xl shadow-gray-200/50"
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
                  fill={isHovered ? 'rgba(59, 130, 246, 0.08)' : 'transparent'}
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
                r={6}
                fill="#3B82F6"
                stroke="white"
                strokeWidth={2}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 20 }}
                className="drop-shadow-md"
              />
            ))}
          </svg>
        </div>
      </div>
    </div>
  );
}

export default QuadTreeVisualizer;
