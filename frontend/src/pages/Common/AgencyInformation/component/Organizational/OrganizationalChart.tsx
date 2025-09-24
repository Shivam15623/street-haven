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
  Position,
} from "@xyflow/react";
import dagre from "@dagrejs/dagre";
import "@xyflow/react/dist/style.css";

import CustomNode, {
  type CustomNodeData,
  type CustomNodeProps,
} from "./CustomNode";

/* -----------------------------
   Constants & Defaults
------------------------------ */

/* -----------------------------
   Initial Data
------------------------------ */
const initialNodes: Node<CustomNodeData>[] = [
  // Root
  {
    id: "1",
    type: "custom",
    data: {
      label: "Executive Director",
      department: "Administration",
      reportsTo: "Board of Directors",
      supervises: [
        "Clinical Director",
        "Housing Program Manager",
        "Finance Manager",
        "Operations Manager",
      ],
      expanded: true,
    },
    position: { x: 0, y: 0 },
  },

  // Level 1 - Four direct children of root
  {
    id: "2",
    type: "custom",
    data: {
      label: "Clinical Director",
      department: "Clinical Services",
      reportsTo: "Executive Director",
      supervises: ["Therapists", "Supervisors", "Assistants", "Specialists"],
      expanded: false,
    },
    position: { x: 0, y: 0 },
  },
  {
    id: "3",
    type: "custom",
    data: {
      label: "Housing Program Manager",
      department: "Housing Services",
      reportsTo: "Executive Director",
      supervises: [
        "Housing Coordinators",
        "Support Workers",
        "Case Managers",
        "Specialists",
      ],
      expanded: false,
    },
    position: { x: 0, y: 0 },
  },
  {
    id: "4",
    type: "custom",
    data: {
      label: "Finance Manager",
      department: "Finance & Admin",
      reportsTo: "Executive Director",
      supervises: [
        "Finance Assistant",
        "Development Coordinator",
        "Accountants",
        "Auditors",
      ],
      expanded: false,
    },
    position: { x: 0, y: 0 },
  },
  {
    id: "5",
    type: "custom",
    data: {
      label: "Operations Manager",
      department: "Operations",
      reportsTo: "Executive Director",
      supervises: ["Logistics", "Facilities", "Maintenance", "Procurement"],
      expanded: false,
    },
    position: { x: 0, y: 0 },
  },

  // Level 2 - Clinical Director children (4)
  {
    id: "2a",
    type: "custom",
    data: {
      label: "Therapist Lead",
      department: "Therapy",
      reportsTo: "Clinical Director",
      supervises: [],
      expanded: false,
    },
    position: { x: 0, y: 0 },
  },
  {
    id: "2b",
    type: "custom",
    data: {
      label: "Supervisor Lead",
      department: "Clinical Supervision",
      reportsTo: "Clinical Director",
      supervises: [],
      expanded: false,
    },
    position: { x: 0, y: 0 },
  },
  {
    id: "2c",
    type: "custom",
    data: {
      label: "Case Manager Lead",
      department: "Case Mgmt",
      reportsTo: "Clinical Director",
      supervises: [],
      expanded: false,
    },
    position: { x: 0, y: 0 },
  },
  {
    id: "2d",
    type: "custom",
    data: {
      label: "Clinical Specialist",
      department: "Special Services",
      reportsTo: "Clinical Director",
      supervises: [],
      expanded: false,
    },
    position: { x: 0, y: 0 },
  },

  // Level 2 - Housing Manager children (4)
  {
    id: "3a",
    type: "custom",
    data: {
      label: "Housing Coordinator",
      department: "Housing",
      reportsTo: "Housing Program Manager",
      supervises: [],
      expanded: false,
    },
    position: { x: 0, y: 0 },
  },
  {
    id: "3b",
    type: "custom",
    data: {
      label: "Support Worker",
      department: "Housing Support",
      reportsTo: "Housing Program Manager",
      supervises: [],
      expanded: false,
    },
    position: { x: 0, y: 0 },
  },
  {
    id: "3c",
    type: "custom",
    data: {
      label: "Case Manager",
      department: "Case Mgmt",
      reportsTo: "Housing Program Manager",
      supervises: [],
      expanded: false,
    },
    position: { x: 0, y: 0 },
  },
  {
    id: "3d",
    type: "custom",
    data: {
      label: "Housing Specialist",
      department: "Special Services",
      reportsTo: "Housing Program Manager",
      supervises: [],
      expanded: false,
    },
    position: { x: 0, y: 0 },
  },

  // Level 2 - Finance Manager children (4)
  {
    id: "4a",
    type: "custom",
    data: {
      label: "Finance Assistant",
      department: "Finance",
      reportsTo: "Finance Manager",
      supervises: [],
      expanded: false,
    },
    position: { x: 0, y: 0 },
  },
  {
    id: "4b",
    type: "custom",
    data: {
      label: "Development Coordinator",
      department: "Fundraising",
      reportsTo: "Finance Manager",
      supervises: [],
      expanded: false,
    },
    position: { x: 0, y: 0 },
  },
  {
    id: "4c",
    type: "custom",
    data: {
      label: "Accountant",
      department: "Accounting",
      reportsTo: "Finance Manager",
      supervises: [],
      expanded: false,
    },
    position: { x: 0, y: 0 },
  },
  {
    id: "4d",
    type: "custom",
    data: {
      label: "Auditor",
      department: "Audit",
      reportsTo: "Finance Manager",
      supervises: [],
      expanded: false,
    },
    position: { x: 0, y: 0 },
  },

  // Level 2 - Operations Manager children (4)
  {
    id: "5a",
    type: "custom",
    data: {
      label: "Logistics Coordinator",
      department: "Logistics",
      reportsTo: "Operations Manager",
      supervises: [],
      expanded: false,
    },
    position: { x: 0, y: 0 },
  },
  {
    id: "5b",
    type: "custom",
    data: {
      label: "Facilities Supervisor",
      department: "Facilities",
      reportsTo: "Operations Manager",
      supervises: [],
      expanded: false,
    },
    position: { x: 0, y: 0 },
  },
  {
    id: "5c",
    type: "custom",
    data: {
      label: "Maintenance Lead",
      department: "Maintenance",
      reportsTo: "Operations Manager",
      supervises: [],
      expanded: false,
    },
    position: { x: 0, y: 0 },
  },
  {
    id: "5d",
    type: "custom",
    data: {
      label: "Procurement Lead",
      department: "Procurement",
      reportsTo: "Operations Manager",
      supervises: [],
      expanded: false,
    },
    position: { x: 0, y: 0 },
  },
];

const initialEdges: Edge[] = [
  // Root → Level 1
  {
    id: "e12",
    source: "1",
    target: "2",
    type: "smoothstep",
    style: { stroke: "#0160A6", strokeWidth: 2.5 },
  },
  {
    id: "e13",
    source: "1",
    target: "3",
    type: "smoothstep",
    style: { stroke: "#0160A6", strokeWidth: 2.5 },
  },
  {
    id: "e14",
    source: "1",
    target: "4",
    type: "smoothstep",
    style: { stroke: "#0160A6", strokeWidth: 2.5 },
  },
  {
    id: "e15",
    source: "1",
    target: "5",
    type: "smoothstep",
    style: { stroke: "#0160A6", strokeWidth: 2.5 },
  },

  // Clinical Director → 4 children
  {
    id: "e22a",
    source: "2",
    target: "2a",
    type: "smoothstep",
    style: { stroke: "#0160A6", strokeWidth: 2.5 },
  },
  {
    id: "e22b",
    source: "2",
    target: "2b",
    type: "smoothstep",
    style: { stroke: "#0160A6", strokeWidth: 2.5 },
  },
  {
    id: "e22c",
    source: "2",
    target: "2c",
    type: "smoothstep",
    style: { stroke: "#0160A6", strokeWidth: 2.5 },
  },
  {
    id: "e22d",
    source: "2",
    target: "2d",
    type: "smoothstep",
    style: { stroke: "#0160A6", strokeWidth: 2.5 },
  },

  // Housing Manager → 4 children
  {
    id: "e33a",
    source: "3",
    target: "3a",
    type: "smoothstep",
    style: { stroke: "#0160A6", strokeWidth: 2.5 },
  },
  {
    id: "e33b",
    source: "3",
    target: "3b",
    type: "smoothstep",
    style: { stroke: "#0160A6", strokeWidth: 2.5 },
  },
  {
    id: "e33c",
    source: "3",
    target: "3c",
    type: "smoothstep",
    style: { stroke: "#0160A6", strokeWidth: 2.5 },
  },
  {
    id: "e33d",
    source: "3",
    target: "3d",
    type: "smoothstep",
    style: { stroke: "#0160A6", strokeWidth: 2.5 },
  },

  // Finance Manager → 4 children
  {
    id: "e44a",
    source: "4",
    target: "4a",
    type: "smoothstep",
    style: { stroke: "#0160A6", strokeWidth: 2.5 },
  },
  {
    id: "e44b",
    source: "4",
    target: "4b",
    type: "smoothstep",
    style: { stroke: "#0160A6", strokeWidth: 2.5 },
  },
  {
    id: "e44c",
    source: "4",
    target: "4c",
    type: "smoothstep",
    style: { stroke: "#0160A6", strokeWidth: 2.5 },
  },
  {
    id: "e44d",
    source: "4",
    target: "4d",
    type: "smoothstep",
    style: { stroke: "#0160A6", strokeWidth: 2.5 },
  },

  // Operations Manager → 4 children
  {
    id: "e55a",
    source: "5",
    target: "5a",
    type: "smoothstep",
    style: { stroke: "#0160A6", strokeWidth: 2.5 },
  },
  {
    id: "e55b",
    source: "5",
    target: "5b",
    type: "smoothstep",
    style: { stroke: "#0160A6", strokeWidth: 2.5 },
  },
  {
    id: "e55c",
    source: "5",
    target: "5c",
    type: "smoothstep",
    style: { stroke: "#0160A6", strokeWidth: 2.5 },
  },
  {
    id: "e55d",
    source: "5",
    target: "5d",
    type: "smoothstep",
    style: { stroke: "#0160A6", strokeWidth: 2.5 },
  },
];

/* -----------------------------
   Flow Component
------------------------------ */

const ROOT_ID = "1";
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

function computeVisibleIds(expandedSet: Set<string>) {
  const byId = new Map(initialNodes.map((n) => [n.id, n]));
  const visible = new Set<string>([ROOT_ID]);

  function visit(id: string) {
    const node = byId.get(id);
    if (!node) return;
    if (expandedSet.has(id)) {
      const children = initialNodes.filter(
        (c) => c.data.reportsTo === node.data.label
      );
      for (const c of children) {
        visible.add(c.id);
        visit(c.id);
      }
    }
  }
  visit(ROOT_ID);
  return visible;
}
function layoutDagre(
  visibleIds: Set<string>,
  containerWidth: number,
  nodeWidth: number,
  nodeHeight: number
) {
  const g = new dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: "TB", nodesep: 20, ranksep: 130 });

  // Mark nodes as hidden or visible
  const vNodes = initialNodes.map((n) => ({
    ...n,
    hidden: !visibleIds.has(n.id),
  }));
  const vEdges = initialEdges.filter(
    (e) => visibleIds.has(e.source) && visibleIds.has(e.target)
  );

  // Add visible nodes to dagre
  for (const n of vNodes) {
    if (!n.hidden) g.setNode(n.id, { width: nodeWidth, height: nodeHeight });
  }

  // Add edges to dagre
  for (const e of vEdges) g.setEdge(e.source, e.target);

  // Compute dagre layout
  dagre.layout(g);

  // Initial positions from dagre
  const visibleDagNodes = vNodes
    .filter((n) => !n.hidden)
    .map((n) => g.node(n.id));
  const minX = Math.min(...visibleDagNodes.map((dn) => dn.x - dn.width / 2));
  const maxX = Math.max(...visibleDagNodes.map((dn) => dn.x + dn.width / 2));
  const centerX = (minX + maxX) / 2;
  const offsetX = containerWidth / 2 - centerX;

  let layoutedNodes: Node<CustomNodeData>[] = vNodes.map((n) => {
    if (n.hidden) return n;
    const dn = g.node(n.id)!;
    let x = dn.x - dn.width / 2 + offsetX;
    const y = dn.y - dn.height / 2 + ROOT_TOP_Y;

    if (n.id === ROOT_ID) x = (containerWidth - dn.width) / 2;

    return {
      ...n,
      position: { x, y },
      sourcePosition: Position.Bottom,
      targetPosition: Position.Top,
    };
  });

  /* -----------------------------
     Post-processing adjustment
  ------------------------------ */
  // group nodes by row (y position rounded)
  const rows: Record<number, Node<CustomNodeData>[]> = {};
  for (const n of layoutedNodes) {
    if (n.hidden) continue;
    const rowY = Math.round(n.position.y / 10) * 10;
    if (!rows[rowY]) rows[rowY] = [];
    rows[rowY].push(n);
  }

  // adjust children positions
  for (const row of Object.values(rows)) {
    row.sort((a, b) => a.position.x - b.position.x);
    const leftMostParent = row[0];
    const rightMostParent = row[row.length - 1];

    for (const parent of row) {
      if (parent.id === ROOT_ID) continue;

      const children = layoutedNodes.filter(
        (n) =>
          !n.hidden &&
          vEdges.some((e) => e.source === parent.id && e.target === n.id)
      );
      if (children.length <= 1) continue;

      if (parent === leftMostParent) {
        // leftmost parent: align leftmost child
        children.sort((a, b) => a.position.x - b.position.x);
        const dx = parent.position.x - children[0].position.x;
        children.forEach((c) => (c.position.x += dx));
      } else if (parent === rightMostParent) {
        // rightmost parent: align rightmost child
        children.sort((a, b) => b.position.x - a.position.x);
        const dx = parent.position.x - children[0].position.x;
        children.forEach((c) => (c.position.x += dx));
      } else {
        if (children.length > 3) {
          const startX = leftMostParent.position.x;
          let lastX = startX;
          children.sort((a, b) => a.position.x - b.position.x); // optional
          children.forEach((c) => {
            c.position.x = lastX;
            lastX += nodeWidth + 20; // spacing between children
          });
        }
      }
    }
  }

  // Recalculate bounding box
  const visibleNodes = layoutedNodes.filter((n) => !n.hidden);
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

    if (n.id === ROOT_ID) newX = (containerWidth - nodeWidth) / 2;

    return { ...n, position: { x: newX, y: newY } };
  });

  const maxY = Math.max(
    ...layoutedNodes
      .filter((n) => !n.hidden)
      .map((n) => n.position.y + nodeHeight)
  );
  const contentHeight = Math.max(800, maxY + 100);

  return { nodes: layoutedNodes, edges: vEdges, contentHeight };
}

// -----------------------------
// Component
// -----------------------------
const MemoCustomNode = React.memo(CustomNode);

function Flow() {
  const containerRef = useRef<HTMLDivElement>(null);
  const width = useContainerWidth(containerRef);

  // UI state
  const [expanded, setExpanded] = useState<Set<string>>(
    () => new Set(initialNodes.filter((n) => n.data.expanded).map((n) => n.id))
  );
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
      const target = initialNodes.find((n) => n.id === id);
      if (!target) return prev;

      // collapse siblings (same parent)
      const siblings = initialNodes.filter(
        (n) => n.data.reportsTo === target.data.reportsTo && n.id !== id
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
    custom: (props:CustomNodeProps) => (
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
    const visibleIds = computeVisibleIds(expanded);
    const nodeWidth = (width - 100) / 4 || 340;
    return layoutDagre(visibleIds, width || 1000, nodeWidth, maxNodeHeight);
  }, [expanded, width, maxNodeHeight]);

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
