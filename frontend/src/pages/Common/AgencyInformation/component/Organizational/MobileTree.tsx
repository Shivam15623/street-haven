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
import { Icon } from "@iconify/react";
import {
  useGetTreeNodesQuery,
  type OrgNodeData,
} from "../../../../../services/orgApi";

// --------------------------------------------------------
// Custom node (TreeNode)
// --------------------------------------------------------
interface TreeNodeData extends Record<string, unknown> {
  label: string;
  width?: number;
}

const TreeNode = ({ data }: { data: TreeNodeData }) => (
  <div style={{ width: data.width || "auto" }}>
    <div className="d-flex flex-row gap-2 align-items-center">
      <div className="p-2 position-relative">
        <Handle type="target" position={Position.Left} style={{ opacity: 0 }} />
        <div className="bg-street-primary-10 w-40-px h-40-px d-flex justify-content-center align-items-center radius-8">
          <Icon icon="carbon:user-multiple" className="text-xl text-street-primary" />
        </div>
        <Handle
          type="source"
          position={Position.Bottom}
          style={{ opacity: 0, position: "absolute", left: "50%" }}
        />
      </div>
      <div className="text-sm">{data.label}</div>
    </div>
  </div>
);

const nodeTypes = { tree: TreeNode };

// --------------------------------------------------------
// Convert API OrgNodes → ReactFlow nodes + edges
// --------------------------------------------------------
function convertOrgToFlow(orgNodes: OrgNodeData[]) {
  const nodes: Node<TreeNodeData>[] = [];
  const edges: Edge[] = [];

  orgNodes.forEach((node) => {
    nodes.push({
      id: node._id,
      type: "tree",
      data: { label: node.name },
      position: { x: 0, y: 0 },
    });

    if (node.reportsTo?._id) {
      edges.push({
        id: `e-${node.reportsTo._id}-${node._id}`,
        source: node.reportsTo._id,
        target: node._id,
        type: "smoothstep",
      });
    }
  });

  return { nodes, edges };
}

// --------------------------------------------------------
// Auto layout (tree layout)
// --------------------------------------------------------
function autoLayout(
  nodes: Node<TreeNodeData>[],
  edges: Edge[],
  containerWidth: number
) {
  const nodeMap = new Map(nodes.map((n) => [n.id, { ...n }]));

  const childrenMap: Record<string, string[]> = {};
  edges.forEach((e) => {
    if (!childrenMap[e.source]) childrenMap[e.source] = [];
    childrenMap[e.source].push(e.target);
  });

  const levelGap = (containerWidth - 120) / 7 ;
  const verticalGap = 75;
  let maxY = 0;

  const getRoot = () =>
    nodes.find((n) => !edges.some((e) => e.target === n.id));

  const positionNode = (id: string, depth: number, y: number): number => {
    const node = nodeMap.get(id);
    if (!node) return y;

    const x = depth * levelGap;
    node.position = { x, y };

    node.data.width = (containerWidth - x - 30) / 1.3;

    const children = childrenMap[id] || [];
    let currY = y;

    children.forEach((childId) => {
      currY += verticalGap;
      currY = positionNode(childId, depth + 1, currY);
    });

    maxY = Math.max(maxY, currY);
    return currY;
  };

  const root = getRoot();
  if (root) positionNode(root.id, 0, 0);

  return {
    nodes: [...nodeMap.values()],
    contentHeight: maxY + verticalGap,
  };
}

// --------------------------------------------------------
// Flow Component
// --------------------------------------------------------
function Flow() {
  const { data } = useGetTreeNodesQuery();
  const [containerWidth, setContainerWidth] = useState(window.innerWidth);

  const { nodes: apiNodes, edges: apiEdges } = useMemo(() => {
    if (!data?.data) return { nodes: [], edges: [] };
    return convertOrgToFlow(data.data);
  }, [data]);

  useEffect(() => {
    const resize = () => setContainerWidth(window.innerWidth);
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  const { nodes: layoutNodes, contentHeight } = useMemo(() => {
    return autoLayout(apiNodes, apiEdges, containerWidth);
  }, [apiNodes, apiEdges, containerWidth]);

  return (
    <div
      className="d-block d-sm-none"
      style={{ width: "100%", height: "90vh", overflow: "auto" }}
    >
      <div style={{ width: "100%", height: `${contentHeight}px` }}>
        <ReactFlow
          nodes={layoutNodes}
          edges={apiEdges}
          nodeTypes={nodeTypes}
          nodesDraggable={false}
          nodesConnectable={false}
          panOnDrag={false}
          zoomOnScroll={false}
          zoomOnDoubleClick={false}
          zoomOnPinch={false}
        />
      </div>
    </div>
  );
}

// --------------------------------------------------------
// Export mobile tree
// --------------------------------------------------------
export default function MobileTree() {
  return (
    <ReactFlowProvider>
      <Flow />
    </ReactFlowProvider>
  );
}
