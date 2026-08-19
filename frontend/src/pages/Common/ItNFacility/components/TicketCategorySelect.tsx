import { useState } from "react";
import { Dropdown, Form, Spinner } from "react-bootstrap";
import {
  useGetTicketCategoriesQuery,
  useCreateTicketCategoryMutation,
  useDeleteTicketCategoryMutation,
  type TicketCategory,
} from "../../../../services/ticketCategoryApi";
import { showError, showSuccess } from "../../../../utills/toastutills";
import { getErrorMessage } from "../../../../utills/utills";
import useHasPermission from "../../../../hooks/Auth";

interface TicketCategorySelectProps {
  name: string;
  value: string;
  onChange: (id: string) => void;
  isInvalid?: boolean;
  errorMessage?: string;
}

const TicketCategorySelect: React.FC<TicketCategorySelectProps> = ({
  value,
  onChange,
  isInvalid,
  errorMessage,
}) => {
  const { hasPermission } = useHasPermission();
  const canManage = hasPermission({ action: "ticket_category_manage" });

  const {
    data: categoryData,
    isLoading: categoryLoading,
    isError: categoryError,
  } = useGetTicketCategoriesQuery({ isActive: "true" });

  const [createTicketCategory, { isLoading: isCreating }] =
    useCreateTicketCategoryMutation();
  const [deleteTicketCategory] = useDeleteTicketCategoryMutation();

  const [draftName, setDraftName] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const selectedCategory: TicketCategory | undefined = categoryData?.data.find(
    (c) => c._id === value,
  );

  const handleAdd = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;
    e.preventDefault();

    const trimmed = draftName.trim();
    if (!trimmed) return;

    try {
      const res = await createTicketCategory({ name: trimmed }).unwrap();
      if (res.success) {
        showSuccess(res.message);
        onChange(res.data._id);
        setDraftName("");
        setIsOpen(false);
      }
    } catch (error) {
      showError(getErrorMessage(error));
    }
  };

  const handleDelete = async (e: React.MouseEvent, categoryId: string) => {
    e.stopPropagation();

    setDeletingId(categoryId);
    try {
      const res = await deleteTicketCategory(categoryId).unwrap();
      if (res.success) {
        showSuccess(res.message);
        if (value === categoryId) onChange("");
      }
    } catch (error) {
      showError(getErrorMessage(error));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="d-flex flex-column gap-1">
      <Dropdown
        show={isOpen}
        onToggle={(next) => setIsOpen(next)}
        className="text-street-base w-100"
      >
        <Dropdown.Toggle
          variant="white"
          className={`w-100 d-flex justify-content-between align-items-center text-street-base text-start text-sm border-1 ticket-category-select-trigger ${
            isInvalid ? "border-danger" : ""
          }`}
          disabled={categoryLoading || categoryError}
          style={{
            borderColor: isInvalid ? undefined : "var(--street-border-base-50)",
          }}
        >
          {categoryLoading ? (
            <span style={{ color: "var(--street-gray-base-50)" }}>
              Loading...
            </span>
          ) : categoryError ? (
            <span className="text-danger">Failed to load</span>
          ) : selectedCategory ? (
            selectedCategory.name
          ) : (
            <span
              style={{ fontSize: "14px", color: "var(--street-gray-base-50)" }}
            >
              Select category
            </span>
          )}
        </Dropdown.Toggle>

        <Dropdown.Menu
          className="w-100 shadow-sm rounded-3 border-1 overflow-hidden p-0"
          style={{ borderColor: "var(--street-border-base-50)" }}
        >
          <div style={{ maxHeight: 240, overflowY: "auto" }}>
            {categoryData?.data.map((cat) => {
              const isSelected = value === cat._id;
              const isHovered = hoveredId === cat._id;
              return (
                <div
                  key={cat._id}
                  role="button"
                  onMouseEnter={() => setHoveredId(cat._id)}
                  onMouseLeave={() => setHoveredId(null)}
                  onClick={() => {
                    onChange(cat._id);
                    setIsOpen(false);
                  }}
                  className="d-flex justify-content-between align-items-center"
                  style={{
                    padding: "9px 14px",
                    cursor: "pointer",
                    backgroundColor: isSelected
                      ? "var(--street-primary-base-10)"
                      : isHovered
                        ? "var(--street-sidebar-accent)"
                        : "transparent",
                    fontWeight: isSelected ? 500 : 400,
                    transition: "background-color 120ms ease",
                  }}
                >
                  <span
                    style={{
                      fontSize: "14px",
                      color: isSelected
                        ? "var(--street-primary-base)"
                        : "var(--street-text-base)",
                    }}
                  >
                    {cat.name}
                  </span>

                  {canManage && (
                    <span
                      title="Delete category"
                      onClick={(e) => handleDelete(e, cat._id)}
                      className="d-flex align-items-center justify-content-center"
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: "50%",
                        fontSize: "0.75rem",
                        lineHeight: 1,
                        color: "#b3261e",
                        backgroundColor: isHovered
                          ? "rgba(179, 38, 30, 0.08)"
                          : "transparent",
                        opacity: deletingId === cat._id ? 0.4 : 1,
                        pointerEvents: deletingId === cat._id ? "none" : "auto",
                        flexShrink: 0,
                        marginLeft: 12,
                      }}
                    >
                      ✕
                    </span>
                  )}
                </div>
              );
            })}

            {categoryData?.data.length === 0 && (
              <div
                className="text-center text-sm"
                style={{ padding: "14px", color: "var(--street-gray-base-50)" }}
              >
                No categories found
              </div>
            )}
          </div>

          {canManage && (
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                padding: "8px 10px",
                borderTop: "1px solid var(--street-calendar-border)",
                backgroundColor: "var(--street-bg-f4)",
              }}
            >
              <div className="position-relative">
                <Form.Control
                  type="text"
                  size="sm"
                  placeholder="+ Add new category"
                  value={draftName}
                  onChange={(e) => setDraftName(e.target.value)}
                  onKeyDown={handleAdd}
                  disabled={isCreating}
                  className="shadow-none"
                  style={{
                    fontSize: "0.875rem",
                    border: "1px solid var(--street-border-base-50)",
                    borderRadius: 8,
                    backgroundColor: "var(--street-card)",
                    paddingRight: isCreating ? 32 : undefined,
                  }}
                />
                {isCreating && (
                  <Spinner
                    animation="border"
                    size="sm"
                    className="position-absolute end-0 top-50 translate-middle-y me-2"
                    style={{ color: "var(--street-primary-base)" }}
                  />
                )}
              </div>
            </div>
          )}
        </Dropdown.Menu>
      </Dropdown>

      {isInvalid && errorMessage && (
        <div className="text-danger mt-1" style={{ fontSize: "0.875rem" }}>
          {errorMessage}
        </div>
      )}
    </div>
  );
};

export default TicketCategorySelect;
