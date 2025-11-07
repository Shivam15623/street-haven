import React, {
  useRef,
  useState,
  useCallback,
  useMemo,
  useLayoutEffect,
} from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  type Edge,
  type Node,
} from "@xyflow/react";
import dagre from "@dagrejs/dagre";
import "@xyflow/react/dist/style.css";

import CustomNode, {
  type CustomNodeData,
  type CustomNodeProps,
} from "./CustomNode";
import {
  useGetTreeNodesQuery,
  type OrgNodeData,
} from "../../../../../services/orgApi";

/* -----------------------------
   Constants & Defaults
------------------------------ */

/* -----------------------------
   Initial Data
------------------------------ */

/* -----------------------------
   Flow Component
------------------------------ */

const ROOT_TOP_Y = 40;
const DEFAULT_NODE_HEIGHT = 120;

// -----------------------------
// Helpers
// -----------------------------
function useContainerWidth(ref: React.RefObject<HTMLElement | null>) {
  const [width, setWidth] = useState(0);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setWidth(entry.contentRect.width);
    });
    ro.observe(el);
    // set initial width synchronously
    setWidth(el.clientWidth);
    return () => ro.disconnect();
  }, []);
  return width;
}

function computeVisibleIds(
  nodes: Node<{ node: OrgNodeData; expanded: boolean }>[],
  rootId: string,
  expandedSet: Set<string>
) {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const visible = new Set<string>([rootId]);

  function visit(id: string) {
    const node = byId.get(id);
    if (!node) return;
    if (expandedSet.has(id)) {
      const children = nodes.filter(
        (c) => c.data.node.reportsTo?._id === node.data.node._id
      );
      for (const c of children) {
        visible.add(c.id);
        visit(c.id);
      }
    }
  }
  visit(rootId);
  return visible;
}
function transformOrgNodesToFlow(orgNodes: OrgNodeData[]): {
  nodes: Node<{ node: OrgNodeData; expanded: boolean }>[];
  edges: Edge[];
} {
  const nodes: Node<{ node: OrgNodeData; expanded: boolean }>[] = [];
  const edges: Edge[] = [];

  orgNodes.forEach((orgNode) => {
    nodes.push({
      id: orgNode._id,
      type: "custom",
      data: {
        node: orgNode, // store entire node data
        expanded: !orgNode.reportsTo, // root node expanded by default
      },
      position: { x: 0, y: 0 },
    });

    if (orgNode.reportsTo?._id) {
      edges.push({
        id: `e${orgNode.reportsTo._id}-${orgNode._id}`,
        source: orgNode.reportsTo._id,
        target: orgNode._id,
        type: "smoothstep",
        style: { stroke: "#0160A6", strokeWidth: 2.5 },
      });
    }
  });

  return { nodes, edges };
}
function layoutDagre(
  nodes: Node<{ node: OrgNodeData; expanded: boolean }>[],
  edges: Edge[],
  rootId: string,
  visibleIds: Set<string>,
  containerWidth: number,
  nodeWidth: number,
  nodeHeight: number
) {
  const g = new dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: "TB", nodesep: 20, ranksep: 80 });

  const vNodes = nodes.map((n) => ({
    ...n,
    hidden: !visibleIds.has(n.id),
  }));

  const vEdges = edges.filter(
    (e) => visibleIds.has(e.source) && visibleIds.has(e.target)
  );

  for (const n of vNodes) {
    if (!n.hidden) g.setNode(n.id, { width: nodeWidth, height: nodeHeight });
  }
  for (const e of vEdges) g.setEdge(e.source, e.target);

  dagre.layout(g);

  // Build parent-child relationships
  const childrenByParent = new Map<string, Node<CustomNodeData>[]>();
  for (const e of edges) {
    // use full edges, not filtered vEdges
    const child = vNodes.find((n) => n.id === e.target);
    if (!child) continue;
    if (!childrenByParent.has(e.source)) childrenByParent.set(e.source, []);
    childrenByParent.get(e.source)!.push(child);
  }

  // Recursive layout builder
  const positionNode = (
    nodeId: string,
    x: number,
    y: number
  ): { positioned: Node<CustomNodeData>[]; width: number; height: number } => {
    const node = vNodes.find((n) => n.id === nodeId);
    if (!node) {
      console.warn("Node not found for id:", nodeId);
      return { positioned: [], width: 0, height: 0 };
    }
    const children = childrenByParent.get(nodeId) || [];
    const positioned: Node<CustomNodeData>[] = [];
    node.position = { x, y };
    positioned.push(node);

    if (children.length === 0)
      return { positioned, width: nodeWidth, height: nodeHeight };
    const CHILDREN_PER_ROW = 3;
    const numRows = Math.ceil(children.length / CHILDREN_PER_ROW);
    const HORIZONTAL_SPACING = 30;
    const VERTICAL_SPACING = 80;

    const totalChildWidth =
      Math.min(CHILDREN_PER_ROW, children.length) * nodeWidth +
      (Math.min(CHILDREN_PER_ROW, children.length) - 1) * HORIZONTAL_SPACING;

    let currentY = y + nodeHeight + VERTICAL_SPACING;

    let totalSubtreeHeight = nodeHeight; // start with own height

    for (let r = 0; r < numRows; r++) {
      const childrenInRow = children.slice(
        r * CHILDREN_PER_ROW,
        (r + 1) * CHILDREN_PER_ROW
      );
      const rowWidth =
        childrenInRow.length * nodeWidth +
        (childrenInRow.length - 1) * HORIZONTAL_SPACING;
      const rowX = x + nodeWidth / 2 - rowWidth / 2;

      let rowMaxHeight = 0;

      childrenInRow.forEach((c, j) => {
        const childX = rowX + j * (nodeWidth + HORIZONTAL_SPACING);
        const { positioned: childNodes, height: subHeight } = positionNode(
          c.id,
          childX,
          currentY
        );
        rowMaxHeight = Math.max(rowMaxHeight, subHeight);
        positioned.push(...childNodes);
      });

      currentY += rowMaxHeight + VERTICAL_SPACING;
      totalSubtreeHeight += rowMaxHeight + VERTICAL_SPACING;
    }

    return {
      positioned,
      width: totalChildWidth,
      height: totalSubtreeHeight,
    };
  };

  // Start layout from root
  const rootX = (containerWidth - nodeWidth) / 2;
  const rootY = ROOT_TOP_Y;
  const { positioned } = positionNode(rootId, rootX, rootY);
  /* -----------------------------------------------------------------
   🔧 NEW SECTION: Align children rows horizontally after layout
----------------------------------------------------------------- */
  let layoutedNodes = positioned;
  console.log(
    "grek",
    nodes,
    vNodes,
    childrenByParent,
    positioned,
    layoutedNodes
  );
  const rows: Record<number, Node<CustomNodeData>[]> = {};

  // 1️⃣ Group nodes by rows
  for (const n of layoutedNodes) {
    if (n.hidden) continue;
    const rowY = Math.round(n.position.y / 10) * 10;
    if (!rows[rowY]) rows[rowY] = [];
    rows[rowY].push(n);
  }

  // 2️⃣ Adjust children alignment per row
  for (const row of Object.values(rows)) {
    row.sort((a, b) => a.position.x - b.position.x);
    const leftMostParent = row[0];
    const rightMostParent = row[row.length - 1];
    const isSingleParentRow = row.length === 1;

    for (const parent of row) {
      if (parent.id === rootId) continue;

      const children = layoutedNodes.filter(
        (n) =>
          !n.hidden &&
          vEdges.some((e) => e.source === parent.id && e.target === n.id)
      );
      if (children.length <= 1) continue;

      // 🧠 NEW CHECK:
      // If only one parent in this  → skip adjustments

      if (isSingleParentRow) {
        continue;
      }

      // Leftmost parent → align leftmost child
      if (parent === leftMostParent) {
        children.sort((a, b) => a.position.x - b.position.x);
        const dx = parent.position.x - children[0].position.x;
        children.forEach((c) => (c.position.x += dx));

        // Rightmost parent → align rightmost child
      } else if (parent === rightMostParent) {
        children.sort((a, b) => b.position.x - a.position.x);
        const dx = parent.position.x - children[0].position.x;
        children.forEach((c) => (c.position.x += dx));

        // Middle parents → evenly space if they have too many children
      } else {
        if (children.length === 3) {
          const startX = leftMostParent.position.x;
          let lastX = startX;
          children.sort((a, b) => a.position.x - b.position.x);
          children.forEach((c) => {
            c.position.x = lastX;
            lastX += nodeWidth + 20; // spacing between children
          });
        }
      }
    }
  }
  /* ----------------------------------------------------------------- */
  // Recalculate bounding box
  const visibleNodes = layoutedNodes.filter((n) => !n.hidden);
  console.log(visibleNodes);
  const newMinX = Math.min(...visibleNodes.map((n) => n.position.x));
  const newMaxX = Math.max(
    ...visibleNodes.map((n) => n.position.x + nodeWidth)
  );
  const newCenterX = (newMinX + newMaxX) / 2;
  const finalOffsetX = containerWidth / 2 - newCenterX;

  layoutedNodes = layoutedNodes.map((n) => {
    if (n.hidden) return n;
    let newX = n.position.x + finalOffsetX;
    const newY = n.position.y;

    if (n.id === rootId) newX = (containerWidth - nodeWidth) / 2;

    return { ...n, position: { x: newX, y: newY } };
  });

  const maxY = Math.max(
    ...layoutedNodes
      .filter((n) => !n.hidden)
      .map((n) => n.position.y + nodeHeight)
  );
  const contentHeight = Math.max(800, maxY + 100);
  console.log("grek", nodes, vNodes, layoutedNodes, visibleNodes);

  return { nodes: visibleNodes, edges: vEdges, contentHeight };
}

// -----------------------------
// Component
// -----------------------------
const MemoCustomNode = React.memo(CustomNode);
function Flow() {
  const containerRef = useRef<HTMLDivElement>(null);
  const width = useContainerWidth(containerRef);
  const { data, isLoading } = useGetTreeNodesQuery();

  const { nodes: apiNodes, edges: apiEdges } = useMemo<{
    nodes: Node<{ node: OrgNodeData; expanded: boolean }>[];
    edges: Edge[];
  }>(() => {
    if (!data?.data) return { nodes: [], edges: [] };
    return transformOrgNodesToFlow(data.data);
  }, [data]);
  const rootId = useMemo(() => {
    const root = apiNodes.find((n) => !n.data.node.reportsTo?._id);
    return root?.data.node._id || ""; // fallback to empty string if no root
  }, [apiNodes]);
  // UI state
  const initialExpandedSet = new Set<string>();
  apiNodes.forEach((n) => {
    if (!n.data.node.reportsTo) {
      initialExpandedSet.add(n.id); // root
      // add children of root
      apiNodes.forEach((child) => {
        if (child.data.node.reportsTo?._id === n.data.node._id) {
          initialExpandedSet.add(child.id);
        }
      });
    }
  });
  const [expanded, setExpanded] = useState<Set<string>>(initialExpandedSet);
  const [maxNodeHeight, setMaxNodeHeight] = useState(DEFAULT_NODE_HEIGHT);

  // measure node heights and only grow maxNodeHeight (prevents vertical jitter)
  const nodeRefs = useRef<Record<string, HTMLDivElement | null>>({});
  useLayoutEffect(() => {
    const heights = Object.values(nodeRefs.current)
      .filter(Boolean)
      .map((el) => el!.offsetHeight);
    if (heights.length) {
      const measured = Math.max(...heights);
      setMaxNodeHeight((h) => Math.max(h, measured));
    }
  });

  const handleToggle = useCallback((id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      const isOpen = next.has(id);
      const target = apiNodes.find((n) => n.id === id);
      if (!target) return prev;

      // collapse siblings (same parent)
      const siblings = apiNodes.filter(
        (n) =>
          n.data.node?.reportsTo?._id === target.data.node.reportsTo?._id &&
          n.id !== id
      );
      siblings.forEach((s) => next.delete(s.id));

      // toggle clicked
      if (isOpen) next.delete(id);
      else next.add(id);

      return next;
    });
  }, []);

  const nodeTypes = useMemo(
    () => ({
      custom: (props: CustomNodeProps) => (
        <MemoCustomNode
          {...props}
          ref={(el) => {
            nodeRefs.current[props.id] = el;
          }}
          onToggle={handleToggle}
          fixedHeight={maxNodeHeight}
          fixedWidth={(width - 100) / 4 || 340}
        />
      ),
    }),
    [handleToggle, maxNodeHeight, width]
  );
  const { nodes, edges, contentHeight } = useMemo(() => {
    if (!rootId) {
      // if no root exists, return empty layout
      return { nodes: [], edges: [], contentHeight: 0 };
    }
    const visibleIds = computeVisibleIds(apiNodes, rootId, expanded);

    console.log("visibleIds", Array.from(visibleIds));
    const nodeWidth = (width - 100) / 4 || 340;
    return layoutDagre(
      apiNodes,
      apiEdges,
      rootId,
      visibleIds,
      width || 1000,
      nodeWidth,
      maxNodeHeight
    );
  }, [expanded, width, maxNodeHeight, apiNodes]);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "80vh", // fixed height (no dancing)
        overflow: "auto", // scroll if needed
        border: "0",
      }}
    >
      {/* Optional inner wrapper to reserve scroll height */}
      <div style={{ height: contentHeight }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          nodesDraggable={false}
          panOnDrag={false}
          zoomOnScroll={false}
          zoomOnPinch={false}
          zoomOnDoubleClick={false}
          minZoom={0.5}
          maxZoom={2}
          defaultEdgeOptions={{ zIndex: -23 }}

          // No fitView calls anywhere
        />
      </div>
    </div>
  );
}

export default function TreeGraph() {
  return (
    <ReactFlowProvider>
      <Flow />
    </ReactFlowProvider>
  );
}
