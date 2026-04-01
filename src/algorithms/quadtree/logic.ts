/**
 * QuadTree data structure implementation
 * For efficient 2D spatial queries
 */

export interface Point {
  x: number;
  y: number;
  data?: unknown;
}

export interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

export class QuadTree {
  boundary: Rectangle;
  capacity: number;
  points: Point[];
  divided: boolean;

  // Four subtrees
  northeast?: QuadTree;
  northwest?: QuadTree;
  southeast?: QuadTree;
  southwest?: QuadTree;

  constructor(boundary: Rectangle, capacity: number) {
    this.boundary = boundary;
    this.capacity = capacity;
    this.points = [];
    this.divided = false;
  }

  /**
   * Check if a point is within a rectangle
   */
  static contains(rect: Rectangle, point: Point): boolean {
    return (
      point.x >= rect.x &&
      point.x < rect.x + rect.width &&
      point.y >= rect.y &&
      point.y < rect.y + rect.height
    );
  }

  /**
   * Check if two rectangles intersect
   */
  static intersects(rect1: Rectangle, rect2: Rectangle): boolean {
    return !(
      rect2.x > rect1.x + rect1.width ||
      rect2.x + rect2.width < rect1.x ||
      rect2.y > rect1.y + rect1.height ||
      rect2.y + rect2.height < rect1.y
    );
  }

  /**
   * Insert a point into the quadtree
   */
  insert(point: Point): boolean {
    // Reject if point is not within boundary
    if (!QuadTree.contains(this.boundary, point)) {
      return false;
    }

    // If there's capacity and not divided yet, insert directly
    if (this.points.length < this.capacity && !this.divided) {
      this.points.push(point);
      return true;
    }

    // If not yet divided, subdivide first
    if (!this.divided) {
      this.subdivide();
    }

    // Recursively insert into subtrees
    if (this.northeast!.insert(point)) return true;
    if (this.northwest!.insert(point)) return true;
    if (this.southeast!.insert(point)) return true;
    if (this.southwest!.insert(point)) return true;

    // Should theoretically never reach here
    return false;
  }

  /**
   * Subdivide into four quadrants
   */
  subdivide(): void {
    const { x, y, width, height } = this.boundary;
    const halfWidth = width / 2;
    const halfHeight = height / 2;

    const ne: Rectangle = {
      x: x + halfWidth,
      y: y,
      width: halfWidth,
      height: halfHeight,
    };
    const nw: Rectangle = {
      x: x,
      y: y,
      width: halfWidth,
      height: halfHeight,
    };
    const se: Rectangle = {
      x: x + halfWidth,
      y: y + halfHeight,
      width: halfWidth,
      height: halfHeight,
    };
    const sw: Rectangle = {
      x: x,
      y: y + halfHeight,
      width: halfWidth,
      height: halfHeight,
    };

    this.northeast = new QuadTree(ne, this.capacity);
    this.northwest = new QuadTree(nw, this.capacity);
    this.southeast = new QuadTree(se, this.capacity);
    this.southwest = new QuadTree(sw, this.capacity);

    this.divided = true;

    // Redistribute existing points to subtrees
    for (const point of this.points) {
      this.northeast!.insert(point) ||
      this.northwest!.insert(point) ||
      this.southeast!.insert(point) ||
      this.southwest!.insert(point);
    }

    // Clear parent points after subdivision
    this.points = [];
  }

  /**
   * Query all points within a specified range
   */
  query(range: Rectangle, found: Point[] = []): Point[] {
    // Return empty if ranges don't intersect
    if (!QuadTree.intersects(this.boundary, range)) {
      return found;
    }

    // Check all points in this node
    for (const point of this.points) {
      if (QuadTree.contains(range, point)) {
        found.push(point);
      }
    }

    // If divided, recursively query subtrees
    if (this.divided) {
      this.northeast!.query(range, found);
      this.northwest!.query(range, found);
      this.southeast!.query(range, found);
      this.southwest!.query(range, found);
    }

    return found;
  }

  /**
   * Get all nodes (for visualization)
   */
  getAllNodes(): Rectangle[] {
    const nodes: Rectangle[] = [this.boundary];

    if (this.divided) {
      nodes.push(...this.northeast!.getAllNodes());
      nodes.push(...this.northwest!.getAllNodes());
      nodes.push(...this.southeast!.getAllNodes());
      nodes.push(...this.southwest!.getAllNodes());
    }

    return nodes;
  }

  /**
   * Get all points
   */
  getAllPoints(): Point[] {
    let allPoints = [...this.points];

    if (this.divided) {
      allPoints.push(...this.northeast!.getAllPoints());
      allPoints.push(...this.northwest!.getAllPoints());
      allPoints.push(...this.southeast!.getAllPoints());
      allPoints.push(...this.southwest!.getAllPoints());
    }

    return allPoints;
  }
}
