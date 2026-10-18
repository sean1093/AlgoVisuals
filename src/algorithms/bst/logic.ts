/**
 * Binary search tree whose operations are recorded as frames.
 * Every frame holds its own copy of the tree so playback can go backwards.
 */

export interface BSTNode {
  id: number;
  value: number;
  left: BSTNode | null;
  right: BSTNode | null;
}

export interface TreeFrame {
  root: BSTNode | null;
  /** Node currently being looked at */
  active?: number;
  /** Nodes visited on the way down */
  trail: number[];
  /** Node that was found / inserted */
  done?: number;
  /** Node about to be removed or replaced */
  doomed?: number;
  note: string;
}

let nextId = 1;

function clone(node: BSTNode | null): BSTNode | null {
  return node && { ...node, left: clone(node.left), right: clone(node.right) };
}

export function size(node: BSTNode | null): number {
  return node ? 1 + size(node.left) + size(node.right) : 0;
}

export function height(node: BSTNode | null): number {
  return node ? 1 + Math.max(height(node.left), height(node.right)) : 0;
}

export function inOrder(node: BSTNode | null, out: number[] = []): number[] {
  if (node) {
    inOrder(node.left, out);
    out.push(node.value);
    inOrder(node.right, out);
  }
  return out;
}

export function contains(node: BSTNode | null, value: number): boolean {
  while (node) {
    if (value === node.value) return true;
    node = value < node.value ? node.left : node.right;
  }
  return false;
}

/** Walk down from the root, recording a frame per comparison. Returns the trail of nodes. */
function descend(root: BSTNode | null, value: number, frames: TreeFrame[], verb: string) {
  const trail: number[] = [];
  let node = root;
  let parent: BSTNode | null = null;
  while (node) {
    trail.push(node.id);
    if (value === node.value) return { node, parent, trail };
    const left = value < node.value;
    frames.push({
      root: clone(root),
      active: node.id,
      trail: [...trail],
      note: `${value} is ${left ? 'smaller' : 'bigger'} than ${node.value}, so ${verb} in the ${left ? 'left' : 'right'} branch.`,
    });
    parent = node;
    node = left ? node.left : node.right;
  }
  return { node: null, parent, trail };
}

export function insert(root: BSTNode | null, value: number): TreeFrame[] {
  const frames: TreeFrame[] = [{ root: clone(root), trail: [], note: `Insert ${value}: start at the top and go left for smaller, right for bigger.` }];
  const working = clone(root);
  const { node, parent, trail } = descend(working, value, frames, 'keep going');
  if (node) {
    frames.push({ root: clone(working), active: node.id, trail, done: node.id, note: `${value} is already in the tree — nothing to add.` });
    return frames;
  }
  const fresh: BSTNode = { id: nextId++, value, left: null, right: null };
  let newRoot = working;
  if (!parent) newRoot = fresh;
  else if (value < parent.value) parent.left = fresh;
  else parent.right = fresh;
  frames.push({
    root: clone(newRoot),
    trail: [...trail, fresh.id],
    done: fresh.id,
    note: parent
      ? `Found an empty spot: ${value} becomes the ${value < parent.value ? 'left' : 'right'} child of ${parent.value}.`
      : `The tree was empty, so ${value} becomes the root.`,
  });
  return frames;
}

export function search(root: BSTNode | null, value: number): TreeFrame[] {
  const frames: TreeFrame[] = [{ root: clone(root), trail: [], note: `Search for ${value}, starting at the top.` }];
  const { node, trail } = descend(root, value, frames, 'look');
  frames.push(
    node
      ? { root: clone(root), trail, done: node.id, note: `Found ${value} after looking at ${trail.length} node${trail.length > 1 ? 's' : ''}.` }
      : { root: clone(root), trail, note: `Hit an empty branch — ${value} isn’t in the tree (${trail.length} node${trail.length === 1 ? '' : 's'} checked).` }
  );
  return frames;
}

export function remove(root: BSTNode | null, value: number): TreeFrame[] {
  const frames: TreeFrame[] = [{ root: clone(root), trail: [], note: `Delete ${value}: first find it.` }];
  let working = clone(root);
  const { node, parent, trail } = descend(working, value, frames, 'look');
  if (!node) {
    frames.push({ root: clone(working), trail, note: `${value} isn’t in the tree, so there’s nothing to delete.` });
    return frames;
  }

  const replaceChild = (child: BSTNode | null) => {
    if (!parent) working = child;
    else if (parent.left === node) parent.left = child;
    else parent.right = child;
  };

  if (!node.left || !node.right) {
    const child = node.left ?? node.right;
    frames.push({
      root: clone(working),
      trail,
      doomed: node.id,
      note: child
        ? `${value} has one child, ${child.value}. Lift that child up into its place.`
        : `${value} is a leaf (no children), so just remove it.`,
    });
    replaceChild(child);
    frames.push({ root: clone(working), trail: [], done: child?.id, note: `Deleted ${value}. The tree is still in order.` });
    return frames;
  }

  // Two children: replace with the smallest value in the right subtree
  frames.push({
    root: clone(working),
    trail,
    doomed: node.id,
    note: `${value} has two children. Replace it with the next bigger value: the leftmost node on its right side.`,
  });
  let succParent = node;
  let succ = node.right;
  const succTrail = [...trail, succ.id];
  while (succ.left) {
    frames.push({ root: clone(working), active: succ.id, trail: [...succTrail], doomed: node.id, note: `${succ.value} has a smaller child — keep going left.` });
    succParent = succ;
    succ = succ.left;
    succTrail.push(succ.id);
  }
  frames.push({ root: clone(working), active: succ.id, trail: succTrail, doomed: node.id, note: `${succ.value} is the next bigger value. Move it up to replace ${value}.` });
  if (succParent === node) succParent.right = succ.right;
  else succParent.left = succ.right;
  node.value = succ.value;
  node.id = succ.id;
  frames.push({ root: clone(working), trail: [], done: node.id, note: `Deleted ${value}; ${node.value} took its place. Everything is still in order.` });
  return frames;
}

/**
 * Build a tree by inserting values one at a time (no frames)
 */
export function build(values: number[]): BSTNode | null {
  let root: BSTNode | null = null;
  for (const v of values) root = insert(root, v).at(-1)!.root;
  return root;
}

/**
 * x = in-order position, y = depth; used for drawing
 */
export function layout(root: BSTNode | null) {
  const positions = new Map<number, { x: number; depth: number; node: BSTNode }>();
  let i = 0;
  const walk = (node: BSTNode | null, depth: number) => {
    if (!node) return;
    walk(node.left, depth + 1);
    positions.set(node.id, { x: i++, depth, node });
    walk(node.right, depth + 1);
  };
  walk(root, 0);
  return positions;
}
