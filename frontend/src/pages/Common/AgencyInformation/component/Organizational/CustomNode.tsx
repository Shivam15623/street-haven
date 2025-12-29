import { memo, forwardRef } from "react";
import { Handle, Position } from "@xyflow/react";

import type { OrgNodeData } from "../../../../../services/orgApi";

export type CustomNodeData = {
  node: OrgNodeData;
  expanded: boolean; // 👈 we'll pass id from React
};

export type CustomNodeProps = {
  id: string;
  data: CustomNodeData;
  onToggle?: (id: string) => void;
  onOpenModal?: (node: OrgNodeData) => void;
  fixedHeight?: number;
  fixedWidth?: number; // ✅ Add width
};
function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/) // split by spaces
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

// 👇 forwardRef so Flow can attach refs
const CustomNode = forwardRef<HTMLDivElement, CustomNodeProps>(
  ({ id, data, onToggle, fixedHeight, onOpenModal, fixedWidth }, ref) => {
    return (
      <div
        ref={ref}
        onClick={() => onOpenModal?.(data.node)}
        className=" p-20 gap-10 d-flex flex-column org-node radius-12 shadow-sm position-relative "
        style={{
          minHeight: fixedHeight ? `${fixedHeight}px` : "auto",
          width: `${fixedWidth}px`,
          boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
          zIndex: 10, // ✅ Use reasonable z-index (10 is enough)
          position: "relative",
          pointerEvents: "auto",
          backgroundColor: "var(--street-card)",
        }} // ✅ Sync width style={{ minHeight: `${fixedHeight}px` }}
      >
        <Handle
          type="target"
          position={Position.Top}
          style={{ opacity: 0 }}
          isConnectable={false}
        />

        {/* Always visible header */}
        {data.node.profilePic !== "" ? (
          <img
            className="mx-auto rounded-circle w-80-px h-80-px mb-16"
            src={data.node.profilePic ?? "assets/images/userlogo.png"}
          />
        ) : (
          <div className="d-flex align-items-center mx-auto justify-content-center text-street-primary rounded-circle w-80-px h-80-px mb-16 bg-street-primary-10 text-2xl fw-semibold">
            {" "}
            {getInitials(data.node.name)}
          </div>
        )}

        <h3 className="text-lg text-street-dark fw-bold text-center">
          {data.node.name}
        </h3>
        <p className="text-sm text-street-primary fw-semibold text-center">
          {data.node.title}
        </p>

        {data.node.reportsTo !== null &&
          data.node.supervises &&
          data.node.supervises?.length > 0 && (
            <Handle
              type="source" // source handle
              position={Position.Bottom}
              className=""
              id={`toggle-${id}`} // unique id for handle
              style={{
                width: 20,
                height: 24,
                borderRadius: "50%",
                backgroundColor: "var(--street-primary-base)", // match your bg-street-primary
                color: "white",
                textAlign: "center",
                border: "0px",

                fontSize: "12px",

                cursor: "pointer",

                padding: "4px",
              }}
              onClick={(e) => {
                e.stopPropagation();

                onToggle?.(id);
              }}
            >
              {data.node.supervises?.length}
            </Handle>
          )}
        {data.node.reportsTo === null && (
          <Handle
            type="source"
            position={Position.Bottom}
            style={{ opacity: 0 }}
            isConnectable={false}
          />
        )}
      </div>
    );
  }
);

export default memo(CustomNode);
