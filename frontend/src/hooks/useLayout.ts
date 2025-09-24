import { useMemo, useState } from "react";
import {
  defaultHeight,
  defaultWidth,
} from "../pages/Employee/AgencyInformation/component/Organizational/constNodes";
import {
  initialEdges,
  initialNodes,
} from "../pages/Employee/AgencyInformation/component/Organizational/dataTree";
import dagre from "@dagrejs/dagre";
import type { CustomNodeData } from "../pages/Employee/AgencyInformation/component/Organizational/CustomNode";
import { Position, type Node } from "@xyflow/react";

export function useLayout(
  expandedMap: Record<string, boolean>,
  nodeRefs: React.MutableRefObject<Record<string, HTMLDivElement | null>>,
  containerRef: React.RefObject<HTMLDivElement>
) {
  const [containerHeight, setContainerHeight] = useState(800);
  const [maxHeight, setMaxHeight] = useState(defaultHeight);

  const { visibleNodes, visibleEdges } = useMemo(() => {
    const visible = new Set<string>(["1"]);
    const nodeMap = Object.fromEntries(initialNodes.map((n) => [n.id, n]));

    const visit = (nodeId: string) => {
      const node = nodeMap[nodeId];
      if (!node) return;
      if (expandedMap[nodeId]) {
        initialNodes
          .filter((c) => c.data.reportsTo === node.data.label)
          .forEach((c) => {
            visible.add(c.id);
            visit(c.id);
          });
      }
    };
    visit("1");

    const vNodes = initialNodes.map((n) => ({
      ...n,
      hidden: !visible.has(n.id),
      data: { ...n.data, expanded: expandedMap[n.id] },
    }));
    const vEdges = initialEdges.filter(
      (e) => visible.has(e.source) && visible.has(e.target)
    );

    const dagreGraph = new dagre.graphlib.Graph().setDefaultEdgeLabel(
      () => ({})
    );
    dagreGraph.setGraph({ rankdir: "TB", nodesep: 20, ranksep: 140 });

    // measure heights
    const heights = Object.values(nodeRefs.current)
      .filter(Boolean)
      .map((el) => el!.offsetHeight);
    const computedMaxHeight = Math.max(...heights, defaultHeight);
    setMaxHeight(computedMaxHeight);

    // apply dagre layout
    vNodes.forEach((node) => {
      const width = nodeRefs.current[node.id]?.offsetWidth || defaultWidth;
      dagreGraph.setNode(node.id, { width, height: computedMaxHeight });
    });
    vEdges.forEach((edge) => dagreGraph.setEdge(edge.source, edge.target));

    dagre.layout(dagreGraph);

    const containerWidth = containerRef.current?.clientWidth || 1000;
    const rootNodeId = "1";
    const rootDagNode = dagreGraph.node(rootNodeId)!;
    const rootY = 50;

    const rootChildren = vNodes.filter((n) =>
      vEdges.some((e) => e.source === rootNodeId && e.target === n.id)
    );

    let minChildX = Infinity,
      maxChildX = -Infinity;
    rootChildren.forEach((n) => {
      const dagNode = dagreGraph.node(n.id)!;
      minChildX = Math.min(minChildX, dagNode.x - dagNode.width / 2);
      maxChildX = Math.max(maxChildX, dagNode.x + dagNode.width / 2);
    });

    let offsetX = containerWidth / 2 - rootDagNode.x;
    let childrenCenterX = 0;
    if (rootChildren.length > 0) {
      childrenCenterX = (minChildX + maxChildX) / 2;
      offsetX = containerWidth / 2 - childrenCenterX;
    }

    let minY = Infinity,
      maxY = -Infinity;
    const layoutedNodes: Node<CustomNodeData>[] = vNodes.map((node) => {
      const dagNode = dagreGraph.node(node.id)!;
      let x = dagNode.x - dagNode.width / 2 + offsetX;
      const y = dagNode.y - dagNode.height / 2 + rootY;

      if (node.id === rootNodeId && rootChildren.length > 0) {
        x = containerWidth / 2 - dagNode.width / 2;
      }

      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y + dagNode.height);

      return {
        ...node,
        position: { x, y },
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top,
      };
    });

    setContainerHeight(Math.max(800, maxY - minY + 100));

    return { visibleNodes: layoutedNodes, visibleEdges: vEdges };
  }, [expandedMap, nodeRefs.current]);

  return { visibleNodes, visibleEdges, containerHeight, maxHeight };
}
