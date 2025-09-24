import { useState, useCallback } from "react";
import { initialNodes } from "../pages/Employee/AgencyInformation/component/Organizational/dataTree";


export function useExpanded() {
  const [expandedMap, setExpandedMap] = useState<Record<string, boolean>>(
    Object.fromEntries(initialNodes.map((n) => [n.id, n.data.expanded]))
  );

  const toggleNode = useCallback((id: string) => {
    setExpandedMap((prev) => {
      const node = initialNodes.find((n) => n.id === id);
      if (!node) return prev;

      const parentLabel = node.data.reportsTo;
      const newExpanded = { ...prev };

      // collapse siblings
      initialNodes
        .filter((n) => n.data.reportsTo === parentLabel && n.id !== id)
        .forEach((sibling) => {
          newExpanded[sibling.id] = false;
        });

      newExpanded[id] = !prev[id];
      return newExpanded;
    });
  }, []);

  return { expandedMap, toggleNode };
}
