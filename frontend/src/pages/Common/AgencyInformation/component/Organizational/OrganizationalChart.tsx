import React, {
  useRef,
  useState,
  useCallback,
  useMemo,
  useLayoutEffect,
  useEffect,
} from "react";
import {
  Controls,
  ReactFlow,
  ReactFlowProvider,
  type Edge,
  type Node,
} from "@xyflow/react";
import dagre from "@dagrejs/dagre";
import "@xyflow/react/dist/style.css";

import CustomNode, { type CustomNodeProps } from "./CustomNode";
import {
  useGetTreeNodesQuery,
  type OrgNodeData,
} from "../../../../../services/orgApi";
import UserNodeDetail from "./UserNodeDetail";

const DEFAULT_NODE_HEIGHT = 190;

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

  visibleIds: Set<string>,

  nodeWidth: number,
  nodeHeight: number
) {
  const g = new dagre.graphlib.Graph();

  g.setDefaultEdgeLabel(() => ({}));

  g.setGraph({
    rankdir: "TB", // Top → Bottom
    nodesep: 30, // horizontal spacing
    ranksep: 80, // vertical spacing
    marginx: 20,
    marginy: 20,
  });

  // ---- Filter visible nodes & edges ----
  const vNodes = nodes
    .filter((n) => visibleIds.has(n.id))
    .map((n) => ({ ...n, hidden: false }));

  const vEdges = edges.filter(
    (e) => visibleIds.has(e.source) && visibleIds.has(e.target)
  );

  // ---- Add nodes to Dagre ----
  vNodes.forEach((node) => {
    g.setNode(node.id, {
      width: nodeWidth,
      height: nodeHeight,
    });
  });

  // ---- Add edges to Dagre ----
  vEdges.forEach((edge) => {
    g.setEdge(edge.source, edge.target);
  });

  // ---- Run layout ----
  dagre.layout(g);

  // ---- Apply positions ----
  vNodes.forEach((node) => {
    const dagreNode = g.node(node.id);
    node.position = {
      x: dagreNode.x - nodeWidth / 2,
      y: dagreNode.y - nodeHeight / 2,
    };
  });

  // ---- Calculate scroll height ----
  const contentHeight = Math.max(
    800,
    Math.max(...vNodes.map((n) => n.position.y + nodeHeight)) + 100
  );

  return {
    nodes: vNodes,
    edges: vEdges,
    contentHeight,
  };
}
// -----------------------------
// Component
// -----------------------------
const MemoCustomNode = React.memo(CustomNode);
function Flow() {
  const containerRef = useRef<HTMLDivElement>(null);
  const width = useContainerWidth(containerRef);
  const { data } = useGetTreeNodesQuery(undefined, {
    refetchOnMountOrArgChange: false,
  });
  const [selectedNode, setSelectedNode] = useState<OrgNodeData | null>(null);
  const [showModal, setShowModal] = useState(false);

  const handleOpenModal = (node: OrgNodeData) => {
    setSelectedNode(node);
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
    setSelectedNode(null);
  };
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
          onOpenModal={handleOpenModal}
          fixedWidth={280}
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


    const nodeWidth = 340;
    return layoutDagre(
      apiNodes,
      apiEdges,
      visibleIds,
      nodeWidth,
      maxNodeHeight
    );
  }, [expanded, width, maxNodeHeight, apiNodes]);

  return (
    <>
      {" "}
      <div
        ref={containerRef}
        style={{
          width: "100%",
          height: "80vh", // fixed height (no dancing)
          overflow: "auto", // scroll if needed
          border: "0",
          WebkitOverflowScrolling: "touch",
          touchAction: "pan-y pinch-zoom", // ✅ allow scroll + pinch
        }}
      >
        {/* Optional inner wrapper to reserve scroll height */}
        <div style={{ height: contentHeight }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            nodesDraggable={false}
            panOnDrag={true} // ✅ ENABLE on mobile
            panOnScroll={false}
            minZoom={0.2} // ✅ allow zoom OUT
            maxZoom={2}
            zoomOnScroll={false} // ✅ disable wheel zoom
            zoomOnPinch={true} // ✅ mobile pinch zoom
            preventScrolling={false} // ✅ allow container scroll
            zoomOnDoubleClick={false}
            defaultEdgeOptions={{ zIndex: -1 }}
            elevateNodesOnSelect={false}
            edgesFocusable={false}
          >
            {" "}
            <Controls showZoom showFitView />
          </ReactFlow>
          {showModal && selectedNode && (
            <UserNodeDetail
              show={showModal}
              handleclose={handleClose}
              id={selectedNode._id}
            />
          )}
        </div>
      </div>
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
