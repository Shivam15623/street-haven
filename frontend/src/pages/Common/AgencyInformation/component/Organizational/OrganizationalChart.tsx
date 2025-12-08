import React, {
  useRef,
  useState,
  useCallback,
  useMemo,
  useLayoutEffect,
  useEffect,
} from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  type Edge,
  type Node,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";

import CustomNode, {
  type CustomNodeData,
  type CustomNodeProps,
} from "./CustomNode";
import {
  useGetTreeNodesQuery,
  type OrgNodeData,
} from "../../../../../services/orgApi";
import ActionOrgNode from "./ActionOrgNode";

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
  const HORIZONTAL_SPACING = 30;
  const VERTICAL_SPACING = 80;
  const CHILDREN_PER_ROW = 4;

  const containerStartX = 0; // fixed container boundary
  const containerEndX = containerWidth;

  const vNodes = nodes.map((n) => ({ ...n, hidden: !visibleIds.has(n.id) }));
  const vEdges = edges.filter(
    (e) => visibleIds.has(e.source) && visibleIds.has(e.target)
  );
  const nodeMap = new Map(vNodes.map((n) => [n.id, n]));
  const childrenByParent = new Map<string, Node<CustomNodeData>[]>();
  for (const e of vEdges) {
    const child = nodeMap.get(e.target);
    if (!child) continue;
    if (!childrenByParent.has(e.source)) childrenByParent.set(e.source, []);
    childrenByParent.get(e.source)!.push(child);
  }

  const positionNode = (
    nodeId: string,
    x: number,
    y: number
  ): { positioned: Node<CustomNodeData>[]; width: number; height: number } => {
    const node = vNodes.find((n) => n.id === nodeId)!;
    const children = childrenByParent.get(nodeId) || [];
    const positioned: Node<CustomNodeData>[] = [];
    node.position = { x, y };
    positioned.push(node);

    if (children.length === 0)
      return { positioned, width: nodeWidth, height: nodeHeight };

    const numRows = Math.ceil(children.length / CHILDREN_PER_ROW);
    const totalChildWidth =
      Math.min(CHILDREN_PER_ROW, children.length) * nodeWidth +
      (Math.min(CHILDREN_PER_ROW, children.length) - 1) * HORIZONTAL_SPACING;

    let currentY = y + nodeHeight + VERTICAL_SPACING;
    let totalSubtreeHeight = nodeHeight;

    for (let r = 0; r < numRows; r++) {
      const childrenInRow = children.slice(
        r * CHILDREN_PER_ROW,
        (r + 1) * CHILDREN_PER_ROW
      );
      const rowWidth =
        childrenInRow.length * nodeWidth +
        (childrenInRow.length - 1) * HORIZONTAL_SPACING;

      // Try parent-centered alignment
      let rowX = x + nodeWidth / 2 - rowWidth / 2;

      // Detect collision with container edges
      if (rowX < containerStartX || rowX + rowWidth > containerEndX) {
        // If any child will overflow, fallback to root-centered alignment
        rowX = containerWidth / 2 - rowWidth / 2;
      }

      console.log(
        `Parent ${node.data.node.label} Row ${r}: startX = ${rowX}, endX = ${
          rowX + rowWidth
        }`
      );

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

    return { positioned, width: totalChildWidth, height: totalSubtreeHeight };
  };

  const rootX = containerWidth / 2 - nodeWidth / 2;
  const rootY = ROOT_TOP_Y;
  const { positioned } = positionNode(rootId, rootX, rootY);

  const visibleNodes = positioned.filter((n) => !n.hidden);
  const minX = Math.min(...visibleNodes.map((n) => n.position.x));
  const maxX = Math.max(...visibleNodes.map((n) => n.position.x + nodeWidth));
  const centerOffset = containerWidth / 2 - (minX + (maxX - minX) / 2);

  visibleNodes.forEach((n) => {
    n.position.x += centerOffset;
  });

  const contentHeight = Math.max(
    800,
    Math.max(...visibleNodes.map((n) => n.position.y + nodeHeight)) + 100
  );

  return { nodes: visibleNodes, edges: vEdges, contentHeight };
}
// -----------------------------
// Component
// -----------------------------
const MemoCustomNode = React.memo(CustomNode);
function Flow() {
  const containerRef = useRef<HTMLDivElement>(null);
  const width = useContainerWidth(containerRef);
  const { data } = useGetTreeNodesQuery();
  const [selectedNode, setSelectedNode] = useState<OrgNodeData | null>();
  const [showEditModal, setShowEditModal] = useState(false);
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
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  useEffect(() => {
    if (apiNodes.length > 0 && rootId) {
      const initialExpandedSet = new Set<string>();
      const root = apiNodes.find((n) => n.id === rootId);

      if (root) {
        initialExpandedSet.add(rootId);
      }
      console.log("Initial expanded set:", initialExpandedSet);

      setExpanded(initialExpandedSet);
    }
  }, [apiNodes, rootId]);

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

  const handleToggle = useCallback(
    (id: string) => {
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
    },
    [apiNodes]
  );
  const handleEditNode = useCallback(
    (id: string) => {
      const node = apiNodes.find((n) => n.data.node._id === id);
      if (node) {
        setSelectedNode(node.data.node);
        setShowEditModal(true);
      }
    },
    [apiNodes]
  );
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
          onEdit={handleEditNode}
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

  const handleClose = () => {
    setShowEditModal(false);
    setSelectedNode(null);
  };

  return (
    <>
      {" "}
      <div
        ref={containerRef}
        onWheel={(e) => e.stopPropagation()}
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
            // edgeTypes={edgeTypes}
            nodesDraggable={false}
            panOnDrag={false}
            zoomOnScroll={false}
            zoomOnPinch={false}
            panOnScroll={false}
            zoomOnDoubleClick={false}
            minZoom={0.5}
            maxZoom={2}
            defaultEdgeOptions={{ zIndex: -1 }}
            elevateNodesOnSelect={false} // ✅ Add this
            edgesFocusable={false} // ✅ Add this
            // No fitView calls anywhere
          />
        </div>
      </div>
      {showEditModal &&
        selectedNode &&
        selectedNode !== null &&
        selectedNode !== undefined && (
          <ActionOrgNode
            show={showEditModal}
            onHide={handleClose}
            orgNode={selectedNode} // passes selected node data
          />
        )}
    </>
  );
}

export default function TreeGraph() {
  return (
    <ReactFlowProvider>
      <Flow />
    </ReactFlowProvider>
  );
}
