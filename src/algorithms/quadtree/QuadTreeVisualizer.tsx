import { useState, useRef, MouseEvent } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw } from 'lucide-react';
import { QuadTree, Point, Rectangle } from './logic';
import Button from '../../components/shared/Button';
import Slider from '../../components/shared/Slider';
import ControlPanel from '../../components/shared/ControlPanel';

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
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Control Panel */}
      <div className="lg:w-64 flex-shrink-0">
        <ControlPanel title="Control Panel">
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
          <div className="text-sm text-gray-600 mt-4 p-3 bg-pastelBlue bg-opacity-20 rounded-lg border border-borderBlue">
            <p className="font-semibold mb-2">Instructions:</p>
            <ul className="space-y-1 text-xs">
              <li>• Click canvas to add points</li>
              <li>• Hover to view regions</li>
              <li>• Adjust capacity to change subdivision threshold</li>
            </ul>
          </div>
          <div className="text-sm text-gray-600 mt-2 p-2 bg-gray-50 rounded-lg">
            <p className="text-xs">Points: <span className="font-bold text-borderBlue">{allPoints.length}</span></p>
            <p className="text-xs">Nodes: <span className="font-bold text-borderBlue">{allNodes.length}</span></p>
          </div>
        </ControlPanel>
      </div>

      {/* Canvas */}
      <div className="flex-1 flex items-center justify-center">
        <div className="relative">
          <svg
            ref={svgRef}
            width={CANVAS_SIZE}
            height={CANVAS_SIZE}
            className="border-2 border-borderGray rounded-xl bg-white cursor-crosshair shadow-soft-md"
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
                  fill={isHovered ? 'rgba(168, 216, 234, 0.2)' : 'transparent'}
                  stroke={isHovered ? '#2C5F7C' : '#4A5568'}
                  strokeWidth={isHovered ? 3 : 1}
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
                fill="#A8D8EA"
                stroke="#2C5F7C"
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
  );
}

export default QuadTreeVisualizer;
