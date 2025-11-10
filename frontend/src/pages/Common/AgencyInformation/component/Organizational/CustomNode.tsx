import { memo, forwardRef } from "react";
import { Handle, Position } from "@xyflow/react";
import { Icon } from "@iconify/react/dist/iconify.js";
import type { OrgNodeData } from "../../../../../services/orgApi";

export type CustomNodeData = {
  node: OrgNodeData;

  expanded: boolean; // 👈 we'll pass id from React
};

export type CustomNodeProps = {
  id: string;
  data: CustomNodeData;
  onToggle?: (id: string) => void;
  fixedHeight?: number;
  fixedWidth?: number; // ✅ Add width
  onEdit?: (id:string) => void;
};

// 👇 forwardRef so Flow can attach refs
const CustomNode = forwardRef<HTMLDivElement, CustomNodeProps>(
  ({ id, data, onToggle, fixedHeight, fixedWidth, onEdit }, ref) => {
    return (
      <div
        ref={ref}
        className="p-8 p-lg-12 gap-10 d-flex flex-column radius-8 org-node shadow-sm position-relative "
        style={{
          minHeight: fixedHeight ? `${fixedHeight}px` : "auto",
          width: `${fixedWidth}px`,
        }} // ✅ Sync width style={{ minHeight: `${fixedHeight}px` }}
      >
        <Handle
          type="target"
          position={Position.Top}
          style={{ opacity: 0 }}
          isConnectable={false}
        />

        {/* Always visible header */}
        <div className="d-flex flex-row justify-content-between">
          <div className="d-flex flex-column flex-lg-row gap-12 w-100 justify-content-center justify-content-lg-start align-items-center">
            <div className="org-icon w-40-px h-40-px d-flex  justify-content-center align-items-center radius-8">
              <Icon
                icon="carbon:user-multiple"
                className="text-xl sm:text-xxl"
              />
            </div>
            <div className="d-flex flex-column gap-1 gap-lg-8">
              <h6 className="text-street-dark mb-0 fw-semibold text-center text-lg-start text-xs sm:text-sm">
                {data.node.label}
              </h6>
              <p className="text-xxs org-sub sm:text-xs text-center text-lg-start  fw-normal">
                {data.node.department}
              </p>
            </div>
          </div>
        </div>

        <div className="d-flex flex-grow-1 flex-column text-center text-lg-start  text-xxs sm:text-xs fw-normal gap-1 justify-content-evenly mt-2 transition-all overflow-hidden">
          <p>
            <span className="org-label">Reports to: </span>{" "}
            <span className="text-street-dark">
              {data.node.reportsTo?.label}
            </span>
          </p>
          <p className="d-inline-flex flex-column align-items-center flex-xl-row">
            <span className="org-label">Supervises:</span>{" "}
            {data.node.supervises?.length === 0 ? (
              <span className="text-street-dark">N/A</span>
            ) : (
              <span className="text-street-dark">
                {data.node.supervises.map((n) => n.label)?.join(", ")}
              </span>
            )}
          </p>
        </div>
        {onEdit && (
          <button
            className="btn btn-sm btn-light"
            style={{ height: "30px", fontSize: "12px" }}
            onClick={(e) => {
              e.stopPropagation();
              onEdit(id);
            }}
          >
            Edit
          </button>
        )}
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
