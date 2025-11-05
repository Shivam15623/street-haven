import { useMemo, useState, useEffect } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  Handle,
  Position,
  type Node,
  type Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Icon } from "@iconify/react/dist/iconify.js";

// -----------------------------
// Custom Tree Node
// -----------------------------
interface TreeNodeData {
  label: string;
  width?: number;
}

const TreeNode = ({ data }: { data: TreeNodeData }) => {
  return (
    <div style={{ width: data.width || "auto" }}>
      <div className="d-flex flex-row gap-2 align-items-center">
        <div className="p-2 position-relative">
          <Handle
            type="target"
            position={Position.Left}
            style={{ opacity: 0 }}
            isConnectable={false}
          />
          <div className="bg-street-primary-10 w-40-px h-40-px d-flex justify-content-center align-items-center radius-8">
            <Icon
              icon="carbon:user-multiple"
              className="text-xl sm:text-xxl text-street-primary"
            />
          </div>
          <Handle
            type="source"
            position={Position.Bottom}
            style={{ opacity: 0, position: "absolute", left: "50%" }}
            isConnectable={false}
          />
        </div>
        <div className="text-sm">{data.label}</div>
      </div>
    </div>
  );
};

const nodeTypes = { tree: TreeNode };
// -----------------------------
// Nodes & Edges
// -----------------------------
const initialNodes: Node[] = [
  {
    id: "1",
    type: "tree",
    data: { label: "Director" },
    position: { x: 0, y: 0 },
  },
  {
    id: "2",
    type: "tree",
    data: { label: "Innovative Compute Environments" },
    position: { x: 0, y: 0 },
  },
  {
    id: "3",
    type: "tree",
    data: { label: "Cloud Services" },
    position: { x: 0, y: 0 },
  },
  {
    id: "4",
    type: "tree",
    data: { label: "HPC Systems" },
    position: { x: 0, y: 0 },
  },
  {
    id: "5",
    type: "tree",
    data: { label: "Data Storage Services" },
    position: { x: 0, y: 0 },
  },
  {
    id: "6",
    type: "tree",
    data: { label: "Networking and Security" },
    position: { x: 0, y: 0 },
  },
  {
    id: "7",
    type: "tree",
    data: { label: "Business Development and User Engagement" },
    position: { x: 0, y: 0 },
  },
  {
    id: "8",
    type: "tree",
    data: { label: "User Support" },
    position: { x: 0, y: 0 },
  },
  {
    id: "9",
    type: "tree",
    data: { label: "Training" },
    position: { x: 0, y: 0 },
  },
];

const initialEdges: Edge[] = [
  { id: "e1-2", source: "1", target: "2", type: "step" },
  { id: "e2-3", source: "2", target: "3", type: "step" },
  { id: "e2-4", source: "2", target: "4", type: "step" },
  { id: "e2-5", source: "2", target: "5", type: "step" },
  { id: "e2-6", source: "2", target: "6", type: "step" },
  { id: "e1-7", source: "1", target: "7", type: "step" },
  { id: "e7-8", source: "7", target: "8", type: "step" },
  { id: "e7-9", source: "7", target: "9", type: "step" },
];

// -----------------------------
// Responsive Layout Function
// -----------------------------
const layoutTree = (
  nodes: Node[],
  edges: Edge[],
  containerWidth: number
): { nodes: Node[]; contentHeight: number } => {
  const nodeMap = new Map(nodes.map((n) => [n.id, { ...n }]));

  const childrenMap: Record<string, string[]> = {};
  edges.forEach((edge) => {
    if (!childrenMap[edge.source]) childrenMap[edge.source] = [];
    childrenMap[edge.source].push(edge.target);
  });

  const startY = 0;

  const levelIndent = (containerWidth - 30) / 7;
  const verticalGap = 75;

  let maxY = startY;

  const positionNode = (id: string, depth: number, y: number): number => {
    const node = nodeMap.get(id);
    if (!node) return y;

    const x = depth * levelIndent;
    node.position = { x, y };

    // Calculate width dynamically based on container width and x

    const dynamicWidth = (containerWidth - x - 30) / 1.3; // 20px padding
    node.data = { ...node.data, width: dynamicWidth };

    let currY = y;
    const children = childrenMap[id] || [];
    children.forEach((childId) => {
      currY += verticalGap;
      currY = positionNode(childId, depth + 1, currY);
    });

    if (currY > maxY) maxY = currY;
    return currY;
  };

  const root = nodes.find((n) => !edges.some((e) => e.target === n.id));
  if (root) positionNode(root.id, 0, startY);

  const contentHeight = maxY - startY + verticalGap;
  return { nodes: [...nodeMap.values()], contentHeight };
};

// -----------------------------
// Flow Component
// -----------------------------
function Flow() {
  const [containerWidth, setContainerWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setContainerWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const { nodes, contentHeight } = useMemo(
    () => layoutTree(initialNodes, initialEdges, containerWidth),
    [containerWidth]
  );

  return (
    <div
      className="d-block d-sm-none"
      style={{
        width: "100%",
        height: "90vh",
        overflow: "auto", // allow both directions
      }}
    >
      <div style={{ width: "100%", height: `${contentHeight}px` }}>
        {/* give a large scrollable canvas */}
        <ReactFlow
          nodes={nodes}
          edges={initialEdges}
          nodeTypes={nodeTypes}
          nodesDraggable={false}
          nodesConnectable={false} // instead of connectable
          panOnDrag={false}
          zoomOnScroll={false}
          zoomOnPinch={false}
          zoomOnDoubleClick={false}
          minZoom={0.5}
          maxZoom={2}
          fitView={false}
        />
      </div>
    </div>
  );
}

export default function MobileTree() {
  return (
    <ReactFlowProvider>
      <Flow />
    </ReactFlowProvider>
  );
}
