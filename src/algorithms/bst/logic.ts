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

/** A fresh node id; pass it to `insert` so re-running the operation reuses it */
export const newNodeId = () => nextId++;

/**
 * Plain-language step descriptions; English by default, swapped for a translation by the UI
 */
export const BST_MESSAGES = {
  goLeft: (value: number, node: number) => `${value} is smaller than ${node}, so go down the left branch.`,
  goRight: (value: number, node: number) => `${value} is bigger than ${node}, so go down the right branch.`,
  insertIntro: (value: number) => `Insert ${value}: start at the top and go left for smaller, right for bigger.`,
  insertExists: (value: number) => `${value} is already in the tree — nothing to add.`,
  insertLeft: (value: number, parent: number) => `Found an empty spot: ${value} becomes the left child of ${parent}.`,
  insertRight: (value: number, parent: number) => `Found an empty spot: ${value} becomes the right child of ${parent}.`,
  insertRoot: (value: number) => `The tree was empty, so ${value} becomes the root.`,
  searchIntro: (value: number) => `Search for ${value}, starting at the top.`,
  searchFound: (value: number, looked: number) => `Found ${value} after looking at ${looked} node${looked > 1 ? 's' : ''}.`,
  searchMissing: (value: number, looked: number) =>
    `Hit an empty branch — ${value} isn’t in the tree (${looked} node${looked === 1 ? '' : 's'} checked).`,
  deleteIntro: (value: number) => `Delete ${value}: first find it.`,
  deleteMissing: (value: number) => `${value} isn’t in the tree, so there’s nothing to delete.`,
  deleteOneChild: (value: number, child: number) => `${value} has one child, ${child}. Lift that child up into its place.`,
  deleteLeaf: (value: number) => `${value} is a leaf (no children), so just remove it.`,
  deleted: (value: number) => `Deleted ${value}. The tree is still in order.`,
  deleteTwoChildren: (value: number) =>
    `${value} has two children. Replace it with the next bigger value: the leftmost node on its right side.`,
  successorLeft: (v: number) => `${v} has a smaller child — keep going left.`,
  successorFound: (v: number, value: number) => `${v} is the next bigger value. Move it up to replace ${value}.`,
  deletedReplaced: (value: number, replacement: number) => `Deleted ${value}; ${replacement} took its place. Everything is still in order.`,
};

export type BSTMessages = typeof BST_MESSAGES;

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
function descend(root: BSTNode | null, value: number, frames: TreeFrame[], m: BSTMessages) {
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
      note: left ? m.goLeft(value, node.value) : m.goRight(value, node.value),
    });
    parent = node;
    node = left ? node.left : node.right;
  }
  return { node: null, parent, trail };
}

export function insert(root: BSTNode | null, value: number, m: BSTMessages = BST_MESSAGES, id: number = newNodeId()): TreeFrame[] {
  const frames: TreeFrame[] = [{ root: clone(root), trail: [], note: m.insertIntro(value) }];
  const working = clone(root);
  const { node, parent, trail } = descend(working, value, frames, m);
  if (node) {
    frames.push({ root: clone(working), active: node.id, trail, done: node.id, note: m.insertExists(value) });
    return frames;
  }
  const fresh: BSTNode = { id, value, left: null, right: null };
  let newRoot = working;
  if (!parent) newRoot = fresh;
  else if (value < parent.value) parent.left = fresh;
  else parent.right = fresh;
  frames.push({
    root: clone(newRoot),
    trail: [...trail, fresh.id],
    done: fresh.id,
    note: parent
      ? value < parent.value
        ? m.insertLeft(value, parent.value)
        : m.insertRight(value, parent.value)
      : m.insertRoot(value),
  });
  return frames;
}

export function search(root: BSTNode | null, value: number, m: BSTMessages = BST_MESSAGES): TreeFrame[] {
  const frames: TreeFrame[] = [{ root: clone(root), trail: [], note: m.searchIntro(value) }];
  const { node, trail } = descend(root, value, frames, m);
  frames.push(
    node
      ? { root: clone(root), trail, done: node.id, note: m.searchFound(value, trail.length) }
      : { root: clone(root), trail, note: m.searchMissing(value, trail.length) }
  );
  return frames;
}

export function remove(root: BSTNode | null, value: number, m: BSTMessages = BST_MESSAGES): TreeFrame[] {
  const frames: TreeFrame[] = [{ root: clone(root), trail: [], note: m.deleteIntro(value) }];
  let working = clone(root);
  const { node, parent, trail } = descend(working, value, frames, m);
  if (!node) {
    frames.push({ root: clone(working), trail, note: m.deleteMissing(value) });
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
      note: child ? m.deleteOneChild(value, child.value) : m.deleteLeaf(value),
    });
    replaceChild(child);
    frames.push({ root: clone(working), trail: [], done: child?.id, note: m.deleted(value) });
    return frames;
  }

  // Two children: replace with the smallest value in the right subtree
  frames.push({
    root: clone(working),
    trail,
    doomed: node.id,
    note: m.deleteTwoChildren(value),
  });
  let succParent = node;
  let succ = node.right;
  const succTrail = [...trail, succ.id];
  while (succ.left) {
    frames.push({ root: clone(working), active: succ.id, trail: [...succTrail], doomed: node.id, note: m.successorLeft(succ.value) });
    succParent = succ;
    succ = succ.left;
    succTrail.push(succ.id);
  }
  frames.push({ root: clone(working), active: succ.id, trail: succTrail, doomed: node.id, note: m.successorFound(succ.value, value) });
  if (succParent === node) succParent.right = succ.right;
  else succParent.left = succ.right;
  node.value = succ.value;
  node.id = succ.id;
  frames.push({ root: clone(working), trail: [], done: node.id, note: m.deletedReplaced(value, node.value) });
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
